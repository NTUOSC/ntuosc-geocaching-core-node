'use strict';

const chalk = require('chalk')

const _log = (tag) => {
  return (msg) => { console.log(`[${tag}] ${msg}`) }
}

module.exports = {
  info: _log( chalk.green('INFO') ),
  warn: _log( chalk.yellow('WARN') ),
  sys:  _log( chalk.cyan('SYS ') )
}