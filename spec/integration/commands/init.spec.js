require('chai').should();
const cp = require('child_process');
const fsp = require('fs').promises;
const path = require('path');

const ProjectFixture = require('../../lib/project-fixture');

describe('--init', function x() {
  this.timeout(5000);
  let fixture;
  let codeFile;
  let templateFile;

  beforeEach(() => {
    fixture = new ProjectFixture();
    fixture.setUp();
    codeFile = path.resolve('ecmake-code.js');
    templateFile = path.resolve(
      'node_modules',
      '@ecmake',
      'ecmake',
      'templates',
      'ecmake-code.init.js',
    );
  });

  afterEach(() => {
    fixture.tearDown();
  });

  ['--init', '-i'].forEach((arg) => {
    describe(`ecmake ${arg}`, () => {
      it('should create ecmake-code.js from templates/ecmake-code.init.js', (done) => {
        cp.exec(`npx ecmake ${arg}`, () => {
          const p1 = fsp.readFile(templateFile, 'utf8');
          const p2 = fsp.readFile(codeFile, 'utf8');
          Promise.all([p1, p2]).then((values) => {
            values[0].should.be.equal(values[1]);
            done();
          });
        });
      });
    });
  });
});
