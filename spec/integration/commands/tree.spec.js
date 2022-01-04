require('chai').should();
const cp = require('child_process');

const ProjectFixture = require('../../lib/project-fixture');

describe('--tree', function x() {
  this.timeout(5000);
  let fixture;
  let tasks = 'all, default, setup, countdown';
  tasks += ', hello, hello.world, hello.planet';
  const headline = 'The target tree';
  const sorted = tasks.split(/, */).map((task) => `root.${task}`)
    .concat(['root']).sort();

  before(() => {
    fixture = new ProjectFixture();
    fixture.setUp();
    fixture.initCodeFile();
  });

  after(() => {
    fixture.tearDown();
  });

  ['--tree', '-t'].forEach((arg) => {
    describe(`ecmake ${arg}`, () => {
      let text;
      before(() => {
        text = cp.execSync(`npx ecmake ${arg}`).toString();
      });

      it('should contain the headline', () => {
        text.should.include(headline);
      });

      it('should contain all of the tree paths in sorted order', () => {
        let i = 0;
        text.match(/[^\n]+/g).forEach((line) => {
          i += line.trim() === sorted[i] ? 1 : 0;
        });
        i.should.equal(sorted.length);
      });
    });
  });
});
