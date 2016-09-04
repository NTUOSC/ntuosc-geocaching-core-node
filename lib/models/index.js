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
  constructor(name, filter) {
    this.name   = name
    this.filter = filter
  }
  // methods
  get(options)              { return db.getCollection(this.name).findOne(options) }
  getAll()                  { return db.getCollection(this.name).find() }
  getById(id)               { return db.getCollection(this.name).get(id) }
  getByUnique(field, value) { return db.getCollection(this.name).by(name, value) }
  create(...arr)            { db.getCollection(this.name).insert(arr) }
  update(obj)               { db.getCollection(this.name).update(obj) }
}

const hiderFilter = (req, res, next) => {
  next()
}

const seekerFilter = (req, res, next) => {
  next()
}

const stampFilter = (req, res, next) => {
  next()
}

module.exports = {
  hider:  new DbCollectionControl('hiders',  hiderFilter),
  seeker: new DbCollectionControl('seekers', seekerFilter),
  stamp:  new DbCollectionControl('stamps',  stampFilter)
}