const fs = require('fs');
const os = require('os');
const path = require('path');
const process = require('process');
const cp = require('child_process');

const ErrorClassFactory = require('../errorClassFactory');

module.exports = class ProjectFixture {
  constructor() {
    this.originalDirectory = process.cwd();
    this.projectBase = undefined;
    this.workingDirectory = undefined;
    this.prefix = 'ecmake';
    this.isUp = false;
  }

  setUp(base = '.') {
    // workingDirectory: the temporary directory of the fixture
    // base: project base may be specified as a subdirectory of workingDirectory
    const temp = path.join(os.tmpdir(), `${this.prefix}-`);
    process.chdir(fs.mkdtempSync(temp));
    // Determine, what the os thinks the working directory now.
    // There may be multiple links to it, i.e. on mac os.
    this.workingDirectory = process.cwd();
    const projectBase = path.resolve(base);
    fs.mkdirSync(projectBase, { recursive: true });
    process.chdir(projectBase);
    this.projectBase = process.cwd(); // ditto
    cp.execSync('npm init -y');
    cp.execSync('npm link @ecmake/ecmake');
    process.chdir(this.workingDirectory);
    this.isUp = true;
  }

  tearDown() {
    this.checkFixture();
    this.isUp = false;
    process.chdir(this.originalDirectory);
    fs.rmSync(this.workingDirectory, { recursive: true });
    this.projectBase = undefined;
    this.workingDirectory = undefined;
  }

  checkFixture() {
    if (!this.isUp) {
      throw new this.constructor.FIXTURE_DOWN_ERROR();
    }
  }

  getFullPathWithChecks(projectRelativeTarget) {
    this.checkFixture();
    if (path.isAbsolute(projectRelativeTarget)) {
      throw new this.constructor.ABSOLUTE_PATH_ERROR(
        'must be relative to project base',
      );
    }
    return path.join(this.projectBase, projectRelativeTarget);
  }

  initCodeFile(projectRelativeTarget = 'ecmakeCode.js') {
    this.checkFixture();
    const codeFile = this.getFullPathWithChecks(projectRelativeTarget);
    if (!codeFile.includes(this.projectBase)) {
      throw new this.constructor.OUTSIDE_OF_BASE_ERROR(
        `${codeFile} is outside of the ${this.projectBase}`,
      );
    }
    fs.mkdirSync(path.dirname(codeFile), { recursive: true });
    const templateFile = path.join(
      this.projectBase,
      'node_modules',
      '@ecmake',
      'ecmake',
      'templates',
      'ecmakeCode.init.js',
    );
    fs.copyFileSync(templateFile, codeFile);
  }

  removeCodeFile(projectRelativeTarget = 'ecmakeCode.js') {
    this.checkFixture();
    const codeFile = this.getFullPathWithChecks(projectRelativeTarget);
    fs.rmSync(codeFile);
    let directory = path.dirname(codeFile);
    while (directory.includes(this.projectBase) && directory !== this.projectBase) {
      try {
        fs.rmdirSync(directory);
        directory = path.dirname(directory);
      } catch (error) {
        if (error.code === 'ENOTEMPTY') {
          return;
        }
        throw error;
      }
    }
  }

  hasCodeFile(projectRelativeTarget = 'ecmakeCode.js') {
    this.checkFixture();
    return this.pathExists(projectRelativeTarget);
  }

  pathExists(relativeFileOrDirectory) {
    this.checkFixture();
    const resolvedPath = this.getFullPathWithChecks(relativeFileOrDirectory);
    try {
      fs.accessSync(resolvedPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;
      }
      throw error;
    }
    return true;
  }
};

ErrorClassFactory.register(module.exports, 'FIXTURE_DOWN_ERROR');
ErrorClassFactory.register(module.exports, 'ABSOLUTE_PATH_ERROR');
ErrorClassFactory.register(module.exports, 'OUTSIDE_OF_BASE_ERROR');
