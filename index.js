
var gm = require('gm')
  , fs = require('fs')
  , path = require('path')
  , debug = require('debug')('flags')


var flags = {}

var files = {}
fs.readdirSync('./flags').forEach(function(file) {
  var name = file.slice(0, -4)
  files[name] = path.resolve(__dirname, 'flags', file)
})


fs.readFileSync('./countries.txt')
  .toString()
  .split('\n')
  .forEach(function(line) {
    line = line.trim().replace(/ /g, '_').split(';')
    if (files[line[0]]) {
      flags[line[1]] = line[0]
    }
  })



var regexp = /^\/([a-z]{2})(\-([0-9]{1,4})(\x([0-9]{1,4}))?)?\.gif$/

exports.middleware = function(options) {
  options = options || {}

  var cacheControl = options.cacheControl || 'max-age=' + (60*60*24*365) + ', public'
    , maxWidth = options.maxWidth || 3000
    , maxHeight = options.maxHeight || 3000
    , minWidth = options.minWidth || 0
    , minHeight = options.minHeight || 0

  return function(req, res, next) {
    debug('handle request', req.url)


    if (req.url == '/') {
      res.setHeader('Content-Type', 'text/plain')
      res.end(Object.keys(flags).join('\n'))
      return
    }


    var match = regexp.exec(req.url)
    if (!match) return next()
    var code = match[1]
      , width = parseInt(match[3], 10) || null
      , height = parseInt(match[5], 10) || null
      , file = flags[code]
      , pathname = files[file]

    if (!file) return next()

    res.setHeader('Cache-Control', cacheControl)
    res.setHeader('Content-Type', 'image/gif')

    if (!width) {
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
