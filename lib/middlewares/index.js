'use strict';

const hider      = require('./hider')
const seeker     = require('./seeker')
const stamp      = require('./stamp')
const geocaching = require('./geocaching')

const rootHandler = (req, res) => {
  res.json({
    hiders:  db.hider.getAll(),
    seekers: db.seeker.getAll(),
    stamps:  db.stamp.getAll()
  })
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