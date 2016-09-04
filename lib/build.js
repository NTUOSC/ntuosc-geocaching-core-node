'use strict';

const fs     = require('fs')
const path   = require('path')
const chalk  = require('chalk')
const loki   = require('lokijs')
const Logger = require('./util/logger')

const config = require('../config')

var createDatabase = function() {
  let db = new loki(config.database.file);

  db.loadDatabase({}, () => {
    config.database.init.forEach((prop) => {
      if ( !db.getCollection(prop.name) ) {
        db.addCollection(prop.name, prop.options);
        Logger.info('Create collection ' + chalk.magenta(prop.name) + '.');
      }
      else {
        Logger.info('Collection ' + chalk.magenta(prop.name) + ' has been created.');
      }
    })
    db.saveDatabase();
    Logger.sys('End building database.');
  })
}

Logger.sys('Start building database.');

fs.access(config.database.dir, fs.constants.F_OK, (err) => {
  if (err) {
    Logger.warn(chalk.magenta(config.database.dir) + ' not exists.');
    Logger.info('Start create directory ' + chalk.magenta(config.database.dir));
    fs.mkdir(config.database.dir, () => {
      Logger.info('Directory ' + chalk.magenta(config.database.dir) + ' build complete.');
      createDatabase();
    })
  }
  else {
    createDatabase();
  }
})