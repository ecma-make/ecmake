/* eslint-disable max-classes-per-file */
require('chai').should();
const path = require('path');
const { ErrorClassFactory } = require('../..');

describe(ErrorClassFactory.name, function () {
  describe('for class', function () {
    describe('register', function () {
      const klass = class MyClass {};
      const errorName = 'MY_ERROR';
      before(function () {
        ErrorClassFactory.register(klass, errorName);
      });
      it('should register the error within the given class', function () {
        klass.MY_ERROR.should.be.ok;
      });
    });

    describe('the registered error constructor', function () {
      const klass = class MyClass {};
      const errorName = 'MY_ERROR';
      const message = 'my message';
      let error;
      before(function () {
        ErrorClassFactory.register(klass, errorName);
        error = new klass.MY_ERROR(message);
      });
      it('should be constructor', function () {
        (error instanceof klass.MY_ERROR).should.be.true;
      });
      it('should create an Error', function () {
        (error instanceof Error).should.be.true;
      });
      it('should create an error with a full name', function () {
        error.name.should.equal(`${klass.name}.${errorName}`);
      });
    });
  });

  describe('for module', function () {
    describe('register', function () {
      const errorName = 'MY_ERROR';
      before(function () {
        ErrorClassFactory.register(module, errorName);
      });
      it('should register the error within the given module', function () {
        module.MY_ERROR.should.be.ok;
      });
    });

    describe('the registered error constructor', function () {
      const errorName = 'MY_ERROR';
      const message = 'my message';
      let error;
      before(function () {
        ErrorClassFactory.register(module, errorName);
        error = new module.MY_ERROR(message);
      });
      it('should be constructor', function () {
        (error instanceof module.MY_ERROR).should.be.true;
      });
      it('should create an Error', function () {
        (error instanceof Error).should.be.true;
      });
      it('should create an error with a full name', function () {
        const parentName = `[module: ${path.basename(module.id)}]`;
        error.name.should.equal(`${parentName}.${errorName}`);
      });
    });
  });
});
