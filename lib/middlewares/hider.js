'use strict';

const assign = require('deep-assign')

const roles = require('./geocaching').roles
const db    = require('../models')

// ==================================================
//
//  Filters
//
// ==================================================

const hiderFilter = (req, res, next) => {
  next()
}

// ==================================================
//
//  Handlers
//
// ==================================================

const getHidersHandler = (req, res) => {
  res.json(db.hider.getAll())
}

const getHiderByIdHandler = (req, res) => {
  let id = parseInt(req.params.hid)
  res.json(db.hider.getById(id))
}

const createHiderHandler = (req, res) => {
  db.hider.create(req.body)
  res.send(201) // created
}

const modifyHiderByIdHandler = (req, res) => {
  let id = parseInt(req.params.hid)
  let hider = db.hider.getById(id)
  assign(hider, req.body)
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
  filter: hiderFilter,
  handler: {
    getHiders:       getHidersHandler,
    getHiderById:    getHiderByIdHandler,
    createHider:     createHiderHandler,
    modifyHiderById: modifyHiderByIdHandler,
    setStateById:    setStateByIdHandler
  }
}