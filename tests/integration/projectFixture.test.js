require('chai').should();
const { spawn } = require('child_process');
const fs  = require('fs');
const path  = require('path');

const ProjectFixture = require('../../lib/testing/projectFixture');

function exists(path) {
    try {
      fs.accessSync(path);
      return true;
    } catch (error) {
      if(error.code === 'ENOENT') {
        return false;
      } else {
        throw error;
      }
    }
}

describe('ProjectFixture', function() {
  this.timeout(5000);
  describe('constructor', () => {
    it('should be constructable', () => {
      const projectFixture = new ProjectFixture();
    });
    it('should set the prefix', () => {
      const projectFixture = new ProjectFixture();
      projectFixture.prefix.should.equal('ecmake');
    });
    it('should store the original direcotry', () => {
      const originalDirectory = process.cwd();
      const projectFixture = new ProjectFixture();
      projectFixture.originalDirectory.should.equal(originalDirectory);
    });
  });

  describe('setUp', () => {
    let originalDirectory;
    let projectFixture;
    let base;

    before(() => {
      originalDirectory = process.cwd();
      projectFixture = new ProjectFixture();
      base = projectFixture.setUp();
    });

    after(() => {
      projectFixture.tearDown();
    });

    it('should use the prefix', () => {
      base.should.include('ecmake');
    });

    it('should setup a temporary base directory ', () => {
      exists(base).should.be.true;
    });

    it('should change into the temporary directory', () => {
      process.cwd().should.equal(base);
    });

    it('should have initialized a new project', () => {
      const package = path.join(base, 'package.json');
      exists(package).should.be.true;
    });

    it('should have linked @ecmake/ecmake', () => {
      const package = path.resolve(base, 'node_modules', '@ecmake', 'ecmake');
      exists(package).should.be.true;
    });
  });

  describe('tearDown', () => {
    let originalDirectory;
    let projectFixture;
    let base;

    before(() => {
      originalDirectory = process.cwd();
      projectFixture = new ProjectFixture();
      base = projectFixture.setUp();
      exists(base).should.be.true;
      projectFixture.tearDown();
      exists(base).should.be.false;
      process.cwd().should.equal(originalDirectory);
    });

    after(() => {
      exists(base).should.be.false;
    });

    it('should tear down a temporary base directory ', () => {
      exists(base).should.be.false;
    });

    it('should change back to the original directory', () => {
      process.cwd().should.equal(originalDirectory);
    });
  });

});
