require('chai').should();
const path = require('path');
const cp = require('child_process');

const ProjectFixture = require('../../lib/project-fixture');

describe('--version', function x() {
  this.timeout(5000);
  let fixture;
  let pkg;

  before(() => {
    fixture = new ProjectFixture();
    fixture.setUp();
    const packageFile = path.resolve('node_modules', '@ecmake', 'ecmake', 'package.json');
    pkg = require(packageFile); // eslint-disable-line
  });

  after(() => {
    fixture.tearDown();
  });

  ['--version', '-v'].forEach((arg) => {
    describe(`ecmake ${arg}`, () => {
      let version;
      before(() => {
        version = cp.execSync(`npx ecmake ${arg}`).toString();
      });

      it('should display a version number', () => {
        version.should.match(/^\d+\.\d+\.\d+\n$/);
      });

      it('should display the version number of package.json', () => {
        version.should.include(pkg.version);
      });
    });
  });
});
