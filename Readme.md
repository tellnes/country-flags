# Country Flags server in Node.JS

Serve country flags images.


## Example

```js

    var cf = require('country-flags')
      , connect = require('connect')

    var app = connect()

    app.use(cf.middleware())

    app.listen(1337)

```

This is equialent to running

    country-flags-server 1337

## Seaport

Country Flags is `seaport` compatible:

    seaport host:port service country-flags-server

## Install

    npm install -g country-flags

## Licence

MIT
