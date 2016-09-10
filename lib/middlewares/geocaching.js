'use strict';

const crypto = require('crypto')
const jwt    = require('jwt-simple')
const assign = require('deep-assign')

const db     = require('../models')
const helper = require('../util/helper')
const Logger = require('../util/logger')
const secret = require('../../config').jwt.secret

const roles  = {
  'public': 0, 'seeker': 1,
  'hider':  2, 'admin':  3
}
const defaultPayload = {
  role: roles.public,
  id:   0
}

// ==================================================
//
//  initGeocaching
//
// ==================================================
const initGeocaching = (req, res, next) => {
  let result = {
    data: {}
  }

  Logger.sys('Start initializing req.geocaching')
  Logger.info(`params: ${JSON.stringify(req.params)}`)
  Logger.info(`body: ${JSON.stringify(req.body)}`)

  // retrieve token
  let payload = assign({}, defaultPayload)
  try {
    payload = jwt.decode(req.body.token, secret)
  }
  catch (e) {}
  result.auth = payload

  // retrieve hider id
  if (typeof(req.params.hid) === 'string')
    result.hiderId = parseInt(req.params.hid)
  else if (!helper.none(result.auth) && result.auth.role >= roles.hider)
    result.hiderId = result.auth.id

  // retrieve seeker id
  if (typeof(req.params.sid) === 'string')
    result.seekerId = parseInt(req.params.sid)
  else if (!helper.none(result.auth) && result.auth.role === roles.seeker)
    result.seekerId = result.auth.id
  else {
    // cardId to seeker id
    if (typeof(req.body.cardId) === 'string') {
      let seeker = db.seeker.getByUnique('cardId', req.body.cardId)
      if ( !helper.none(seeker) )
        result.seekerId = seeker['$loki']
    }
  }

  // combine
  req.geocaching = assign({}, result)

  Logger.sys('After initializing req.geocaching')
  Logger.info(`req.geocaching ${JSON.stringify(req.geocaching)}`)
  Logger.sys('End initializing req.geocaching')

  next()
}

// ==================================================
//
//  Filters
//
// ==================================================

/**
 *  function: dataFilter
 *
 *  arguments:
 *    options - object
 *      > required - array of objects
 *        > name - string
 *        > type - string
 *      > optional - array of objects
 *        > name - string
 *        > type - string
 *
 *  return value:
 *    a middleware
 *      > 400, if required field doesn't exist in 'req.body'
 *
 *  description:
 *    > Store data into 'req.geocaching.data'
 *    > If data field is 'hiderId' and 'seekerId', it would try to retrieve data
 *      from 'req.geocaching.hiderId' and 'req.geocaching.hiderId', respectively.
**/
const dataFilter = (options) => {
  const checkField = ['hiderId', 'seekerId']
  options = assign({ required: [], optional: [] }, options)
  // returns a middleware
  return (req, res, next) => {
    Logger.sys('Start processing data')
    Logger.info(`req.geocaching ${JSON.stringify(req.geocaching)}`)
    Logger.info(`req.body ${JSON.stringify(req.body)}`)
    Logger.info(`options ${JSON.stringify(options)}`)

    // process required and optional fields
    const optional = options.optional.map(field => {
      field.required = false
      return field
    })
    const fields = options.required.map(field => {
      field.required = true
      return field
    }).concat(optional)

    let result = { data: {} }
    for (let field of fields) {
      // data from 'req.geocaching.hiderId' or 'req.geocaching.hiderId'
      if (checkField.some(check => check === field.name)) {
        if ( helper.none(req.body[field.name]) ) {
          req.body[field.name] = req.geocaching[field.name]
        }
      }
      // data from 'req.body'
      let data = req.body[field.name]
      // check existence and correctness of type
      if (helper.none(data) || typeof(data) !== field.type) {
        // if required data doesn't exist, then 400
        if (field.required) {
          res.sendStatus(400)
          return
        }
      }
      else
        result.data[field.name] = data
    }
    assign(req.geocaching, result)

    Logger.sys('After processing data')
    Logger.info(`req.geocaching ${JSON.stringify(req.geocaching)}`)
    Logger.sys('End processing data')
    next()
  }
}

// ==================================================
//
//  Auth Middlewares
//
// ==================================================

/**
 *  function: authChecker
**/
const authChecker = (options) => {
  options = (options || []).map(opt => {
    let result = {}
    if (typeof(opt) === 'string')
      assign(result, { role: opt })
    else
      assign(result, opt)
    return result
  })

  return (req, res, next) => {
    Logger.sys('Start checking auth.')
    Logger.info(`Options: ${JSON.stringify(options)}`)

    let checker = options.some(opt => {
      const auth = req.geocaching.auth
      // auth role === permission role
      if (auth.role === roles[opt.role]) {
        if (opt.only) {
          // admin or hider
          if (auth.role >= roles.hider) {
            if (auth.id !== req.geocaching.hiderId)
              return false
          }
          // seeker
          else if (auth.role === roles.seeker) {
            if (auth.id !== req.geocaching.seekerId)
              return false
          }
        }
      }
      else
        return false
      return true
    })

    if (!checker) {
      res.sendStatus(401)
      return
    }

    Logger.sys('End checking auth.')
    next()
  }
}

/**
 *  function: authTokenHandler
**/
const authTokenHandler = (req, res) => {
  let data    = req.geocaching.data
  let payload = assign({}, defaultPayload)

  console.log(JSON.stringify(req.geocaching))

  // try to find hider & seeker
  let hider   = db.hider.getByUnique('account', data.account)
  let seeker  = db.seeker.getByUnique('account', data.account)

  console.log(JSON.stringify(hider))
  console.log(JSON.stringify(seeker))
  // hider or admin
  if (!helper.none(hider)) {
    assign(payload, {
      role: (hider.admin)? roles.admin: roles.hider,
      id:   hider['$loki']
    })
  }
  // seeker
  else if (!helper.none(seeker)) {
    assign(payload, {
      role: roles.seeker,
      id:   seeker['$loki']
    })
  }
  // neither hider nor seeker
  else {
    res.sendStatus(404)
    return
  }

  // check password
  let user = hider || seeker
  const sha256 = crypto.createHmac('sha256', secret)
  sha256.update(data.password)
  data.password = sha256.digest('hex')
  // different hash code
  if (data.password !== user.password) {
    res.sendStatus(403)
    return
  }

  // token
  res.send(jwt.encode(payload, secret))
}

module.exports = {
  init:  initGeocaching,
  data:  dataFilter,
  roles: roles,
  auth: {
    token: authTokenHandler,
    check: authChecker
  }
}