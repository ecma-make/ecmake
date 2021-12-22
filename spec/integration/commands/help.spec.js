require('chai').should();
const cp = require('child_process');

const lib = '../../../lib';
const ProjectFixture = require(`${lib}/testing/project-fixture`);

function isHelp(result) {
  return ('Getting started, Synopsis, Examples, Terminology'.split(/, */)
    .filter((title) => !result.includes(title)).length
    === 0
  );
}

describe('--help', function x() {
  this.timeout(5000);

  let fixture;

  before(() => {
    fixture = new ProjectFixture();
    fixture.setUp();
  });

  after(() => {
    fixture.tearDown();
  });

  afterEach(() => {
    if (fixture.hasCodeFile()) fixture.removeCodeFile();
  });

  ['--help', '-h'].forEach((arg) => {
    describe(`ecmake ${arg}`, () => {
      let result;
      before(() => {
        result = cp.execSync(`npx ecmake ${arg}`).toString();
      });
      it('should display the help', () => {
        isHelp(result).should.be.true;
      });
    });
  });

  describe('ecmake', () => {
    it('should display the help, if ecmake-code.js is NOT set up', () => {
      fixture.hasCodeFile().should.be.false;
      const result = cp.execSync('npx ecmake').toString();
      isHelp(result).should.be.true;
    });

    it('should NOT display the help, if ecmake-code.js IS set up', () => {
      fixture.initCodeFile();
      const result = cp.execSync('npx ecmake').toString();
      isHelp(result).should.be.false;
    });
  });
});
