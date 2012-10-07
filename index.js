
var gm = require('gm')
  , fs = require('fs')
  , path = require('path')
  , debug = require('debug')('flags')
  , http = require('http')


var flags = {}

var files = {}
fs.readdirSync(path.join(__dirname, 'flags')).forEach(function(file) {
  var name = file.slice(0, -4)
  files[name] = path.join(__dirname, 'flags', file)
})


fs.readFileSync(path.join(__dirname, 'countries.txt'))
  .toString()
  .split('\n')
  .forEach(function(line) {
    line = line.trim().replace(/ /g, '_').split(';')
    if (files[line[0]]) {
      flags[line[1]] = line[0]
    }
  })


flags['-'] = 'default'
files['default'] = path.resolve(__dirname, 'default.gif')


var regexp = /^\/([a-z]{2}|\-(?!\-))?(?:\-(?!\.)([0-9]{2,4})?(?:x([0-9]{2,4}))?)?\.gif$/

exports.middleware = function(options) {
  options = options || {}

  var ttl = options.ttl || (60*60*24*365)
    , cacheControl = options.cacheControl || 'max-age=' + ttl + ', public'
    , maxWidth = options.maxWidth || 3000
    , maxHeight = options.maxHeight || 3000
    , minWidth = options.minWidth || 0
    , minHeight = options.minHeight || 0
    , expiresCache


  function getExpires() {
    if (!expiresCache) {
      var d = new Date(Date.now() + ttl * 1000)
      expiresCache = d.toUTCString()
      setTimeout(function() {
        expiresCache = null
      }, 1000 - d.getMilliseconds())
    }
    return expiresCache
  }


  return function(req, res, next) {
    debug('handle request', req.url)


    if (req.url == '/') {
      res.setHeader('Content-Type', 'text/plain')
      res.end(Object.keys(flags).join('\n'))
      return
    }


    var match = regexp.exec(req.url)
    if (!match) return next()

    var code = match[1] || '-'
      , width = parseInt(match[2], 10) || null
      , height = parseInt(match[3], 10) || null
      , file = flags[code]
      , pathname = files[file]

    if (!file) return next()

    res.setHeader('Cache-Control', cacheControl)
    res.setHeader('Expires', getExpires())
    res.setHeader('Content-Type', 'image/gif')

    if (!width && !height) {
      fs.createReadStream(pathname).pipe(res)
      return
    }

    if (width > maxWidth || height > maxHeight || width < minWidth || height < minHeight) return next()

    gm(pathname)
    .resize(width, height)
    .stream(function (err, stdout, stderr, cmd) {
      if (err) return next(err)
      stdout.pipe(res)
      debug('%s', cmd, req.url)
    })

  }
}

Object.defineProperty(exports, 'handle', {
  get: exports.middleware
})

exports.listen = function() {
  var handle = exports.middleware()

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

  server.on('listening', function() {
    var address = server.address()
    if (address.address == '0.0.0.0') address.address = '127.0.0.1'
    address = 'http://' + address.address + ':' + address.port
    console.log('Country flags service is now listening on ' + address)
  })

  server.listen.apply(server, arguments)

  return server
}
