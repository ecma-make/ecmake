const fs = require('fs');
const os = require('os');
const path = require('path');
const process = require('process');
const cp = require('child_process');

module.exports = class ProjectFixture {
  constructor() {
    this.prefix = 'ecmake';
    this.originalDirectory = process.cwd();
  }

  setUp() {
    const temp = path.join(os.tmpdir(), `${this.prefix}-`);
    process.chdir(fs.mkdtempSync(temp));
    // Determine, what the os thinks the working directory now.
    // There may be multiple links to it, i.e. on mac os.
    this.workingDirectory = process.cwd();
    cp.execSync('npm init -y');
    cp.execSync('npm link @ecmake/ecmake');
    return this.workingDirectory;
  }

  tearDown() {
    process.chdir(this.originalDirectory);
    fs.rmSync(this.workingDirectory, { recursive: true });
  }

  initCodeFile(target = 'ecmakeCode.js') {
    const codeFile = path.resolve(target);
    const base = path.resolve('');
    if (!codeFile.includes(base)) throw new Error(`${codeFile} outside of ${base}`);
    fs.mkdirSync(path.dirname(codeFile), { recursive: true });
    const templateFile = path.resolve(
      'node_modules',
      '@ecmake',
      'ecmake',
      'templates',
      'ecmakeCode.init.js',
    );
    fs.copyFileSync(templateFile, codeFile);
  }

  removeCodeFile(target = 'ecmakeCode.js') {
    const codeFile = path.resolve(target);
    const base = path.resolve('');
    if (!codeFile.includes(base)) throw new Error(`${codeFile} outside of ${base}`);
    fs.rmSync(codeFile);
    let directory = path.dirname(codeFile);
    while (directory.includes(base) && directory !== base) {
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

  hasCodeFile(target = 'ecmakeCode.js') {
    return this.pathExists(target);
  }

  pathExists(fileOrDirectory) {
    const resolvedPath = path.resolve(fileOrDirectory);
    try {
      fs.accessSync(resolvedPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;
      }
      throw error;
    }
    if (!resolvedPath.includes(this.workingDirectory)) {
      throw new Error(`${path} is outside of the project fixture`);
    }
    return true;
  }
};
