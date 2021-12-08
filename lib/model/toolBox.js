const Task = require('./task');

class TargetNotFoundError extends Error {
  constructor(target) {
    super(`Target <${target}> was not defined.`);
    this.name = this.constructor.name;
  }
}

function getTarget(root, target) {
  const parts = target.split('.');
  if (parts[0] === 'root') { parts.shift(); }
  let current = root;
  parts.forEach((part) => {
    if (Reflect.has(current, part)) {
      current = current[part];
    } else {
      throw new TargetNotFoundError(target);
    }
  });
  return current;
}

function walkTree(name, node, doBefore, doAfter) {
  if (doBefore) doBefore(name, node);
  Object.entries(node).forEach(([key, value]) => {
    if (value instanceof Task) {
      walkTree(key, value, doBefore, doAfter);
    }
  });
  if (doAfter) doAfter(name, node);
}

function walkDependencies(node, doBefore, doAfter) {
  if (doBefore) doBefore(node);
  node.___dependencies.forEach((dependency) => {
    walkDependencies(dependency, doBefore, doAfter);
  });
  if (doAfter) doAfter(node);
}

module.exports = {
  getTarget, walkTree, walkDependencies, TargetNotFoundError,
};
