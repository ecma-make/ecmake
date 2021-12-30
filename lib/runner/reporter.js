const { EOL } = require('os');
const { toolBox } = require('../model');
const ErrorClassFactory = require('../error-class-factory');

module.exports = class Reporter {
  constructor(root) {
    this.root = root;
  }

  static log(...args) {
    process.stdout.write(`${args.join('')}${EOL}`);
  }

  makeReport(title, node, getSubNodes, makeEntry){
    const entries = [];
    const doBefore = (nodeStack, resultStack) => {
      const node = toolBox.lastOf(nodeStack);
      resultStack.push(node.getName());
      const entry = makeEntry(node, resultStack);
      if(entry) entries.push(entry);
    };
    const doAfter = (nodeStack, resultStack) => {
      resultStack.pop();
    };
    toolBox.walk(getSubNodes, [node], doBefore, doAfter);
    Reporter.log(EOL, title, EOL);
    Reporter.log(entries.join(EOL));
  }

  list() {
    const makeEntry = (node, resultStack) => {
      if (node.___listed) {
        let entry = ` - ${resultStack.slice(1).join('.')}`;
        if (node.___description !== null) {
          entry += EOL;
          entry += `     ${node.___description}`;
        }
        return entry;
      }
    };
    this.makeReport('Targets', this.root, toolBox.getSubNodesInTreeWalk, makeEntry);
  }

  listDescriptions() {
    const makeEntry = (node, resultStack) => {
      if (node.___description !== null) {
        let entry = ` - ${resultStack.slice(1).join('.')}`;
        if (node.___listed) {
          entry += ' (listed)';
        }
        entry += EOL;
        entry += `     ${node.___description}`;
        entry += EOL;
        return entry;
      }
    };
    this.makeReport('Descriptions', this.root, toolBox.getSubNodesInTreeWalk, makeEntry);
  }

  drawTree() {
    const makeEntry = (node, resultStack) => {
        return `  ${resultStack.join('.')}`;
    };
    this.makeReport('The target tree', this.root, toolBox.getSubNodesInTreeWalk, makeEntry);
  }

  showDependencies(target) {
    const task = toolBox.getTarget(this.root, target);
    const makeEntry = (node, resultStack) => {
      let entry = `${'  '.repeat(resultStack.length)} -`;
      entry += ` ${node.getPath()}`;
      return entry;
    }
    this.makeReport( `Dependencies of <${target}>`,
      task, toolBox.getSubNodesInAwaitsWalk, makeEntry);
  }

};

ErrorClassFactory.register(module.exports, 'InvalidTypeError');
