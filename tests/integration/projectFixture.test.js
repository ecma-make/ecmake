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
    describe('without project base offset', () => {
      let projectFixture;

      before(() => {
        projectFixture = new ProjectFixture();
        projectFixture.setUp();
      });

      after(() => {
        projectFixture.tearDown();
      });

      it('should set fixture.isUp to true', () => {
        projectFixture.isUp.should.be.true;
      });

      it('should use the prefix', () => {
        projectFixture.workingDirectory.should.include('ecmake');
      });

      it('should be identical in workingDirectory and projectBase', () => {
        projectFixture.workingDirectory.should.equal(
          projectFixture.projectBase,
        );
      });

      it('should setup a temporary base directory ', () => {
        projectFixture.pathExists('').should.be.true;
      });

      it('should change into the temporary directory', () => {
        process.cwd().should.equal(projectFixture.workingDirectory);
      });

      it('should have initialized a new project', () => {
        projectFixture.pathExists('package.json').should.be.true;
      });

      it('should have linked @ecmake/ecmake', () => {
        const pkg = path.join('node_modules', '@ecmake', 'ecmake');
        projectFixture.pathExists(pkg).should.be.true;
      });
    });

    describe('with project base offset', () => {
      let projectFixture;
      const baseOffset = path.join('one', 'two');
      let workingDirectory;
      let projectBase;

      before(() => {
        projectFixture = new ProjectFixture();
        projectFixture.setUp(baseOffset);
        workingDirectory = projectFixture.workingDirectory;
        projectBase = projectFixture.projectBase;
      });

      after(() => {
        projectFixture.tearDown();
      });

      it('should create project base with the given argument as an offset', () => {
        projectBase.should.equal(path.join(workingDirectory, baseOffset));
      });

      it('should have initialized a new project in project base', () => {
        projectFixture.pathExists('package.json').should.be.true;
      });

      it('should have linked @ecmake/ecmake', () => {
        const pkg = path.join('node_modules', '@ecmake', 'ecmake');
        projectFixture.pathExists(pkg).should.be.true;
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
      projectFixture.setUp();
      base = projectFixture.workingDirectory;
      projectFixture.pathExists('').should.be.true;
      projectFixture.tearDown();
    });

    after(() => {
      try {
        fs.accessSync(base);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    });

    it('should set fixture.isUp to false', () => {
      projectFixture.isUp.should.be.false;
    });

    it('should tear down a temporary base directory ', () => {
      try {
        fs.accessSync(base);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    });

    it('should change back to the original working directory', () => {
      process.cwd().should.equal(originalDirectory);
    });
  });

  describe('checkFixture', () => {
    let projectFixture;

    before(() => {
      projectFixture = new ProjectFixture();
      projectFixture.setUp();
      projectFixture.tearDown(); // close the context immidiatly
    });

    after(() => {
      try {
        projectFixture.tearDown();
      } catch (error) {
        if (error.code !== 'ecmakeFixtureDown') throw error;
      }
    });

    ['initCodeFile', 'hasCodeFile', 'removeCodeFile', 'pathExists',
      'getFullPathWithChecks', 'tearDown']
      .forEach((method) => {
        it(`should warn ${method} of a teared down fixture`, () => {
          try {
            projectFixture[method]();
            throw new Error('should not be reached');
          } catch (error) {
            error.code.should.equal('ecmakeFixtureDown');
          }
        });
      });
  });

  describe('getFullPathWithChecks', () => {
    let projectFixture;

    beforeEach(() => {
      projectFixture = new ProjectFixture();
    });

    afterEach(() => {
      projectFixture.tearDown();
    });

    it('should throw for absolute pathes', () => {
      projectFixture.setUp();
      try {
        projectFixture.getFullPathWithChecks(path.resolve('.'));
        throw new Error('should not be reached');
      } catch (error) {
        error.code.should.equal('ecmakeAbsolutePathError');
      }
    });

    it('should base path on project base', () => {
      const base = path.join('path', 'to', 'project', 'base');
      projectFixture.setUp(base);
      const result = projectFixture.getFullPathWithChecks('three');
      const expected = path.resolve(projectFixture.projectBase, 'three');
      result.should.equal(expected);
    });
  });

  describe('pathExists', () => {
    let projectFixture;

    before(() => {
      projectFixture = new ProjectFixture();
      projectFixture.setUp();
    });

    after(() => {
      projectFixture.tearDown();
    });

    it('should return true for ""', () => {
      projectFixture.pathExists('').should.be.true;
    });

    it('should return true for an existing directory', () => {
      projectFixture.pathExists('node_modules').should.be.true;
    });

    it('should return false for a non-existing directory', () => {
      projectFixture.pathExists('foo').should.be.false;
    });
  });

  describe('codeFile management', () => {
    let projectFixture;
    const base = path.join('one', 'two');
    // input targets
    const codeFile = 'ecmakeCode.js';
    const otherCodeFile = 'otherEcmakeCode.js';
    const directoryCodeFile = path.join('one', 'two', 'ecmakeCode.js');
    const directoryCodeFileRoot = path.join('one');
    // paths of control
    let codeFilePath;
    let otherCodeFilePath;
    let directoryCodeFilePath;
    let directoryCodeFileRootPath;

    before(() => {
      projectFixture = new ProjectFixture();
      projectFixture.setUp(base);
      codeFilePath = path.resolve(base, codeFile);
      otherCodeFilePath = path.resolve(base, otherCodeFile);
      directoryCodeFilePath = path.resolve(base, directoryCodeFile);
      directoryCodeFileRootPath = path.resolve(base, directoryCodeFileRoot);
    });

    after(() => {
      projectFixture.tearDown();
    });

    afterEach(() => {
      fs.rmSync(codeFilePath, { force: true });
      fs.rmSync(otherCodeFilePath, { force: true });
      fs.rmSync(directoryCodeFileRootPath, { force: true, recursive: true });
      projectFixture.pathExists(codeFile).should.be.false;
      projectFixture.pathExists(otherCodeFile).should.be.false;
      projectFixture.pathExists(directoryCodeFileRoot).should.be.false;
    });

    describe('initCodeFile', () => {
      it('should create ./ecmakeCode.js of the default argument', () => {
        projectFixture.initCodeFile();
        projectFixture.pathExists(codeFile);
      });

      it('should create a given target file', () => {
        projectFixture.initCodeFile(otherCodeFile);
        projectFixture.pathExists(otherCodeFile);
      });

      it('should create a given target recursively with required subdirectories', () => {
        projectFixture.initCodeFile(directoryCodeFile);
        projectFixture.pathExists(directoryCodeFile);
      });
    });

    describe('hasCodeFile', () => {
      it('should return false for a missing codeFile of the argument default', () => {
        projectFixture.hasCodeFile().should.be.false;
      });

      it('should return false for a missing codeFile', () => {
        projectFixture.hasCodeFile(otherCodeFile).should.be.false;
      });

      it('should return false for a missing codeFile within an existing subdirectory', () => {
        fs.mkdirSync(path.dirname(directoryCodeFilePath), { recursive: true });
        projectFixture.hasCodeFile(directoryCodeFile).should.be.false;
      });

      it('should return false for a missing codeFile within a missing subdirectory', () => {
        projectFixture.hasCodeFile(directoryCodeFile).should.be.false;
      });

      it('should return true for an existing codeFile of the argument default', () => {
        fs.writeFileSync(codeFilePath, '');
        projectFixture.hasCodeFile().should.be.true;
      });

      it('should return true for an existing codeFile', () => {
        fs.writeFileSync(otherCodeFilePath, '');
        projectFixture.hasCodeFile(otherCodeFile).should.be.true;
      });

      it('should return true for an existing codeFile within a subdirectory', () => {
        fs.mkdirSync(path.dirname(directoryCodeFilePath), { recursive: true });
        fs.writeFileSync(directoryCodeFilePath, '');
        projectFixture.hasCodeFile(directoryCodeFile).should.be.true;
      });
    });

    describe('removeCodeFile', () => {
      it('should remove an existing codeFile of the default argument', () => {
        fs.writeFileSync(codeFilePath, '');
        projectFixture.removeCodeFile();
        projectFixture.pathExists(codeFile).should.be.false;
      });

      it('should remove an existing codeFile', () => {
        fs.writeFileSync(otherCodeFilePath, '');
        projectFixture.removeCodeFile(otherCodeFile);
        projectFixture.pathExists(otherCodeFile).should.be.false;
      });

      it('should remove an existing codeFile and the parent folders up to base', () => {
        fs.mkdirSync(path.dirname(directoryCodeFilePath), { recursive: true });
        fs.writeFileSync(directoryCodeFilePath, '');
        projectFixture.removeCodeFile(directoryCodeFile);
        projectFixture.pathExists(directoryCodeFile).should.be.false;
        projectFixture.pathExists(directoryCodeFileRoot).should.be.false;
        projectFixture.pathExists(directoryCodeFileRoot).should.be.false;
      });

      it('should stop removing if a folder is not empty', () => {
        fs.mkdirSync(path.dirname(directoryCodeFilePath), { recursive: true });
        fs.writeFileSync(path.join(directoryCodeFileRootPath, 'stopper.txt'), '');
        fs.writeFileSync(directoryCodeFilePath, '');
        projectFixture.removeCodeFile(directoryCodeFile);
        projectFixture.pathExists(directoryCodeFile).should.be.false;
        projectFixture.pathExists(directoryCodeFileRoot).should.be.true;
      });

      it('should complain of a missing codeFile of the default argument', () => {
        try {
          projectFixture.removeCodeFile();
          throw new Error('should not come here');
        } catch (error) {
          error.code.should.equal('ENOENT');
        }
      });

      it('should not complain of a missing codeFile', () => {
        try {
          projectFixture.removeCodeFile(otherCodeFile);
          throw new Error('should not come here');
        } catch (error) {
          error.code.should.equal('ENOENT');
        }
      });

      it('should not complain of a missing codeFile within a subdirectory', () => {
        try {
          projectFixture.removeCodeFile(directoryCodeFile);
          throw new Error('should not come here');
        } catch (error) {
          error.code.should.equal('ENOENT');
        }
      });
    });
  });
});
