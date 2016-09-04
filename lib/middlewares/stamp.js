'use strict';

const stampFilter = (req, res, next) => {
  next()
}

const redemptionMiddleware = (req, res, next) => {
  next()
}

module.exports = {
  filter: stampFilter,
  redemption: redemptionMiddleware
}