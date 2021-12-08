const { toolBox } = require('../model');

module.exports = class Reporter {
  constructor(root) {
    this.root = root;
  }

  list() {
    Reporter.log('\n', 'Titled targets', '\n');
    const results = this.walkTree(false);
    Reporter.log(results.sort().join('\n'));
  }

  drawTree() {
    Reporter.log('\n', 'The target tree', '\n');
    const results = this.walkTree(true);
    Reporter.log(results.sort().join('\n'));
  }

  showDependencies(target) {
    Reporter.log('\n', `Dependencies of <${target}>`, '\n');
    const stack = [];
    toolBox.walkTree(
      'root',
      this.root,
      (name, node) => {
        stack.push(name);
        node.___path = stack.slice(1).join('.'); // eslint-disable-line no-param-reassign
      },
      () => { stack.pop(); },
    );
    const task = toolBox.getTarget(this.root, target);
    let level = 0;
    toolBox.walkDependencies(task, (node) => {
      let line = `${'  '.repeat(level)} -`;
      line += ` ${node.___path}`;
      if (node.___title) { line += `: "${node.___title}"`; }
      Reporter.log(line);
      level += 1;
    }, () => { level -= 1; });
  }

  walkTree(tree = false) {
    const stack = [];
    const results = [];
    toolBox.walkTree(
      'root',
      this.root,
      (name, node) => {
        stack.push(name);
        if (tree) {
          const path = stack.join('.');
          if (node.___title) {
            results.push(` ${path}: "${node.___title}"`);
          } else {
            results.push(` ${path}`);
          }
        } else if (node.___title) {
          const path = stack.slice(1).join('.');
          results.push(` * ${path}: "${node.___title}"`);
        }
      },
      () => { stack.pop(); },
    );
    return results;
  }

  static log(...args) {
    process.stdout.write(`${args.join('')}\n`);
  }
};
