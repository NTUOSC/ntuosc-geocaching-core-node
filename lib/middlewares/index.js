'use strict';

const hider      = require('./hider')
const seeker     = require('./seeker')
const stamp      = require('./stamp')
const geocaching = require('./geocaching')

const db         = require('../models')
const helper     = require('../util/helper')

const rootHandler = (req, res) => {
  let result = {
    hiders:  helper.getData(db.hider.getAll()),
    seekers: helper.getData(db.seeker.getAll()),
    stamps:  helper.getData(db.stamp.getAll())
  }
  res.json(result)
}

module.exports = {
  hider:      hider,
  seeker:     seeker,
  stamp:      stamp,
  geocaching: geocaching,
  handler: {
    root: rootHandler
  }
}