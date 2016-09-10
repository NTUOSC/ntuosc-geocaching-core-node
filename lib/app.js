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
// ==================================================
app
/**
 *  CORS
**/
.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})
.use(morgan('combined'))
.use(bodyParser.urlencoded())
.use('/', router)

// ==================================================
// ==================================================
https
.createServer(config.ssl, app)
.listen(config.port, () => {
  Logger.info(`Start listen port ${config.port}`)
})