const path = require('path');
const { Task } = require('../model');
const ErrorClassFactory = require('../error-class-factory');

module.exports = class Reader {
  constructor(codePath) {
    this.resolvedCodePath = path.resolve(codePath);
  }

  getRoot() {
    let root;
    try {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      root = require(this.resolvedCodePath);
    } catch (error) {
      throw new this.constructor.NoCodeFileError(
        `Could not find or read the code. Tried to read <${this.resolvedCodePath}>.`,
      );
    }
    if (!(root instanceof Task)) {
      throw new this.constructor.InvalidRootTaskError(
        `<${this.resolvedCodePath}> must export a root Task.`,
      );
    }
    return root;
  }
};
ErrorClassFactory.register(module.exports, 'InvalidRootTaskError');
ErrorClassFactory.register(module.exports, 'NoCodeFileError');
