'use strict';

const express = require('express')
const assign  = require('deep-assign')
const router  = express.Router()

const db = require('../models')
const mw = require('../middlewares')

router
/**
 *  GET /hider
**/
.get('/', (req, res) => {
  res.json(db.hider.getAll())
})
/**
 *  POST /hider
**/
.post('/', (req, res) => {
  db.hider.create(req.body)
  res.send(201) // created
})
/**
 *  GET /hider/:hid
**/
.get('/:hid', (req, res) => {
  let id = parseInt(req.params.hid)
  res.json(db.hider.getById(id))
})
/**
 *  PUT /hider/:hid
**/
.put('/:hid', (req, res) => {
  let id = parseInt(req.params.hid)
  let hider = db.hider.getById(id)
  assign(hider, req.body)
  db.hider.update(hider)
  res.send(200) // OK
})
/**
 *  PUT /hider/:hid/validation/:state
**/
.put('/:hid/validation/:state', (req, res) => {
  let id = parseInt(req.params.hid)
  let hider = db.hider.getById(id)
  hider.validation = (req.params.state === 'enable')
  db.hider.update(hider)
  res.send(200) // OK
})

module.exports = router;