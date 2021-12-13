require('chai').should();
const cp = require('child_process');
const fsp = require('fs').promises;
const path = require('path');
const ProjectFixture = require('../../../lib/testing/projectFixture');

describe('--init', function x() {
  this.timeout(5000);
  let fixture;
  let codeFile;
  let templateFile;

  beforeEach(() => {
    fixture = new ProjectFixture();
    fixture.setUp();
    codeFile = path.resolve('ecmakeCode.js');
    templateFile = path.resolve(
      'node_modules',
      '@ecmake',
      'ecmake',
      'templates',
      'ecmakeCode.init.js',
    );
  });

  afterEach(() => {
    fixture.tearDown();
  });

  it('should create ./ecmakeCode.js for <ecmake --init> as a copy of [...]/templates/ecmakeCode.init.js', (done) => {
    cp.exec('npx ecmake --init', () => {
      const p1 = fsp.readFile(templateFile, 'utf8');
      const p2 = fsp.readFile(codeFile, 'utf8');
      Promise.all([p1, p2]).then((values) => {
        values[0].should.be.equal(values[1]);
        done();
      });
    });
  });

  it('should create ./ecmakeCode.js for <ecmake -i> as a copy of [...]/templates/ecmakeCode.init.js', (done) => {
    cp.exec('npx ecmake -i', () => {
      const p1 = fsp.readFile(templateFile, 'utf8');
      const p2 = fsp.readFile(codeFile, 'utf8');
      Promise.all([p1, p2]).then((values) => {
        values[0].should.be.equal(values[1]);
        done();
      });
    });
  });
});
