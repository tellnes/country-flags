#!/usr/bin/env node

var cf = require('../')

cf.listen.apply(cf, process.argv.slice(2))
