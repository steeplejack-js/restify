/**
 * index
 */

'use strict';

/* Node modules */
const EventEmitter = require('events').EventEmitter;

/* Third-party modules */
const restify = require('restify');

/* Files */
const setup = require('../helpers/setup');
const strategy = require('../../src/strategy');

const expect = setup.expect;
const proxyquire = setup.proxyquire;
const sinon = setup.sinon;

const Original = strategy.default().Restify;
const restifyLib = strategy.default().restifyLib;

describe('index test', function () {

  let Restify;
  let acceptParserFunc;
  let rest;
  let restInst;

  beforeEach(function () {

    acceptParserFunc = sinon.spy();

    restInst = {
      acceptable: [
        'application/json',
        'text/html',
      ],
      use: sinon.spy(),
    };

    rest = {
      acceptParser: sinon.stub().returns(acceptParserFunc),
      bodyParser: sinon.stub().returns('bodyParser'),
      CORS: sinon.stub().returns('CORS'),
      createServer: sinon.stub().returns(restInst),
      gzipResponse: sinon.stub().returns('gzipResponse'),
      queryParser: sinon.stub().returns('queryParser'),
      RestError: sinon.stub(),
      WrongAcceptError: sinon.spy(),
    };

    const obj = proxyquire('../../src/strategy', {
      restify: rest,
    });

    expect(obj).to.have.keys([
      'default',
      'inject',
    ]);

    expect(obj.inject).to.be.eql({
      name: 'steeplejack-restify',
    });

    expect(obj.default).to.be.a('function');

    expect(obj.default().restifyLib).to.be.equal(rest);

    Restify = obj.default().Restify;

    expect(restifyLib).to.be.equal(restify);

  });

  describe('methods', function () {

    describe('#constructor', function () {

      it('should use the default options if no options passed in', function () {

        rest.createServer.returns('res');

        const obj = new Restify();

        expect(obj).to.be.instanceof(Restify)
          .instanceof(EventEmitter);

        expect(rest.createServer).to.be.calledOnce
          .calledWithExactly({
            certificate: undefined,
            formatters: undefined,
            handleUpgrades: undefined,
            httpsServerOptions: undefined,
            key: undefined,
            log: undefined,
            name: undefined,
            spdy: undefined,
            version: undefined,
          });

        expect(obj.inst).to.be.equal('res');

      });

      it('should use the default options if blank options passed in', function () {

        rest.createServer.returns('res');

        const obj = new Restify({});

        expect(obj).to.be.instanceof(Restify)
          .instanceof(EventEmitter);

        expect(rest.createServer).to.be.calledOnce
          .calledWithExactly({
            certificate: undefined,
            formatters: undefined,
            handleUpgrades: undefined,
            httpsServerOptions: undefined,
            key: undefined,
            log: undefined,
            name: undefined,
            spdy: undefined,
            version: undefined,
          });

        expect(obj.inst).to.be.equal('res');

      });

      it('should use the set options if options passed in', function () {

        rest.createServer.returns('restify');

        const obj = new Restify({
          certificate: 'certificate',
          formatters: 'formatters',
          handleUpgrades: 'handleUpgrades',
          httpsServerOptions: 'httpsServerOptions',
          key: 'key',
          log: 'log',
          name: 'name',
          spdy: 'spdy',
          version: 'version',
        });

        expect(obj).to.be.instanceof(Restify)
          .instanceof(EventEmitter);

        expect(rest.createServer).to.be.calledOnce
          .calledWithExactly({
            certificate: 'certificate',
            formatters: 'formatters',
            handleUpgrades: 'handleUpgrades',
            httpsServerOptions: 'httpsServerOptions',
            key: 'key',
            log: 'log',
            name: 'name',
            spdy: 'spdy',
            version: 'version',
          });

        expect(obj.inst).to.be.equal('restify');

      });

    });

    describe('#addRoute', function () {

      beforeEach(function () {

        this.req = {};
        this.res = {
          send: sinon.spy(),
        };
        this.next = sinon.spy();

        this.server = {};

        this.obj = new Restify();

        this.outputHandler = sinon.spy(this.obj, 'outputHandler');

      });

      it('should map the Steeplejack verb to the Restify verb - options', function (done) {

        const result = (req, res) => {
          expect(req).to.be.equal(this.req);
          expect(res).to.be.equal(this.res);

          return Promise.resolve('my result');
        };

        this.server.opts = (route, iterator) => {

          expect(route).to.be.equal('/path/to/route');

          iterator(this.req, this.res, this.next)
            .then((result1) => {

              expect(result1).to.be.undefined;

              expect(this.next).to.be.calledOnce
                .calledWithExactly();

              done();

            });

        };

        this.stub = sinon.stub(this.obj, 'getServer')
          .returns(this.server);

        expect(this.obj.addRoute('OPTIOnS', '/path/to/route', result)).to.be.undefined;

      });

      it('should map the Steeplejack verb to the Restify verb - delete', function (done) {

        const result = (req, res) => {
          expect(req).to.be.equal(this.req);
          expect(res).to.be.equal(this.res);

          return Promise.resolve('my result');
        };

        this.server.del = (route, iterator) => {

          expect(route).to.be.equal('/path/to/route');

          iterator(this.req, this.res, this.next)
            .then((result1) => {

              expect(result1).to.be.undefined;

              expect(this.next).to.be.calledOnce
                .calledWithExactly();

              done();

            });

        };

        this.stub = sinon.stub(this.obj, 'getServer')
          .returns(this.server);

        expect(this.obj.addRoute('DELEtE', '/path/to/route', result)).to.be.undefined;

      });

      it('should add to the function with a lower case method', function (done) {

        const result = (req, res) => {
          expect(req).to.be.equal(this.req);
          expect(res).to.be.equal(this.res);

          return Promise.resolve('my result');
        };

        this.server.get = (route, iterator) => {

          expect(route).to.be.equal('/path/to/route');

          iterator(this.req, this.res, this.next)
            .then((result1) => {

              expect(result1).to.be.undefined;

              expect(this.next).to.be.calledOnce
                .calledWithExactly();

              done();

            });

        };

        this.stub = sinon.stub(this.obj, 'getServer')
          .returns(this.server);

        expect(this.obj.addRoute('get', '/path/to/route', result)).to.be.undefined;

      });

      it('should add to the function with an upper case method', function (done) {

        const result = (req, res) => {
          expect(req).to.be.equal(this.req);
          expect(res).to.be.equal(this.res);

          return Promise.resolve('my result');
        };

        this.server.get = (route, iterator) => {

          expect(route).to.be.equal('/path/to/route');

          iterator(this.req, this.res, this.next)
            .then((result1) => {

              expect(result1).to.be.undefined;

              expect(this.next).to.be.calledOnce
                .calledWithExactly();

              done();

            });

        };

        this.stub = sinon.stub(this.obj, 'getServer')
          .returns(this.server);

        expect(this.obj.addRoute('GET', '/path/to/route', result)).to.be.undefined;

      });

      it('should reject the function', function (done) {

        const result = (req, res) => {
          expect(req).to.be.equal(this.req);
          expect(res).to.be.equal(this.res);

          return Promise.reject(new Error('my error'));
        };

        this.server.get = (route, iterator) => {

          expect(route).to.be.equal('/path/to/route');

          iterator(this.req, this.res, this.next)
            .then(() => {
              throw new Error('invalid');
            })
            .catch((err) => {

              expect(err).to.be.instanceof(Error);
              expect(err.message).to.be.equal('my error');

              expect(this.next).to.be.calledOnce
                .calledWithExactly(err);

              done();

            });

        };

        this.stub = sinon.stub(this.obj, 'getServer')
          .returns(this.server);

        expect(this.obj.addRoute('GET', '/path/to/route', result)).to.be.undefined;

      });

    });

    describe('#close', function () {

      it('should call the close method', function () {

        const obj = new Restify();

        const spy = sinon.spy();

        const stub = sinon.stub(obj, 'getServer')
          .returns({
            close: spy,
          });

        expect(obj.close()).to.be.equal(obj);

        expect(stub).to.be.calledOnce;

        expect(spy).to.be.calledOnce
          .calledWithExactly();

      });

    });

    describe('#getRawServer', function () {

      it('should return the inst.server', function () {

        const obj = new Restify();

        obj.inst = {
          server: 'result',
        };

        expect(obj.getRawServer()).to.be.equal('result');

      });

    });

    describe('#getServer', function () {

      it('should return the inst', function () {

        const obj = new Restify();

        obj.inst = 'hello';

        expect(obj.getServer()).to.be.equal('hello');

      });

    });

    describe('#outputHandler', function () {

      let req;
      let res;
      let obj;
      beforeEach(function () {

        req = {};
        res = {
          send: sinon.spy(),
        };

        obj = new Original();

      });

      it('should call the response with the data and statusCode', function () {

        const data = {
          hello: 'world',
        };

        expect(obj.outputHandler(201, data, req, res)).to.be.equal(obj);

        expect(res.send).to.be.calledOnce
          .calledWithExactly(201, data);

      });

    });

    describe('#start', function () {

      it('should start the server successfully', function () {

        const obj = new Restify();

        const listen = sinon.stub()
          .yields(null, 'result');

        const stub = sinon.stub(obj, 'getServer')
          .returns({
            listen,
          });

        return obj.start(8080, 'hostname', 12345)
          .then((res) => {

            expect(res).to.be.equal('result');

            expect(stub).to.be.calledOnce
              .calledWithExactly();

            expect(listen).to.be.calledOnce
              .calledWith(8080, 'hostname', 12345);

          });

      });

      it('should fail to start the server', function () {

        const obj = new Restify();

        const listen = sinon.stub()
          .yields('err');

        const stub = sinon.stub(obj, 'getServer')
          .returns({
            listen,
          });

        return obj.start(9999, 'address', 512)
          .then(() => {
            throw new Error('uh-oh');
          })
          .catch((err) => {

            expect(err).to.be.equal('err');

            expect(stub).to.be.calledOnce
              .calledWithExactly();

            expect(listen).to.be.calledOnce
              .calledWith(9999, 'address', 512);

          });

      });

    });

    describe('#uncaughtException', function () {

      it('should add listener to the uncaughtException event', function (done) {

        const obj = new Restify();

        const on = sinon.stub()
          .yields('req', 'res', 'route', 'err');

        const stub = sinon.stub(obj, 'getServer')
          .returns({
            on,
          });

        const fn = (req, res, err, ...args) => {

          expect(req).to.be.equal('req');
          expect(res).to.be.equal('res');
          expect(err).to.be.equal('err');
          expect(args).to.be.eql([]);

          done();

        };

        expect(obj.uncaughtException(fn)).to.be.equal(obj);

        expect(stub).to.be.calledOnce;

      });

    });

    describe('#use', function () {

      it('should use the use method', function () {

        const obj = new Restify();

        const fn = () => {};

        const spy = sinon.spy();

        const stub = sinon.stub(obj, 'getServer').returns({
          use: spy,
        });

        expect(obj.use(fn)).to.be.equal(obj);

        expect(stub).to.be.calledOnce
          .calledWithExactly();

        expect(spy).to.be.calledOnce
          .calledWithExactly(fn);

      });

    });

  });

});
