/* eslint-disable max-classes-per-file */
require('chai').should();
const { ErrorClassFactory } = require('../..');

describe('ErrorFacotry', function () {
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
