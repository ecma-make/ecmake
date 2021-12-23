require('chai').should();

const lib = '../../../lib';
const commandLine = require(`${lib}/runner/command-line.js`);

describe('command-line', function () {
  it('should export three keys', function () {
    Object.keys(commandLine).length.should.equal(3);
  });
  'makeOptions, makeHelp, makeOptionsHelp'.split(/,\s*/).forEach(
    function (token) {
      it(`should export ${token}`, function () {
        commandLine[token].should.be.ok;
      });
    },
  );
  describe('makeOptions', function () {
  });
});
