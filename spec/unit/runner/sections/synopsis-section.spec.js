require('chai').should();

const lib = '../../../../lib';
const synopsisSection = require(`${lib}/runner/sections/synopsis-section.js`);

describe('synopsis-section', function () {
  it('should export two keys', function () {
    Object.keys(synopsisSection).length.should.equal(2);
  });
  it('should export header', function () {
    synopsisSection.header.should.be.ok;
  });
  it('should export content', function () {
    synopsisSection.content.should.be.ok;
  });
  describe('header', function () {
    it('should contain "Synopsis"', function () {
      synopsisSection.header.should.include('Synopsis');
    });
  });
  describe('content', function () {
    const expectations = {
      'typical, usage': 'ecmake, target',
      'default, target': 'ecmake',
      short: 'ecmake, -b, base, -c, code, target',
      long: 'ecmake, --base, base, --code, code, --target, target',
      dependencies: 'ecmake, --base, base, --code, code, --awaits, target',
      list: 'ecmake, --base, base, --code, code, --list, --tree, --descriptions',
      init: 'ecmake, --base, base, --code, code, --init',
      help: 'ecmake, --help, --options, --version',
      '[,]': 'optional',
      '(,|,)': 'alternatives',
    };
    Object.keys(expectations).forEach(function (key) {
      const tag = key.split(/,\s*/);
      const line = expectations[key].split(/,\s*/);
      it(`should describe "${tag.join(' ')}"`, function () {
        const filtered = synopsisSection.content
          .filter((entry) => tag.every((part) => entry.tag.includes(part)));
        filtered.length.should.equal(1);
        const description = filtered[0].line;
        line.every((part) => description.includes(part)).should.be.true;
      });
    });
  });
});
