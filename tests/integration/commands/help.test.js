require('chai').should();
const cp = require('child_process');
const ProjectFixture = require('../../../lib/testing/projectFixture');

function isHelp(result) {
  return ('Getting started, Synopsis, Examples, Terminology'.split(/, */)
    .filter((title) => !result.includes(title)).length
    === 0
  );
}

describe('--help', function x() {
  this.timeout(5000);

  it('should display the help for <ecmake --help>', () => {
    const fixture = new ProjectFixture();
    fixture.setUp();
    const result = cp.execSync('npx ecmake --help').toString();
    isHelp(result).should.be.true;
    fixture.tearDown();
  });

  it('should display the help for <ecmake -h>', () => {
    const fixture = new ProjectFixture();
    fixture.setUp();
    const result = cp.execSync('npx ecmake -h').toString();
    isHelp(result).should.be.true;
    fixture.tearDown();
  });

  it('should display the help for <ecmake>, if ecmakeCode.js is NOT set up', () => {
    const fixture = new ProjectFixture();
    fixture.setUp();
    fixture.hasCodeFile().should.be.false;
    const result = cp.execSync('npx ecmake').toString();
    isHelp(result).should.be.true;
    fixture.tearDown();
  });

  it('should NOT display the help for <ecmake>, if ecmakeCode.js IS set up', () => {
    const fixture = new ProjectFixture();
    fixture.setUp();
    fixture.initCodeFile();
    fixture.hasCodeFile().should.be.true;
    const result = cp.execSync('npx ecmake').toString();
    isHelp(result).should.be.false;
    fixture.tearDown();
  });
});
