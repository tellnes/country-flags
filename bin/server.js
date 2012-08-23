#!/usr/bin/env node

var cf = require('../')
  , http = require('http')


var handle = cf.middleware()

var server = http.createServer(function(req, res) {
  handle(req, res, function(err) {
    if (err) {
      res.statusCode = 500
      res.end('500 - Internal error')
      console.error(err)
      return
    }

    res.statusCode = 404
    res.end('404 - not found')
  })
})

server.listen(process.argv[2], function() {
  console.log('Country flags service is now listening on http://localhost:' + this.address().port)
})
