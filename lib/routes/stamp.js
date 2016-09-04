'use strict';

const express = require('express')
const router  = express.Router()

const db = require('../models')
const mw = require('../middlewares')

router
/**
 *  GET /stamp
**/
.get('/stamp', (req, res) => {
  res.json(db.stamp.getAll())
})
/**
 *  POST /stamp
**/
.post('/stamp', mw.stamp.filter, (req, res) => {
  let hider = db.hider.getById(req.body.hiderId)
  let seeker = db.seeker.getById(req.body.seekerId)
  let stid = db.stamp.create(req.body)
  // make association
  hider.collection.push({  stamp: stid, seeker: req.body.seekerId })
  seeker.collection.push({ stamp: stid, hider:  req.body.hiderId })
  db.hider.update(hider)
  db.seeker.update(seeker)
  res.send(201)
})
/**
 *  POST /redemption
**/
.post('/redemption', mw.stamp.redemption, (req, res) => {
  db.stamp.create(req.body)
  res.send(201)
})

module.exports = router;