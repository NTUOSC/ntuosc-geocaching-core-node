'use strict';

const express = require('express')
const router  = express.Router()

const db      = require('../models')

const seeker = require('./seeker')
const stamp  = require('./stamp')

router
.use('/seeker', seeker)
.use('/stamp',  stamp)
.get('/', (req, res) => {
  res.send(202)
})

module.exports = router