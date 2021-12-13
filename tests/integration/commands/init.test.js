require('chai').should();
const cp = require('child_process');
const fsp = require('fs').promises;
const path = require('path');
const ProjectFixture = require('../../../lib/testing/projectFixture');

describe('--init', function x() {
  this.timeout(5000);
  let fixture;

  beforeEach(() => {
    fixture = new ProjectFixture();
    fixture.setUp();
  });

  afterEach(() => {
    fixture.tearDown();
  });

  it('should create ./ecmakeCode.js for <ecmake --init> as a copy of [...]/templates/ecmakeCode.init.js', (done) => {
    const codeFile = path.resolve('ecmakeCode.js');
    const templateFile = path.resolve(
      'node_modules',
      '@ecmake',
      'ecmake',
      'templates',
      'ecmakeCode.init.js',
    );
    cp.exec('npx ecmake --init', () => {
      const p1 = fsp.readFile(templateFile, 'utf8');
      const p2 = fsp.readFile(codeFile, 'utf8');
      Promise.all([p1, p2]).then((values) => {
        values[0].should.be.equal(values[1]);
        done();
      });
    });
  });
});
