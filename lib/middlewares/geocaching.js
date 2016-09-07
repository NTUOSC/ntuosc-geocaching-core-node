'use strict';

const jwt    = require('jwt-simple')
const assign = require('deep-assign')
const crypto = require('crypto')

const db     = require('../models')
const config = require('../../config')
const helper = require('../util/helper')

const secret = config.jwt.secret

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
      let seeker = db.seeker.get({ 'cardId': req.body.cardId })
      if ( !helper.none(seeker) )
        result.seekerId = seeker['$loki']
    }
  }

  // combine
  req.geocaching = assign(req.geocaching, result)
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
  // returns a middleware
  return (req, res, next) => {
    // empty argument
    if (helper.none(options))
      next()

    // process required and optional fields
    const reqired = (options.reqired || []).map(field => {
      field.required = true
      return field
    })
    const optional = (options.optional || []).map(field => {
      field.reqired = false
      return field
    })
    const fields = reqired.concat(optional)

    let result = { data: {} }
    fields.forEach(field => {
      // data from 'req.geocaching.hiderId' or 'req.geocaching.hiderId'
      if (checkField.some(check => check === field.name)) {
        if ( helper.none(req.body[field.name]) )
          req.body[field.name] = req.geocaching[field.name]
      }
      // data from 'req.body'
      let data = req.body[field.name]
      // check existence and correctness of type
      if (helper.none(data) || typeof(data) !== field.type) {
        // if required data doesn't exist, then 400
        if (field.reqired)
          res.send(400)
      }
      else
        result.data[field.name] = data
    })
    assign(req.geocaching, result)
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
  options = (options || []).map(option => {
    let result = {}
    if (typeof(option) === 'string')
      assign(result, { role: option })
    else
      assign(result, option)
    return result
  })
  let checker = options.some(option => {
    const auth = req.geocaching.auth
    // auth role === permission role
    if (auth.role === roles[option.role]) {
      if (option.only) {
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
  return (req, res, next) => {
    if (!checker)
      res.send(401)
    next()
  }
}

/**
 *  function: authTokenHandler
**/
const authTokenHandler = (req, res) => {
  let data    = req.geocaching.data
  let payload = assign({}, defaultPayload)
  // try to find hider & seeker
  let hider   = db.hider.get({  account: data.account })
  let seeker  = db.seeker.get({ account: data.account })
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
  else
    res.send(404)
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