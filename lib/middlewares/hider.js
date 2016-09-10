'use strict';

const crypto = require('crypto')
const assign = require('deep-assign')

const roles  = require('./geocaching').roles
const db     = require('../models')
const helper = require('../util/helper')
const secret = require('../../config').jwt.secret

const hiderAccountRegex = /^club_[A-Za-z0-9]{3,59}$/

// ==================================================
//
//  Filters
//
// ==================================================

const getHiderByIdFilter = (req, res, next) => {
  if (helper.none(req.geocaching.hiderId))
    res.send(400)

  const hider = db.hider.getById(req.geocaching.hiderId)
  if (helper.none(hider))
    res.send(404)
  next()
}

const createHiderFilter = (req, res, next) => {
  let data = req.geocaching.data
  let hider

  // check account
  if (!hiderAccountRegex.text(data.account))
    res.send(400) // Format not allowed
  hider = db.hider.get({ account: data.account })
  if (!helper.none(hider))
    res.send(400) // 400 if account exists

  // password
  const sha256 = crypto.createHmac('sha256', secret)
  sha256.update(data.password)
  data.password = sha256.digest('hex')

  assign(req.geocaching.data, {
    admin:      false,
    validation: false,
    collection: [],
    personal:   {}
  })

  next()
}

const modifyHiderByIdFilter = (req, res, next) => {
  let data = req.geocaching.data

  if (helper.none(req.geocaching.hiderId))
    res.send(400)

  const hider = db.hider.getById(req.geocaching.hiderId)
  if (helper.none(hider))
    res.send(404) // 404 if not found

  // check account
  if (!helper.none(data.account)) {
    if (!hiderAccountRegex.text(data.account))
      res.send(400) // Format not allowed
  }

  // check password
  if (!helper.none(data.password)) {
    const sha256 = crypto.createHmac('sha256', secret)
    sha256.update(data.password)
    data.password = sha256.digest('hex')
  }

  next()
}

const setStateByIdFilter = (req, res, next) => {
  if (helper.none(req.geocaching.hiderId) || helper.none(req.params.state))
    res.send(400)
  next()
}

// ==================================================
//
//  Handlers
//
// ==================================================

const getHidersHandler = (req, res) => {
  const auth = req.geocaching.auth
  let hiders = db.hider.getAll()
  let result = {}
  // 
  assign(result, { data: hiders })
  // statistics data
  assign(result, {
    stats: {
      count: hiders.length
    }
  })
  res.json(result)
}

const getHiderByIdHandler = (req, res) => {
  res.json(db.hider.getById(req.geocaching.hiderId))
}

const createHiderHandler = (req, res) => {
  const sid = db.hider.create(req.geocaching.data)
  res.send(201) // created
}

const modifyHiderByIdHandler = (req, res) => {
  let hider = db.hider.getById(req.geocaching.hiderId)
  assign(hider, req.geocaching.data)
  db.hider.update(hider)
  res.send(200) // OK
}

const setStateByIdHandler = (req, res) => {
  let id = parseInt(req.params.hid)
  let hider = db.hider.getById(id)
  hider.validation = (req.params.state === 'enable')
  db.hider.update(hider)
  res.send(200) // OK
}

module.exports = {
  filter: {
    getHiderById:    getHiderByIdFilter,
    createHider:     createHiderFilter,
    modifyHiderById: modifyHiderByIdFilter,
    setStateById:    setStateByIdFilter
  },
  handler: {
    getHiders:       getHidersHandler,
    getHiderById:    getHiderByIdHandler,
    createHider:     createHiderHandler,
    modifyHiderById: modifyHiderByIdHandler,
    setStateById:    setStateByIdHandler
  }
}