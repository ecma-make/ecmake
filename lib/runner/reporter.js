const { toolBox } = require('../model');
const ErrorClassFactory = require('../error-class-factory');

module.exports = class Reporter {
  constructor(root) {
    this.root = root;
  }

  list() {
    Reporter.log('\n', 'Targets', '\n');
    const results = this.walkTree('list');
    Reporter.log(results.sort().join('\n'));
  }

  listDescriptions() {
    Reporter.log('\n', 'Descriptions', '\n');
    const results = this.walkTree('descriptions');
    Reporter.log(results.sort().join('\n'));
  }

  drawTree() {
    Reporter.log('\n', 'The target tree', '\n');
    const results = this.walkTree('tree');
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
      Reporter.log(line);
      level += 1;
    }, () => { level -= 1; });
  }

  walkTree(type) {
    const stack = [];
    const results = [];
    toolBox.walkTree(
      'root',
      this.root,
      (name, node) => {
        stack.push(name);
        if (type === 'tree') {
          const path = stack.join('.');
          results.push(` ${path}`);
        } else if (type === 'descriptions') {
          const path = stack.slice(1).join('.');
          if (node.___description !== null) {
            let line = ` * ${path}`;
            line += ` "${node.___description}"`;
            if (node.___listed) {
              line += ' (listed)';
            }
            results.push(line);
          }
        } else if (type === 'list') {
          const path = stack.slice(1).join('.');
          if (node.___listed) {
            let line = ` * ${path}`;
            if (node.___description !== null) {
              line += ` "${node.___description}"`;
            }
            results.push(line);
          }
        } else {
          throw new this.constructor.InvalidTypeError(`invalid type <${type}>`);
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

ErrorClassFactory.register(module.exports, 'InvalidTypeError');
