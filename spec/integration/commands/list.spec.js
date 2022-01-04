require('chai').should();
const cp = require('child_process');

const ProjectFixture = require('../../lib/project-fixture');

describe('--list', function x() {
  this.timeout(5000);
  let fixture;
  const headline = 'Targets';
  const planetDescription = 'to the planet given in setup';
  const sorted = 'all, hello.planet, hello.world'.split(/, */).sort();

  before(() => {
    fixture = new ProjectFixture();
    fixture.setUp();
    fixture.initCodeFile();
  });

  after(() => {
    fixture.tearDown();
  });

  ['--list', '-l'].forEach((arg) => {
    describe(`ecmake ${arg}`, () => {
      let text;
      before(() => {
        text = cp.execSync(`npx ecmake ${arg}`).toString();
      });

      it('should contain the headline', () => {
        text.should.include(headline);
      });

      it('should contain all of the tree nodes in sorted order', () => {
        let i = 0;
        text.match(/[^\n]+/g).forEach((line) => {
          i += line.includes(sorted[i]) ? 1 : 0;
        });
        i.should.equal(sorted.length);
      });

      it(
        'should contain a description for hello.planet in the next line',
        (done) => {
          const lines = text.match(/[^\n]+/g);
          for (let i = 0; i < lines.length; i += 1) {
            if (lines[i].includes('hello.planet')) {
              lines[i + 1].should.include(planetDescription);
              done();
            }
          }
        },
      );
    });
  });
});
