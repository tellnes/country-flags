var cf = require('../')
  , seaport = require('seaport')
  , pkg = require('../package.json')

seaport .connect.apply(seaport, process.argv.slice(2))
        .service(pkg.name + '@' + pkg.version, cf.listen)
