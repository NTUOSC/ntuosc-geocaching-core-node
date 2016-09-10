'use strict';

const crypto = require('crypto')
const assign = require('deep-assign')

const roles  = require('./geocaching').roles
const db     = require('../models')
const helper = require('../util/helper')
const secret = require('../../config').jwt.secret

const seekerAccountRegex = /^[A-Za-z0-9]{3,64}$/

// ==================================================
//
//  Filters
//
// ==================================================

const getSeekerByIdFilter = (req, res, next) => {
  if (helper.none(req.geocaching.seekerId)) {
    res.sendStatus(400)
    return
  }

  const seeker = db.seeker.getById(req.geocaching.seekerId)
  if (helper.none(seeker)) {
    res.sendStatus(404)
    return
  }
  next()
}

const createSeekerFilter = (req, res, next) => {
  let data = req.geocaching.data
  let seeker

  // check cardId
  seeker = db.seeker.getByUnique('cardId', data.cardId)
  if (!helper.none(seeker)) {
    res.sendStatus(400) // 400 if cardId exists
    return
  }

  // check account
  if (!helper.none(data.account)) {
    if (!seekerAccountRegex.test(data.account)) {
      res.sendStatus(400) // Format not allowed
      return
    }
    seeker = db.seeker.get({ account: data.account })
    if (!helper.none(seeker)) {
      res.sendStatus(400) // 400 if account exists
      return
    }

    // password
    if (helper.none(data.password)) {
      res.sendStatus(400)
      return
    }
    const sha256 = crypto.createHmac('sha256', secret)
    sha256.update(data.password)
    data.password = sha256.digest('hex')
  }

  assign(req.geocaching.data, {
    collection: [],
    redemption: false,
    personal:   {}
  })

  next()
}

const modifySeekerByIdFilter = (req, res, next) => {
  let data = req.geocaching.data

  if (helper.none(req.geocaching.seekerId)) {
    res.sendStatus(400)
    return
  }

  const seeker = db.seeker.getById(req.geocaching.seekerId)
  if (helper.none(seeker)) {
    res.sendStatus(404) // 404 if not found
    return
  }

  // check account
  if (!helper.none(data.account)) {
    if (!seekerAccountRegex.test(data.account)) {
      res.sendStatus(400) // Format not allowed
      return
    }
  }

  // check password
  if (!helper.none(data.password)) {
    const sha256 = crypto.createHmac('sha256', secret)
    sha256.update(data.password)
    data.password = sha256.digest('hex')
  }

  next()
}

// ==================================================
//
//  Handlers
//
// ==================================================

const getSeekersHandler = (req, res) => {
  const auth  = req.geocaching.auth
  let seekers = helper.getData(db.seeker.getAll())
  let result  = {}
  // 
  if (auth.role >= roles.hider)
    assign(result, { data: seekers })
  else if (auth.role === roles.seeker)
    assign(result, { data: [ db.seeker.getById(auth.id) ] })
  else
    assign(result, { data: [] })
  // statistics data
  assign(result, {
    stats: {
      count: seekers.length
    }
  })
  res.json(result)
}

const getSeekerByIdHandler = (req, res) => {
  const seeker = helper.getData(db.seeker.getById(req.geocaching.seekerId))
  res.json(seeker)
}

const createSeekerHandler = (req, res) => {
  const sid = db.seeker.create(req.geocaching.data)
  res.sendStatus(201) // created
}

const modifySeekerByIdHandler = (req, res) => {
  let seeker = db.seeker.getById(req.geocaching.seekerId)
  assign(seeker, req.geocaching.data)
  db.seeker.update(seeker)
  res.sendStatus(200) // OK
}

const checkValidHandler = (req, res) => {
  const data = req.geocaching.data
  // cardId
  if (!helper.none(data.cardId)) {
    const count = db.seeker.count({ cardId: data.cardId })
    if (count < 1) {
      res.sendStatus(200) // OK
      return
    }
  }

  // account
  else if (!helper.none(data.account)) {
    const count = db.seeker.count({ account: data.account })
    if (count < 1) {
      res.sendStatus(200) // OK
      return
    }
  }

  res.sendStatus(403)
}

module.exports = {
  filter: {
    getSeekerById:    getSeekerByIdFilter,
    createSeeker:     createSeekerFilter,
    modifySeekerById: modifySeekerByIdFilter
  },
  handler: {
    getSeekers:       getSeekersHandler,
    getSeekerById:    getSeekerByIdHandler,
    createSeeker:     createSeekerHandler,
    modifySeekerById: modifySeekerByIdHandler,
    checkValid:       checkValidHandler
  }
}