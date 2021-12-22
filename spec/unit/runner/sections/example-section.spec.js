require('chai').should();

const lib = '../../../../lib';
const exampleSection = require(`${lib}/runner/sections/example-section.js`);

describe('example-section', function () {
  it('should export two keys', function () {
    Object.keys(exampleSection).length.should.equal(2);
  });
  it('should export header', function () {
    exampleSection.header.should.be.ok;
  });
  it('should export content', function () {
    exampleSection.content.should.be.ok;
  });
  describe('header', function () {
    it('should contain "Examples"', function () {
      exampleSection.header.should.include('Examples');
    });
  });
  describe('content', function () {
    '--init, tests.unit, --awaits, -b, -c, tests.all'.split(/,\s*/)
      .forEach((token) => {
        it(`should contain "${token}"`, function () {
          exampleSection.content.should.include(token);
        });
      });
  });
});
