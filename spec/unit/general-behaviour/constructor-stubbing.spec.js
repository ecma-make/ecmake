require('chai').should();
const { createStubInstance } = require('sinon');

class UnderTest {
  constructor() {
    throw new Error('must not be called');
  }

  callThis() {
    this.getCalled();
    return true;
  }

  getCalled() { // eslint-disable-line
    throw new Error('must not be called');
  }
}

describe('constructor stubbing with sinon.createStubInstance()', () => {
  describe('UnderTest', () => {
    describe('.callThis()', () => {
      describe('when still stubbed by sinon.createStubInstance()', () => {
        let underTest;
        let result;
        before(() => {
          underTest = createStubInstance(UnderTest);
          result = underTest.callThis();
        });
        it('should return undefined', () => {
          (typeof result).should.equal('undefined');
        });
        it('should not call getCalled()', () => {
          underTest.getCalled.notCalled.should.be.true;
        });
      });
      describe('when restored', () => {
        let underTest;
        let result;
        before(() => {
          underTest = createStubInstance(UnderTest);
          underTest.callThis.restore();
          result = underTest.callThis();
        });
        it('should return true', () => {
          result.should.be.true;
        });
        it('should call getCalled()', () => {
          underTest.getCalled.calledOnce.should.be.true;
        });
      });
    });
  });
});
