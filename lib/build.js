'use strict';

const fs     = require('fs')
const path   = require('path')
const chalk  = require('chalk')
const loki   = require('lokijs')
const assign = require('deep-assign')

const helper = require('./util/helper')
const Logger = require('./util/logger')
const config = require('../config')

Logger.sys('Start building database.')

fs.access(config.database.dir, fs.constants.F_OK, err => {
  // create directory if not exist
  if (err) {
    Logger.warn(`${chalk.magenta(config.database.dir)} not exists.`)
    Logger.info(`Start create directory ${chalk.magenta(config.database.dir)}`)
    fs.mkdirSync(config.database.dir)
    Logger.info(`Directory ${chalk.magenta(config.database.dir)} build complete.`)
  }

  // open a database
  let db = new loki(config.database.file)

  const init = assign({ collection: [] }, config.database.init)

  db.loadDatabase({}, () => {
    // set collection
    init.collection.forEach(prop => {
      if ( !db.getCollection(prop.name) ) {
        db.addCollection(prop.name, prop.options)
        Logger.info(`Create collection ${chalk.magenta(prop.name)}.`)
      }
      else {
        Logger.info(`Collection ${chalk.magenta(prop.name)} has been created.`)
      }
    })
    // set admin
    if ( !helper.none(init.admin) && helper.none(db.getCollection('hiders').by('account', init.admin.account)) )
      db.getCollection('hiders').insert(init.admin)
    // save database
    db.saveDatabase()
    Logger.sys('End building database.')
  })
})