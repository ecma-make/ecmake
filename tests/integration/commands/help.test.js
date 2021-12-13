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
    const fixture = new ProjectFixture(true);
    fixture.setUp();
    const result = cp.execSync('npx ecmake --help').toString();
    isHelp(result).should.be.true;
    fixture.tearDown();
  });

  it('should display the help for <ecmake>, if ecmakeCode is NOT set up', () => {
    const fixture = new ProjectFixture(false);
    fixture.setUp();
    const result = cp.execSync('npx ecmake').toString();
    isHelp(result).should.be.true;
    fixture.tearDown();
  });

  it('should NOT display the help for <ecmake>, if ecmakeCode IS set up', () => {
    const fixture = new ProjectFixture(true);
    fixture.setUp();
    const result = cp.execSync('npx ecmake').toString();
    isHelp(result).should.be.true;
    fixture.tearDown();
  });
});
