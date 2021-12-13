require('chai').should();
const cp = require('child_process');
const ProjectFixture = require('../../../lib/testing/projectFixture');

describe('--version', function x() {
  this.timeout(5000);
  let fixture;

  beforeEach(() => {
    fixture = new ProjectFixture();
    fixture.setUp();
  });

  afterEach(() => {
    fixture.tearDown();
  });

  it('should display the help for <ecmake --version>', () => {
    const result = cp.execSync('npx ecmake --version').toString();
    result.should.match(/^\d+\.\d+\.\d+\n$/);
  });
});
