const { getTarget } = require('../model/tool-box');

module.exports = class TargetRunner {
  constructor(rootTask) {
    this.rootTask = rootTask;
  }

  go(target) {
    getTarget(this.rootTask, target).go();
  }
};
