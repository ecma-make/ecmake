require('chai').should();
const cp = require('child_process');
const { ProjectFixture } = require('../../..').testing;

function isOptionsOnly(text) {
  const options = text.includes('Options');
  const noSurprises = 'Getting started, Synopsis, Examples, Terminology'.split(/, */)
    .filter((title) => text.includes(title)).length === 0;
  return (options && noSurprises);
}

function hasAllShortOptionOptions(text) {
  const options = 'list descriptions tree awaits base code init help options version'
    .split(' ').map((o) => `--${o}`);
  const lines = text.match(/[^\n]+/g).filter((line) => line.includes('--'));
  return options.every((option) => lines.some((line) => {
    const match = line.match(/-(.),/);
    const hasShortOption = (match && match[1] === option.substring(2, 3));
    const hasOption = line.includes(option);
    return (hasShortOption && hasOption);
  }));
}

function hasTheTargetOptionWithoutShortOption(text) {
  const lines = text.match(/[^\n]+/g).filter((line) => line.includes('--'));
  return lines.some((line) => (line.includes('--target') && (!line.match(/-.,/))));
}

describe('--options', function x() {
  this.timeout(5000);
  let fixture;

  before(() => {
    fixture = new ProjectFixture();
    fixture.setUp();
  });

  after(() => fixture.tearDown());

  ['--options', '-o'].forEach((commandLineArgument) => {
    describe(`ecmake ${commandLineArgument}`, () => {
      let result;
      before(() => {
        result = cp.execSync(`npx ecmake ${commandLineArgument}`).toString();
      });

      it('should display the options section only', () => {
        isOptionsOnly(result).should.be.true;
      });

      it('should display all options that have a matching short option', () => {
        hasAllShortOptionOptions(result).should.be.true;
      });

      it('should display the default option without a short option', () => {
        hasTheTargetOptionWithoutShortOption(result).should.be.true;
      });
    });
  });
});
