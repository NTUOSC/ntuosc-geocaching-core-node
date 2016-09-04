'use strict';

const express = require('express')
const router  = express.Router()

const db = require('../models')
const mw = require('../middlewares')

const hider  = require('./hider')
const seeker = require('./seeker')
const stamp  = require('./stamp')

router
.post('/authentication', (req, res) => {
  res.send(404)
})
.use('/hider', hider)
.use('/seeker', seeker)
.use('/', stamp)
.get('/', (req, res) => {
  res.json({
  	hiders:  db.hider.getAll(),
  	seekers: db.seeker.getAll(),
  	stamps:  db.stamp.getAll()
  })
})

module.exports = router