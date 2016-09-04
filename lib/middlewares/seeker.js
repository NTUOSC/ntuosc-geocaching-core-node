'use strict';

const seekerFilter = (req, res, next) => {
  next()
}

module.exports = {
  filter: seekerFilter
}