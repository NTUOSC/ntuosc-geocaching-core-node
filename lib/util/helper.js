'use strict';

const assign = require('deep-assign')

const noneHelper = (obj) => typeof(obj) === 'undeifned' || obj === null

const getDataHelper = (arr) => {
  if (noneHelper(arr))
    return null
  let flag   = false
  let result = []
  if (typeof(arr) === 'object' && !Array.isArray(arr)) {
    flag = true
    assign(result, [arr])
  }
  else
    assign(result, arr)
  result = result.map(obj => {
    if ('password' in obj)
      delete obj.password
    delete obj.meta
    return obj
  })
  return (flag)? result[0]: result
}

module.exports = {
  none:    noneHelper,
  getData: getDataHelper
}