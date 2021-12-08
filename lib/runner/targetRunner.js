const { getTarget } = require('../model/toolBox');

module.exports = class TargetRunner {
  constructor(root) {
    this.root = root;
  }

  go(target) {
    getTarget(this.root, target).go();
  }
};
