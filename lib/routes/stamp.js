'use strict';

const express = require('express')
const router  = express.Router()

const db      = require('../models')

router
/**
 *  GET /stamp
**/
.get('/', (req, res) => {
  res.json(req.body)
})
/**
 *  POST /stamp
**/
.post('/', (req, res) => {
  res.json({ 'gg': 'qq' })
})

module.exports = router;