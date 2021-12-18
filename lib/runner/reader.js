/* eslint-disable max-classes-per-file */

const path = require('path');
const { Task } = require('../model');

class Reader {
  constructor(file) {
    this.makefile = path.resolve(file);
  }

  getRoot() {
    let root;
    try {
      /* eslint-disable import/no-dynamic-require, global-require */
      root = require(this.makefile);
      /* eslint-enable import/no-dynamic-require, global-require */
    } catch (error) {
      throw new Reader.NoMakefileError(this.makefile);
    }
    if (!(root instanceof Task)) {
      throw new Reader.NoRootTaskError(this.makefile);
    }
    return root;
  }
}

Reader.NoRootTaskError = class NoRootTaskError extends Error {
  constructor(makefile) {
    super(`The makefile <${makefile}> must export a root Task.`);
    this.name = this.constructor.name;
  }
};

Reader.NoMakefileError = class NoMakefileError extends Error {
  constructor(makefile) {
    super(`Could not find or read the makefile. Tried to read <${makefile}>.`);
    this.name = this.constructor.name;
  }
};

module.exports = Reader;

/* eslint-enable max-classes-per-file */
