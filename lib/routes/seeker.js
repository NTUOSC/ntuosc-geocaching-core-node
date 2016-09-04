'use strict';

const express = require('express')
const router  = express.Router()

const db      = require('../models')

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
  db.seeker.insert(req.body)
  res.json(req.body)
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
.put('/:sid')

module.exports = router;