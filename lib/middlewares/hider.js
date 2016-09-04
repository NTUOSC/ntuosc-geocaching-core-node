'use strict';

const hiderFilter = (req, res, next) => {
  next()
}

module.exports = {
  filter: hiderFilter
}