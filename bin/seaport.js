var cf = require('../')
  , seaport = require('seaport')
  , pkg = require('../package.json')

var ports

var args = []

if (process.env.SEAPORT_HOST && process.env.SEAPORT_PORT) {
  args.push(process.env.SEAPORT_HOST, process.env.SEAPORT_PORT)

} else if (process.env.SEAPORT_PORT) {
  args.push(process.env.SEAPORT_PORT)

} else if (process.env.SEAPORT) {
  args.push(process.env.SEAPORT)

}

if (args.length) {
  if (process.env.SEAPORT_SECRET) {
    args.push( { secret: process.env.SEAPORT_SECRET })
  }
} else {
  args = process.argv.slice(2)
}

if (!args.length) {
  console.error('Missing seaport connection details')
  return
}

seaport .connect.apply(seaport, args)
        .service(pkg.name + '@' + pkg.version, cf.listen)
