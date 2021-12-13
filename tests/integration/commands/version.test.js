require('chai').should();
const path = require('path');
const cp = require('child_process');
const ProjectFixture = require('../../../lib/testing/projectFixture');

describe('--version', function x() {
  this.timeout(5000);
  let fixture;
  let version;

  before(() => {
    fixture = new ProjectFixture();
    fixture.setUp();
    version = cp.execSync('npx ecmake --version').toString();
  });

  after(() => {
    fixture.tearDown();
  });

  it('should display a version number for <ecmake --version>', () => {
    version.should.match(/^\d+\.\d+\.\d+\n$/);
  });

  it('should display the version number of package.json', () => {
    const packageFile = path.resolve(
      'node_modules',
      '@ecmake',
      'ecmake',
      'package.json',
    );
    const pkg = require(packageFile); // eslint-disable-line
    version.should.include(pkg.version);
  });
});
