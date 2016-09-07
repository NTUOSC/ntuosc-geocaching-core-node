'use strict';

const assign = require('deep-assign')

const roles = require('./geocaching').roles
const db    = require('../models')

const stampFilter = (req, res, next) => {
  req
  next()
}

const redemptionFilter = (req, res, next) => {
  next()
}

const getStampsHandler = (req, res) => {
  const role = req.geocaching.auth.role
  let stamps = db.stamp.getAll()
  let result = {}
  if (role >= roles.admin)
    assign(result, { data: stamps })
  assign(result, {
    stats: {
      count: stamps.length
    }
  })
  res.json(result)
}

const createStampHandler = (req, res) => {
  let hider  = db.hider.getById(req.body.hiderId)
  let seeker = db.seeker.getById(req.body.seekerId)
  let stid   = db.stamp.create(req.body)
  // make association
  hider.collection.push({  stamp: stid, seeker: req.body.seekerId })
  seeker.collection.push({ stamp: stid, hider:  req.body.hiderId })
  db.hider.update(hider)
  db.seeker.update(seeker)
  res.send(201)
}

const redemptionHandler = (req, res) => {
  db.stamp.create(req.body)
  res.send(201)
}

module.exports = {
  filter: {
    data: stampFilter,
    redemption: redemptionFilter
  },
  handler: {
    getStamps:   getStampsHandler,
    createStamp: createStampHandler,
    redemption:  redemptionHandler
  }
}