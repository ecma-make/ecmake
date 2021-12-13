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
  let fixture;

  beforeEach(() => {
    fixture = new ProjectFixture();
    fixture.setUp();
  });

  afterEach(() => {
    fixture.tearDown();
  });

  it('should display the help for <ecmake --help>', () => {
    const result = cp.execSync('npx ecmake --help').toString();
    isHelp(result).should.be.true;
  });

  it('should display the help for <ecmake>, if ecmakeCode is NOT given', () => {
    const result = cp.execSync('npx ecmake').toString();
    isHelp(result).should.be.true;
  });

  it('should NOT display the help for <ecmake>, if ecmakeCode IS given', (done) => {
    cp.exec('npx ecmake --init', () => {
      const result = cp.execSync('npx ecmake').toString();
      isHelp(result).should.be.false;
      done();
    });
  });
});
