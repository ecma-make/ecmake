require('chai').should();

const lib = '../../../../lib';
const terminologySection = require(`${lib}/runner/sections/terminology-section.js`);

describe('terminology-section', function () {
  it('should export two keys', function () {
    Object.keys(terminologySection).length.should.equal(2);
  });
  it('should export header', function () {
    terminologySection.header.should.be.ok;
  });
  it('should export content', function () {
    terminologySection.content.should.be.ok;
  });
  describe('header', function () {
    it('should contain "Terminology"', function () {
      terminologySection.header.should.include('Terminology');
    });
  });
  describe('content', function () {
    it('should conatain a long text', function () {
      terminologySection.content.should.have.lengthOf.at.least(2500);
      (typeof terminologySection.content).should.equal('string');
    });
  });
});
