const { Task, toolBox } = require('./model');
const ErrorClassFactory = require('./error-class-factory');

module.exports = {
  ErrorClassFactory,
  Task,
  toolBox,
  makeRoot() {
    return new Task();
  },
};
