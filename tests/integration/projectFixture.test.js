require('chai').should();
const path = require('path');

const ProjectFixture = require('../../lib/testing/projectFixture');

describe('ProjectFixture', function x() {
  this.timeout(5000);
  describe('constructor', () => {
    it('should be constructable', () => {
      const projectFixture = new ProjectFixture();
      (projectFixture instanceof ProjectFixture).should.be.true;
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

  describe('pathExists', () => {
    let projectFixture;
    let base;
    const initialDirectory = process.cwd();

    before(() => {
      projectFixture = new ProjectFixture();
      base = projectFixture.setUp();
    });

    after(() => {
      projectFixture.tearDown();
    });

    it('should return true for an existing directory', () => {
      const p = path.join(base, 'node_modules');
      projectFixture.pathExists(p).should.be.true;
    });

    it('should return false for a non-existing directory', () => {
      const p = path.join(base, 'foo');
      projectFixture.pathExists(p).should.be.false;
    });

    it('throw an Error for a path outside of the project fixture', () => {
      try {
        projectFixture.pathExists(initialDirectory);
        throw new Error('must not be reached');
      } catch (error) {
        error.message.should.include('outside of the project fixture');
      }
    });
  });

  describe('setUp', () => {
    let projectFixture;
    let base;

    before(() => {
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
      projectFixture.pathExists(base).should.be.true;
    });

    it('should change into the temporary directory', () => {
      process.cwd().should.equal(base);
    });

    it('should have initialized a new project', () => {
      const pkg = path.join(base, 'package.json');
      projectFixture.pathExists(pkg).should.be.true;
    });

    it('should have linked @ecmake/ecmake', () => {
      const pkg = path.resolve(base, 'node_modules', '@ecmake', 'ecmake');
      projectFixture.pathExists(pkg).should.be.true;
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
      projectFixture.pathExists(base).should.be.true;
      projectFixture.tearDown();
      projectFixture.pathExists(base).should.be.false;
      process.cwd().should.equal(originalDirectory);
    });

    after(() => {
      projectFixture.pathExists(base).should.be.false;
    });

    it('should tear down a temporary base directory ', () => {
      projectFixture.pathExists(base).should.be.false;
    });

    it('should change back to the original working directory', () => {
      process.cwd().should.equal(originalDirectory);
    });
  });
});
