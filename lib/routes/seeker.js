'use strict';

const express = require('express')
const assign  = require('deep-assign')
const router  = express.Router()

const db = require('../models')
const mw = require('../middlewares')

router
/**
 *  GET /seeker
**/
.get('/', (req, res) => {
  res.json(db.seeker.getAll())
})
/**
 *  POST /seeker
**/
.post('/', (req, res) => {
  db.seeker.create(req.body)
  res.send(201) // created
})
/**
 *  GET /seeker/:sid
**/
.get('/:sid', (req, res) => {
  let id = parseInt(req.params.sid)
  res.json(db.seeker.getById(id))
})
/**
 *  PUT /seeker/:sid
**/
.put('/:sid', (req, res) => {
  let id = parseInt(req.params.sid)
  let seeker = db.seeker.getById(id)
  assign(seeker, req.body)
  db.seeker.update(seeker)
  res.send(200) // OK
})

module.exports = router;