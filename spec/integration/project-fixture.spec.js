require('chai').should();
const path = require('path');
const fs = require('fs');

const ProjectFixture = require('../..').testing.ProjectFixture;

describe('ProjectFixture', function x() {
  this.timeout(5000);
  describe('constructor', () => {
    const originalDirectory = process.cwd();
    const projectFixture = new ProjectFixture();
    it('should be constructable', () => {
      (projectFixture instanceof ProjectFixture).should.be.true;
    });
    it('should set the prefix', () => {
      projectFixture.prefix.should.equal('ecmake');
    });
    it('should store the original direcotry', () => {
      projectFixture.originalDirectory.should.equal(originalDirectory);
    });
    it('should initially set isUp to false', () => {
      projectFixture.isUp.should.be.false;
    });
    it('should initially set projectBase to undefined', () => {
      (typeof projectFixture.projectBase).should.equal('undefined');
    });
    it('should initially set workingDirectory to undefined', () => {
      (typeof projectFixture.workingDirectory).should.equal('undefined');
    });
  });

  [undefined, ['.'], ['one'], ['one', 'two']].forEach((base) => {
    const offset = base ? path.join(...base) : undefined;
    const head = offset ? `base: <${offset}>` : 'base: [undefined]';
    describe(head, () => {
      describe('setUp', () => {
        const projectFixture = new ProjectFixture();

        before(() => {
          if (offset) {
            projectFixture.setUp(offset);
          } else {
            projectFixture.setUp();
          }
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

        it('should change into the temporary directory', () => {
          process.cwd().should.equal(projectFixture.workingDirectory);
        });

        it('should use the argument offset for the project base', () => {
          const expected = path.join(projectFixture.workingDirectory, offset || '');
          projectFixture.projectBase.should.equal(expected);
        });

        it('should have created the project base', () => {
          projectFixture.pathExists('').should.be.true;
        });

        it('should have initialized a new project', () => {
          projectFixture.pathExists('package.json').should.be.true;
        });

        it('should have linked @ecmake/ecmake', () => {
          const pkg = path.join('node_modules', '@ecmake', 'ecmake');
          projectFixture.pathExists(pkg).should.be.true;
        });
      });

      describe('tearDown', () => {
        describe('shared fixture', () => {
          let originalDirectory;
          let intermediateWorkingDirectory;
          let intermediateProjectBase;
          const projectFixture = new ProjectFixture();

          before(() => {
            originalDirectory = process.cwd();
            if (offset) {
              projectFixture.setUp(offset);
            } else {
              projectFixture.setUp();
            }
            intermediateWorkingDirectory = projectFixture.workingDirectory;
            intermediateProjectBase = projectFixture.projectBase;
            projectFixture.tearDown();
          });

          it('should set fixture.isUp to false', () => {
            projectFixture.isUp.should.be.false;
          });

          it('should tear down the project base', () => {
            try {
              fs.accessSync(intermediateProjectBase);
            } catch (error) {
              if (error.code !== 'ENOENT') {
                throw error;
              }
            }
          });

          it('should tear down the temporary directory ', () => {
            try {
              fs.accessSync(intermediateWorkingDirectory);
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
        describe('unshared setup', () => {
          const projectFixture = new ProjectFixture();
          it('should fully reset the original state', () => {
            const before = JSON.stringify(projectFixture);
            if (offset) {
              projectFixture.setUp(offset);
            } else {
              projectFixture.setUp();
            }
            projectFixture.initCodeFile(path.join('one', 'codeFile.js'));
            const between = JSON.stringify(projectFixture);
            projectFixture.tearDown();
            const after = JSON.stringify(projectFixture);
            after.should.not.equal(between);
            after.should.equal(before);
          });
        });
      });
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
        if (!(error instanceof ProjectFixture.FIXTURE_DOWN_ERROR)) throw error;
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
            (error instanceof ProjectFixture.FIXTURE_DOWN_ERROR).should.be.true;
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
        (error instanceof ProjectFixture.ABSOLUTE_PATH_ERROR).should.be.true;
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
    const codeFile = 'ecmake-code.js';
    const otherCodeFile = 'other-ecmake-code.js';
    const directoryCodeFile = path.join('one', 'two', 'ecmake-code.js');
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
      it('should create ./ecmake-code.js of the default argument', () => {
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
