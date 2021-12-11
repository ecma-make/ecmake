const path = require('path');
const { makeOptions, makeHelp, makeOptionsHelp } = require('./commandline');
const Init = require('./init');
const Reader = require('./reader');
const Reporter = require('./reporter');
const TargetRunner = require('./targetRunner');
const packageJson = require('../../package.json');

module.exports = class Runner {
  constructor() {
    this.options = makeOptions();
    const base = path.resolve(__dirname, '..', '..');
    this.templatePath = path.join(base, 'templates', 'ecmakefile.init.js');
    this.file = this.options.file ? this.options.file : 'ecmakefile.js';
  }

  go() {
    if (this.options.base) {
      // change into the given base before running anything
      process.chdir(path.resolve(this.options.base));
    }
    if (this.options.init) {
      return new Init(this.templatePath, this.file).go();
    } if (this.options.target) {
      const root = new Reader(this.file).getRoot();
      return new TargetRunner(root).go(this.options.target);
    } if (typeof this.options.awaits !== 'undefined') {
      const root = new Reader(this.file).getRoot();
      const target = this.options.awaits === null
        ? 'default' : this.options.awaits;
      return new Reporter(root).showDependencies(target);
    } if (this.options.list) {
      const root = new Reader(this.file).getRoot();
      return new Reporter(root).list();
    } if (this.options.tree) {
      const root = new Reader(this.file).getRoot();
      return new Reporter(root).drawTree();
    } if (this.options.help) {
      return makeHelp();
    } if (this.options.version) {
      return process.stdout.write(`${packageJson.version}\n`);
    } if (this.options.options) {
      return makeOptionsHelp();
    }
    // No command option has been given at all.
    // If there is a makefile, we do the default target.
    // Else we fall back to help.
    let root;
    try {
      root = new Reader(this.file).getRoot();
    } catch (error) {
      return makeHelp();
    }
    return new TargetRunner(root).go('default');
  }
};
