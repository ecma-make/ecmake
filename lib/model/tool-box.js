const Task = require('./task');
const ErrorClassFactory = require('../error-class-factory');

ErrorClassFactory.register(module, 'TargetNotFoundError');

function lastOf(array) {
  return array.slice(-1)[0];
}

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

function walk(getSubNodes, nodeStack, doBefore, doAfter, resultStack = []) {
  if (doBefore !== undefined) doBefore(nodeStack, resultStack);
  getSubNodes(nodeStack, resultStack).forEach((child) => {
    nodeStack.push(child);
    walk(getSubNodes, nodeStack, doBefore, doAfter, resultStack);
    nodeStack.pop();
  });
  if (doAfter !== undefined) doAfter(nodeStack, resultStack);
}

function getSubNodesInTreeWalk(stack) {
  const node = lastOf(stack);
  return Object.values(node)
    .filter((child) => (child !== node.___parent && child instanceof Task));
}

function walkTree(stack, doBefore, doAfter) {
  walk(getSubNodesInTreeWalk, stack, doBefore, doAfter);
}

function getSubNodesInAwaitsWalk(stack) {
  return lastOf(stack).___dependencies;
}

function walkDependencies(stack, doBefore, doAfter) {
  walk(getSubNodesInAwaitsWalk, stack, doBefore, doAfter);
}

module.exports = {
  getTarget,
  lastOf,
  walkTree,
  walkDependencies,
  TargetNotFoundError: module.TargetNotFoundError,
};
