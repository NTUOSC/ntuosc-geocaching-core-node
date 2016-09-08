'use strict';

const assign = require('deep-assign')

const roles = require('./geocaching').roles
const db    = require('../models')

const seekerFilter = (req, res, next) => {
  next()
}

const getSeekersHandler = (req, res) => {
  res.json(db.seeker.getAll())
}

const getSeekerByIdHandler = (req, res) => {
  let id = parseInt(req.params.sid)
  res.json(db.seeker.getById(id))
}

const createSeekerHandler = (req, res) => {
  db.seeker.create(req.body)
  res.send(201) // created
}

const modifySeekerByIdHandler = (req, res) => {
  let id = parseInt(req.params.sid)
  let seeker = db.seeker.getById(id)
  assign(seeker, req.body)
  db.seeker.update(seeker)
  res.send(200) // OK
}

const checkValidHandler = (req, res) => {
  res.send(200) // OK
}

module.exports = {
  filter: seekerFilter,
  handler: {
    getSeekers:       getSeekersHandler,
    getSeekerById:    getSeekerByIdHandler,
    createSeeker:     createSeekerHandler,
    modifySeekerById: modifySeekerByIdHandler,
    checkValid:       checkValidHandler
  }
}