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
      throw new this.constructor.NO_CODE_FILE_ERROR(
        `Could not find or read the codeFile. Tried to read <${this.codeFile}>.`,
      );
    }
    if (!(root instanceof Task)) {
      throw new this.constructor.NO_ROOT_TASK_ERROR(
        `The codeFile <${this.codeFile}> must export a root Task.`,
      );
    }
    return root;
  }
};
ErrorClassFactory.register(module.exports, 'NO_ROOT_TASK_ERROR');
ErrorClassFactory.register(module.exports, 'NO_CODE_FILE_ERROR');
