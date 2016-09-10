'use strict';

const https      = require('https')
const express    = require('express')
const bodyParser = require('body-parser')
const morgan     = require('morgan')

const router = require('./routes')
const mw     = require('./middlewares')
const Logger = require('./util/logger')

const config = require('../config')

var app = express()

// ==================================================
//
//  express app
//
// ==================================================
app
/**
 *  CORS
**/
.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})
/**
 *  logger
**/
.use(morgan('combined'))
/**
 *  data form
**/
.use(bodyParser.urlencoded())
/**
 *  router
**/
.use('/', router)

// ==================================================
//
//  https server
//
// ==================================================
https
.createServer(config.ssl, app)
.listen(config.port, () => {
  Logger.info(`Start listen port ${config.port}`)
})