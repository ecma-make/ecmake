// eslint-disable-next-line max-classes-per-file
module.exports = class ErrorClassFactory {
  static register(owningClass, errorName) {
    const fullName = `${owningClass.name}.${errorName}`;
    // eslint-disable-next-line no-param-reassign
    owningClass[errorName] = class extends Error {
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
