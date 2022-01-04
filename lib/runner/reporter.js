const { EOL } = require('os');
const { toolBox } = require('../model');

module.exports = class Reporter {
  constructor(root) {
    this.root = root;
  }

  static report(title, entries) {
    process.stdout.write(EOL);
    process.stdout.write(`  ${title}`);
    process.stdout.write(EOL);
    process.stdout.write(EOL);
    process.stdout.write(entries.join(EOL));
    process.stdout.write(EOL);
  }

  static makeEntries(node, getSubNodes, makeEntry) {
    const entries = [];
    const doBefore = (nodeStack, resultStack) => {
      const head = nodeStack.slice(-1)[0];
      resultStack.push(head.getName());
      const entry = makeEntry(head, resultStack);
      if (entry) entries.push(entry);
    };
    const doAfter = (nodeStack, resultStack) => {
      resultStack.pop();
    };
    toolBox.walk(getSubNodes, [node], doBefore, doAfter);
    return entries;
  }

  list() {
    const makeEntry = (node, resultStack) => {
      if (node.___listed) {
        let entry = ' '.repeat(2);
        entry += `- ${resultStack.slice(1).join('.')}`;
        if (node.___description) {
          entry += EOL;
          entry += ' '.repeat(6);
          entry += node.___description;
        }
        return entry;
      }
      return undefined;
    };
    const entries = this.constructor
      .makeEntries(this.root, toolBox.getSubNodesInTreeWalk, makeEntry);
    entries.sort();
    this.constructor.report('Targets', entries);
  }

  listDescriptions() {
    const makeEntry = (node, resultStack) => {
      if (node.___description) {
        let entry = ' '.repeat(2);
        entry += `- ${resultStack.slice(1).join('.')}`;
        if (node.___listed) {
          entry += ' (listed)';
        }
        entry += EOL;
        entry += ' '.repeat(6);
        entry += node.___description;
        entry += EOL;
        return entry;
      }
      return undefined;
    };
    const entries = this.constructor
      .makeEntries(this.root, toolBox.getSubNodesInTreeWalk, makeEntry);
    entries.sort();
    this.constructor.report('Descriptions', entries);
  }

  drawTree() {
    const makeEntry = (node, resultStack) => {
      let entry = ' '.repeat(2);
      entry += resultStack.join('.');
      return entry;
    };
    const entries = this.constructor
      .makeEntries(this.root, toolBox.getSubNodesInTreeWalk, makeEntry);
    entries.sort();
    this.constructor.report('The target tree', entries);
  }

  showDependencies(target) {
    const task = toolBox.getTarget(this.root, target);
    const makeEntry = (node, resultStack) => {
      let entry = ' '.repeat(2 * resultStack.length);
      entry += '- ';
      entry += node.getPath();
      return entry;
    };
    const entries = this.constructor
      .makeEntries(task, toolBox.getSubNodesInAwaitsWalk, makeEntry);
    this.constructor.report(`Dependencies of <${target}>`, entries);
  }
};
