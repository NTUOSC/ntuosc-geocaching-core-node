'use strict';

const express = require('express')
const router  = express.Router()

const assign = require('deep-assign')
const db     = require('../models')
const mw     = require('../middlewares')

router
/**
 *  middleware: mw.geocaching.init
 *    inititialize data with object 'req.geocaching'
**/
.use(mw.geocaching.init)

// ==================================================
//
//  route: /authentication
//
// ==================================================
/**
 *  POST /authentication
**/
.post('/authentication', [
  mw.geocaching.data({
    required: [
      { name: 'account',  type: 'string' },
      { name: 'password', type: 'string' }
    ]
  }),
  mw.geocaching.auth.token
])

// ==================================================
//
//  route: /hider
//
// ==================================================
/**
 *  GET /hider
**/
.get('/hider/', mw.hider.handler.getHiders)
/**
 *  POST /hider
**/
.post('/hider/', mw.hider.handler.createHiderHandler)
/**
 *  GET /hider/:hid
**/
.get('/hider/:hid', mw.hider.handler.getHiderById)
/**
 *  PUT /hider/:hid
**/
.put('/hider/:hid', mw.hider.handler.modifyHiderById)
/**
 *  PUT /hider/:hid/validation/:state
**/
.put('/hider/:hid/validation/:state', mw.hider.handler.setValidationStateById)

// ==================================================
//
//  route: /seeker
//
// ==================================================
router
/**
 *  GET /seeker
**/
.get('/seeker/', mw.seeker.handler.getSeekers)
/**
 *  POST /seeker
**/
.post('/seeker/', mw.seeker.handler.createSeeker)
/**
 *  HEAD /seeker
**/
.head('/seeker/', mw.seeker.handler.checkValid)
/**
 *  GET /seeker/:sid
**/
.get('/seeker/:sid', mw.seeker.handler.getSeekerById)
/**
 *  PUT /seeker/:sid
**/
.put('/seeker/:sid', mw.seeker.handler.modifySeekerById)

// ==================================================
//
//  route: /stamp
//
// ==================================================
/**
 *  GET /stamp
**/
.get('/stamp', [
  mw.geocaching.auth.check([   // authorization
    'admin', 'hider', 'seeker', 'public'
  ]),
  mw.stamp.handler.getStamps   // take action
])
/**
 *  POST /stamp
**/
.post('/stamp', [
  mw.geocaching.auth.check([   // authorization
    'admin', 'hider'
  ]),
  mw.geocaching.data({         // parse data
    required: [
      { name: 'hiderId',  type: 'number' },
      { name: 'seekerId', type: 'number' }
    ]
  }),
  mw.stamp.filter.data,        // check validation from data
  mw.stamp.handler.createStamp // take action
])

// ==================================================
//
//  route: /redemption
//
// ==================================================
/**
 *  POST /redemption
**/
.post('/redemption', [
  mw.geocaching.auth.check([   // authorization
    'admin'
  ]),
  mw.geocaching.data({         // parse data
    required: [
      { name: 'hiderId',  type: 'number' },
      { name: 'seekerId', type: 'number' }
    ]
  }),
  mw.stamp.filter.redemption,
  mw.stamp.handler.redemption
])

// ==================================================
//
//  route: /
//
// ==================================================
/**
 *  GET /
**/
.get('/', mw.handler.root)

module.exports = router;