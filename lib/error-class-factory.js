// eslint-disable-next-line max-classes-per-file
const Module = require('module');
const path = require('path');

module.exports = class ErrorClassFactory {
  static register(parentClassOrModule, errorName) {
    let parentName;
    if (parentClassOrModule instanceof Module) {
      parentName = `[module: ${path.basename(parentClassOrModule.id)}]`;
    } else {
      parentName = parentClassOrModule.name;
    }
    const fullName = `${parentName}.${errorName}`;
    // eslint-disable-next-line no-param-reassign
    parentClassOrModule[errorName] = class extends Error {
      constructor(args) {
        super(args);
        this.name = fullName;
        const lines = this.stack.split(/\n/);
        lines.splice(0, 1, '', `   ${fullName}: ${this.message}`, '');
        this.stack = lines.join('\n');
      }
    };
  }
};
