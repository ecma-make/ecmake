require('chai').should();
const lib = '../../../lib';
const testingIndex = require(`${lib}/testing`);

describe('lib/testing/index', function () {
  it('should export two keys', function () {
    Object.keys(testingIndex).length.should.equal(2);
  });
  it('should export PackageFixture', function() {
    testingIndex.PackageFixture.should.be.ok;
  });
  it('should export ProjectFixture', function() {
    testingIndex.ProjectFixture.should.be.ok;
  });
});

