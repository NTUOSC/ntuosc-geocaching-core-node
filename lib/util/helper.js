'use strict';

const assign = require('deep-assign')

const noneHelper = (obj) => typeof(obj) === 'undefined' || obj === null

const getDataHelper = (arr) => arr

module.exports = {
  none:    noneHelper,
  getData: getDataHelper
}