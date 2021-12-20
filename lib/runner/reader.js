const path = require('path');
const { Task } = require('../model');
const ErrorClassFactory = require('../error-class-factory');

module.exports = class Reader {
  constructor(file) {
    this.codeFile = path.resolve(file);
  }

  getRoot() {
    let root;
    try {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      root = require(this.codeFile);
    } catch (error) {
      throw new this.constructor.NoCodeFileError(
        `Could not find or read the codeFile. Tried to read <${this.codeFile}>.`,
      );
    }
    if (!(root instanceof Task)) {
      throw new this.constructor.NoRootTaskError(
        `The codeFile <${this.codeFile}> must export a root Task.`,
      );
    }
    return root;
  }
};
ErrorClassFactory.register(module.exports, 'NoRootTaskError');
ErrorClassFactory.register(module.exports, 'NoCodeFileError');
