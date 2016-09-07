'use strict';

const noneHelper = (obj) => {
  let types = ['undefined', 'null']
  return types.some(type => typeof(obj) === type)
}

module.exports = {
  none: noneHelper
}