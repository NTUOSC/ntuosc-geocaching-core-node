'use strict';

const assign = require('deep-assign')

const helper = require('../util/helper')
const db     = require('../models')
const roles  = require('./geocaching').roles

// ==================================================
//
//  Filters
//
// ==================================================

const createStampFilter = (req, res, next) => {
  const hider  = db.hider.getById(req.geocaching.hiderId)
  const seeker = db.seeker.getById(req.geocaching.seekerId)
  // invalid hider and seeker id
  if (helper.none(hider) || helper.none(seeker))
    res.send(400)
  const stamp  = db.stamp.get({
    hiderId:  req.geocaching.hiderId,
    seekerId: req.geocaching.seekerId
  })
  // already created and conflict
  if (!helper.none(stamp))
    res.send(409)
  // add date
  req.geocaching.time = new Date()
  next()
}

const redemptionFilter = (req, res, next) => {
  if (helper.none(req.geocaching.seekerId))
    res.send(400)
  const seeker = db.seeker.getById(req.geocaching.seekerId)
  if (helper.none(seeker))
    res.send(400)
  const numOfHider = db.hider.count()
  if (seeker.collection.length < numOfHider)
    res.send(400)
  next()
}

// ==================================================
//
//  Handlers
//
// ==================================================

const getStampsHandler = (req, res) => {
  const role = req.geocaching.auth.role
  let stamps = db.stamp.getAll()
  let result = {}
  // for admin
  if (role >= roles.admin)
    assign(result, { data: stamps })
  // statistics data
  assign(result, {
    stats: {
      count: stamps.length
    }
  })
  res.json(result)
}

const createStampHandler = (req, res) => {
  const hid  = req.geocaching.hiderId
  const sid  = req.geocaching.seekerId
  const stid = db.stamp.create(req.geocaching.data)
  let hider  = db.hider.getById(hid)
  let seeker = db.seeker.getById(sid)
  // make association
  hider.collection.push({  stamp: stid, seeker: sid })
  seeker.collection.push({ stamp: stid, hider:  hid })
  db.hider.update(hider)
  db.seeker.update(seeker)
  // created
  res.send(201)
}

const redemptionHandler = (req, res) => {
  let seeker = db.seeker.getById(req.geocaching.seekerId)
  seeker.redemption = true
  db.seeker.update(seeker)
  res.send(200)
}

module.exports = {
  filter: {
    createStamp: createStampFilter,
    redemption:  redemptionFilter
  },
  handler: {
    getStamps:   getStampsHandler,
    createStamp: createStampHandler,
    redemption:  redemptionHandler
  }
}