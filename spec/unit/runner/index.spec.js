require('chai').should();

const lib = '../../../lib';
const Runner = require(`${lib}/runner/runner`);
const index = require(`${lib}/runner`);

describe('lib/runner/index', function () {
  it('should be an alias of lib/runner/runner being Runner', function () {
    index.should.equal(Runner);
  });

});

