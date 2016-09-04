var chalk = require('chalk')

var _log = function(tag) {
  return function (msg) { console.log('[' + tag + '] ' + msg) }
}

module.exports = {
  info: _log( chalk.green('INFO') ),
  warn: _log( chalk.yellow('WARN') ),
  sys:  _log( chalk.cyan('SYS ') )
}