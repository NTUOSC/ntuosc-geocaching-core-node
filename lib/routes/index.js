'use strict';

const express = require('express')
const router  = express.Router()

const mw      = require('../middlewares')

router

// ==================================================
//
//  middleware: mw.geocaching.init
//    inititialize data with object 'req.geocaching'
//
// ==================================================
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
.get('/hider', [
  mw.geocaching.auth.check([   // authorization
    'admin', 'hider', 'seeker', 'public'
  ]),
  mw.geocaching.data({         // parse data
  }),
  mw.hider.handler.getHiders
])
/**
 *  POST /hider
**/
.post('/hider', [
  mw.geocaching.auth.check([   // authorization
    'admin'
  ]),
  mw.geocaching.data({         // parse data
    required: [
      { name: 'account',  type: 'string' },
      { name: 'password', type: 'string' }
    ],
    optional: [
      { name: 'name',     type: 'string' },
      { name: 'personal', type: 'object' }
    ]
  }),
  mw.hider.filter.createHider,
  mw.hider.handler.createHider
])
/**
 *  GET /hider/:hid
**/
.get('/hider/:hid', [
  mw.geocaching.auth.check([   // authorization
    'admin', 'hider', 'seeker', 'public'
  ]),
  mw.geocaching.data({         // parse data
  }),
  mw.hider.filter.getHiderById,
  mw.hider.handler.getHiderById
])
/**
 *  PUT /hider/:hid
**/
.put('/hider/:hid', [
  mw.geocaching.auth.check([   // authorization
    'admin', { role: 'hider', only: true }
  ]),
  mw.geocaching.data({         // parse data
    optional: [
      { name: 'password', type: 'string' },
      { name: 'name',     type: 'string' },
      { name: 'personal', type: 'object' }
    ]
  }),
  mw.hider.filter.modifyHiderById,
  mw.hider.handler.modifyHiderById
])
/**
 *  PUT /hider/:hid/validation/:state
**/
.put('/hider/:hid/validation/:state', [
  mw.geocaching.auth.check([   // authorization
    'admin'
  ]),
  mw.geocaching.data({         // parse data
  }),
  mw.hider.filter.setStateById,
  mw.hider.handler.setStateById
])

// ==================================================
//
//  route: /seeker
//
// ==================================================
/**
 *  GET /seeker
**/
.get('/seeker', [
  mw.geocaching.auth.check([   // authorization
    'admin', 'hider', 'seeker', 'public'
  ]),
  mw.geocaching.data({         // parse data
  }),
  mw.seeker.handler.getSeekers
])
/**
 *  POST /seeker
**/
.post('/seeker', [
  mw.geocaching.auth.check([   // authorization
    'admin', 'hider'
  ]),
  mw.geocaching.data({         // parse data
    required: [
      { name: 'cardId',   type: 'string' }
    ],
    optional: [
      { name: 'account',  type: 'string' },
      { name: 'password', type: 'string' },
      { name: 'personal', type: 'object' }
    ]
  }),
  mw.seeker.filter.createSeeker,
  mw.seeker.handler.createSeeker
])
/**
 *  HEAD /seeker
**/
.head('/seeker', [
  mw.geocaching.auth.check([   // authorization
    'admin', 'hider', 'seeker'
  ]),
  mw.geocaching.data({         // parse data
    optional: [
      { name: 'cardId',  type: 'string' },
      { name: 'account', type: 'string' }
    ]
  }),
  mw.seeker.handler.checkValid
])
/**
 *  GET /seeker/:sid
**/
.get('/seeker/:sid', [
  mw.geocaching.auth.check([   // authorization
    'admin', 'hider', { role: 'seeker', only: true }
  ]),
  mw.geocaching.data({         // parse data
  }),
  mw.seeker.filter.getSeekerById,
  mw.seeker.handler.getSeekerById
])
/**
 *  PUT /seeker/:sid
**/
.put('/seeker/:sid', [
  mw.geocaching.auth.check([   // authorization
    'admin', 'hider', { role: 'seeker', only: true }
  ]),
  mw.geocaching.data({         // parse data
    optional: [
      { name: 'account',  type: 'string' },
      { name: 'password', type: 'string' },
      { name: 'personal', type: 'object' }
    ]
  }),
  mw.seeker.filter.modifySeekerById,
  mw.seeker.handler.modifySeekerById
])

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
  mw.stamp.filter.createStamp, // check validation from data
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
.get('/', [
  mw.geocaching.auth.check([   // authorization
    'admin', 'hider', 'seeker', 'public'
  ]),
  mw.handler.root
])

module.exports = router;