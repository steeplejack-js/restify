/**
 * index
 */

'use strict';

/* Node modules */
const EventEmitter = require('events').EventEmitter;

/* Third-party modules */
const _ = require('lodash');
const restifyLib = require('restify');

/* Files */

/* Maps the HTTP verbs to the Restify verb */
const verbMapper = {
  delete: 'del',
  options: 'opts',
};

class Restify extends EventEmitter {

  constructor (opts) {
    super();

    opts = opts || {};

    this.inst = restifyLib.createServer({
      certificate: opts.certificate,
      formatters: opts.formatters,
      handleUpgrades: opts.handleUpgrades,
      httpsServerOptions: opts.httpsServerOptions,
      key: opts.key,
      log: opts.log,
      name: opts.name || 'steeplejack-app',
      spdy: opts.spdy,
      version: opts.version,
    });
  }

  /**
   * Add Route
   *
   * Adds an individual route to the stack
   *
   * @param {string} httpMethod
   * @param {string} route
   * @param {function} iterator
   */
  addRoute (httpMethod, route, iterator) {
    /* Restify requires lower case method names */
    let method = httpMethod.toLowerCase();

    /* Replace the Steeplejack verb with the Restify verb */
    if (_.has(verbMapper, method)) {
      method = verbMapper[method];
    }

    this.getServer()[method](route, (req, res, next) => iterator(req, res)
      .then(() => {
        next();
      })
      .catch((err) => {
        next(err);
        throw err;
      }));
  }

  /**
   * Close
   *
   * Closes the server.
   *
   * @returns {Restify}
   */
  close () {
    this.getServer().close();

    return this;
  }

  /**
   * Get Raw Server
   *
   * Returns the raw server
   *
   * @returns {*}
   */
  getRawServer () {
    return this.inst.server;
  }

  /**
   * Get Server
   *
   * Returns the Restify server
   *
   * @returns {*}
   */
  getServer () {
    return this.inst;
  }

  /**
   * Output Handler
   *
   * This handles the output. This can be activated
   * directly or bundled up into a closure and passed
   * around.
   *
   * @param {number} statusCode
   * @param {*} output
   * @param {*} request
   * @param {*} response
   * @returns {Restify}
   */
  outputHandler (statusCode, output, request, response) {
    /* Display the output */
    response.send(statusCode, output);

    return this;
  }

  /**
   * Start
   *
   * Starts up the restify server. Wraps the
   * NodeJS HTTP.listen method
   *
   * @param {number} port
   * @param {string} hostname
   * @param {number} backlog
   * @returns {Promise}
   */
  start (port, hostname, backlog) {
    return new Promise((resolve, reject) => {
      this.getServer()
        .listen(port, hostname, backlog, (err, result) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(result);
        });
    });
  }

  /**
   * Uncaught Exception
   *
   * Listens for an uncaught exception
   *
   * @param {function} fn
   * @returns {Restify}
   */
  uncaughtException (fn) {
    this.getServer()
      .on('uncaughtException', (req, res, route, err) => {
        fn(req, res, err);
      });

    return this;
  }

  /**
   * Use
   *
   * Exposes the use method. This is to
   * add middleware functions to the stack
   *
   * @returns {Restify}
   */
  use () {
    const server = this.getServer();

    server.use.apply(server, arguments);

    return this;
  }

}

/* Export */
exports.default = () => ({
  restifyLib,
  Restify,
});

exports.inject = {
  name: 'steeplejack-restify',
};
