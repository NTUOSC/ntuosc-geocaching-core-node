'use strict';

const fs     = require('fs')
const path   = require('path')
const loki   = require('lokijs')
const Logger = require('../util/logger')

const config = require('../../config')

var db = new loki(config.database.file, {
  autosave: true,
  autoload: true
})

class DbCollectionControl {
  // constructor
  constructor(name) {
    this.name = name
  }
  // methods
  get(options)              { return db.getCollection(this.name).findOne(options) }
  getAll()                  { return db.getCollection(this.name).find() }
  getById(id)               { return db.getCollection(this.name).get(id) }
  getByUnique(field, value) { return db.getCollection(this.name).by(name, value) }
  count(options)            { return db.getCollection(this.name).count(options) }
  create(obj) {
    let res = db.getCollection(this.name).insert(obj)
    return res['$loki']
  }
  update(obj) {
    db.getCollection(this.name).update(obj)
    return obj['$loki']
  }
}

module.exports = {
  hider:  new DbCollectionControl('hiders'),
  seeker: new DbCollectionControl('seekers'),
  stamp:  new DbCollectionControl('stamps')
}