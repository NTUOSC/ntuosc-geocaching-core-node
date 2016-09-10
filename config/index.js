'use strict';

module.exports = {
  database: {
    dir:  './path/to/database',
    file: './path/to/database/database.json'
  },
  ssl: {
    key:  './your/private/key.pem',
    cert: './your/certificate.pem'
  },
  jwt: {
    secret: 'your secret'
  },
  port: 5566
}
