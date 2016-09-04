'use strict';

const auth   = require('./auth')
const hider  = require('./hider')
const seeker = require('./seeker')
const stamp  = require('./stamp')

module.exports = {
  auth: auth,
  hider: hider,
  seeker: seeker,
  stamp: stamp
}