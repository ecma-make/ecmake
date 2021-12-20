const Task = require('./task');
const ErrorClassFactory = require('../error-class-factory');

ErrorClassFactory.register(module, 'TargetNotFoundError');
function getTarget(root, target) {
  const parts = target.split('.');
  let current = root;
  parts.forEach((part) => {
    if (Reflect.has(current, part)) {
      current = current[part];
    } else {
      const msg = `Target <${target}> was not defined.`;
      throw new module.TargetNotFoundError(msg);
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
  getTarget,
  walkTree,
  walkDependencies,
  TargetNotFoundError: module.TargetNotFoundError,
};
