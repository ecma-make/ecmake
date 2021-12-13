require('chai').should();
const cp = require('child_process');
const ProjectFixture = require('../../../lib/testing/projectFixture');

function isOptions(text) {
  const options = text.includes('Options');
  const noSurprises = 'Getting started, Synopsis, Examples, Terminology'.split(/, */)
    .filter((title) => text.includes(title)).length === 0;
  return (options && noSurprises);
}

describe('--options', function x() {
  this.timeout(5000);
  let fixture;

  before(() => {
    fixture = new ProjectFixture(true);
    fixture.setUp();
  });

  after(() => fixture.tearDown());

  it('should display the options for <ecmake --options>', () => {
    const result = cp.execSync('npx ecmake --options').toString();
    isOptions(result).should.be.true;
  });

  it('should display the options for <ecmake -o>', () => {
    const result = cp.execSync('npx ecmake -o').toString();
    isOptions(result).should.be.true;
  });
});
