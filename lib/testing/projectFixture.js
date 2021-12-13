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
