require('chai').should();
const path = require('path');
const fs = require('fs');

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

  describe('codeFile management', () => {
    const codeFile = 'ecmakeCode.js';
    const otherCodeFile = 'otherEcmakeCode.js';
    let projectFixture;
    let codeFilePath;
    let otherCodeFilePath;

    before(() => {
      projectFixture = new ProjectFixture();
      projectFixture.setUp();
      codeFilePath = path.resolve(codeFile);
      otherCodeFilePath = path.resolve(otherCodeFile);
    });

    after(() => {
      projectFixture.tearDown();
    });

    afterEach(() => {
      fs.rmSync(codeFilePath, { force: true });
      fs.rmSync(otherCodeFilePath, { force: true });
      projectFixture.pathExists(codeFilePath).should.be.false;
      projectFixture.pathExists(otherCodeFilePath).should.be.false;
    });

    describe('initCodeFile', () => {
      it('should create ./ecmakeCode.js', () => {
        projectFixture.initCodeFile();
        projectFixture.pathExists(codeFilePath);
      });
      it('should create a target given as argument', () => {
        projectFixture.initCodeFile(otherCodeFile);
        projectFixture.pathExists(otherCodeFilePath);
      });
    });

    describe('hasCodeFile', () => {
      it('should return false for a missing codeFile', () => {
        projectFixture.hasCodeFile().should.be.false;
      });

      it('should return false for a missing codeFile given as argument', () => {
        projectFixture.hasCodeFile(otherCodeFile).should.be.false;
      });

      it('should return true for an existing codeFile', () => {
        fs.writeFileSync(codeFilePath, '');
        projectFixture.hasCodeFile().should.be.true;
      });

      it('should return true for an existing codeFile given as argument', () => {
        fs.writeFileSync(otherCodeFilePath, '');
        projectFixture.hasCodeFile(otherCodeFile).should.be.true;
      });
    });

    describe('removeCodeFile', () => {
      it('should remove an existing codeFile', () => {
        fs.writeFileSync(codeFilePath, '');
        projectFixture.removeCodeFile();
        projectFixture.pathExists(codeFilePath).should.be.false;
      });

      it('should remove an existing codeFile given by argument', () => {
        fs.writeFileSync(otherCodeFilePath, '');
        projectFixture.removeCodeFile(otherCodeFile);
        projectFixture.pathExists(otherCodeFile).should.be.false;
      });

      it('should not complain for a missing codeFile', () => {
        projectFixture.removeCodeFile();
      });

      it('should not complain for a missing codeFile given by argument', () => {
        projectFixture.removeCodeFile(otherCodeFile);
      });
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
