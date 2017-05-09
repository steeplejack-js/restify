# Steeplejack Restify

[Restify](http://restify.com) strategy for [Steeplejack](http://steeplejack.info)

# Usage

In your [Steeplejack](http://getsteeplejack.com) bootstrapping, you'll need to import this Restify plugin into the
`modules` section:

### app.js

```javascript
const Steeplejack = require('steeplejack');
const restify = require('@steeplejack/restify');

/* Bootstrap the Steeplejack app */
const app = Steeplejack.app({
  config: {},
  modules: [
    `${__dirname}/!(node_modules|routes)/**/*.js`,
    restify,
  ],
  routesDir: `${__dirname}/routes`,
});

app.run(['server'], server => server);
```

Now you've done that, you can create the server with the Restify strategy:

### server.js

> The `opts` object is the same opts as what is passed into the [Restify](http://restify.com/#creating-a-server) 
> `createServer` method 

```javascript
exports.default = (Server, config, { Restify }) => {
  const opts = {};
  const restify = new Restify(opts);

  return new Server(config.server, restify);
};

exports.inject = {
  name: 'server',
  deps: [
    'steeplejack-server',
    '$config',
    'steeplejack-restify',
  ],
};
```

The `steeplejack-restify` dependency exposes two elements, `Restify` (the strategy) and `restifyLib` (the restify 
library).

# License

MIT License
