require('chai').should();
const path = require('path');
const cp = require('child_process');
const ProjectFixture = require('../../../lib/testing/projectFixture');

describe('--version', function x() {
  this.timeout(5000);
  let fixture;
  let version;
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

  it('should display a version number for <ecmake --version>', () => {
    version = cp.execSync('npx ecmake --version').toString();
    version.should.match(/^\d+\.\d+\.\d+\n$/);
  });

  it('should display a version number for <ecmake -v>', () => {
    version = cp.execSync('npx ecmake -v').toString();
    version.should.match(/^\d+\.\d+\.\d+\n$/);
  });

  it('should display the version number of package.json', () => {
    version = cp.execSync('npx ecmake --version').toString();
    version.should.include(pkg.version);
  });
});
