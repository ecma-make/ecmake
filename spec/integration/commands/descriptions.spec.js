require('chai').should();
const cp = require('child_process');

const ProjectFixture = require('../../lib/project-fixture');

describe('--descriptions', function x() {
  this.timeout(5000);
  let fixture;
  const headline = 'Descriptions';
  const descriptions = {
    'hello.planet': 'to the planet given in setup',
    setup: "it's the mars",
    default: 'defaults to all',
  };

  before(() => {
    fixture = new ProjectFixture();
    fixture.setUp();
    fixture.initCodeFile();
  });

  after(() => {
    fixture.tearDown();
  });

  ['--descriptions', '-d'].forEach((arg) => {
    describe(`ecmake ${arg}`, () => {
      let text;
      before(() => {
        text = cp.execSync(`npx ecmake ${arg}`).toString();
      });

      it('should contain the headline', () => {
        text.should.include(headline);
      });

      it('should contain the expected nodes in sorted order', () => {
        const sorted = Object.keys(descriptions).sort();
        let i = 0;
        text.match(/[^\n\r]+/g).forEach((line) => {
          i += line.includes(sorted[i]) ? 1 : 0;
        });
        i.should.equal(sorted.length);
      });

      it('should contain the matching descriptions', () => {
        let counter = 0;
        text.match(/[-][^-]+/gm).forEach((entry) => {
          counter += 1;
          const key = entry.match(/-\s+(\S+)/)[1];
          entry.should.have.string(descriptions[key]);
        });
        counter.should.equal(Object.keys(descriptions).length);
      });
    });
  });
});
