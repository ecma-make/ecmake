require('chai').should();
const base = '../..';
const index = require(base);

describe('lib/index', function () {
  it('should export five keys', function () {
    Object.keys(index).length.should.equal(4);
  });
  it('should export ErrorClassFactory', function () {
    index.ErrorClassFactory.should.be.ok;
  });
  it('should export Task', function () {
    index.Task.should.be.ok;
  });
  it('should export toolBox', function () {
    index.toolBox.should.be.ok;
  });
  it('should export makeRoot()', function () {
    index.makeRoot.should.be.ok;
  });

  describe('makeRoot()', function () {
    it('should create as Task', function () {
      const root = index.makeRoot();
      (root instanceof index.Task).should.be.true;
    });
  });
});

