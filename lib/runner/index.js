/* eslint class-methods-use-this: ["error", { "exceptMethods": ["delegateToFinalEnvironment"] }] */

const cpr = require('child_process');
const path = require('path');
const supportsColor = require('supports-color');
const { makeOptions, makeHelp, makeOptionsHelp } = require('./command-line');
const Init = require('./init');
const Reader = require('./reader');
const Reporter = require('./reporter');
const TargetRunner = require('./target-runner');
const packageJson = require('../../package.json');

module.exports = class Runner {
  constructor() {
    this.options = makeOptions();
    const base = path.resolve(__dirname, '..', '..');
    this.templatePath = path.join(base, 'templates', 'ecmake-code.init.js');
    this.code = this.options.code ? this.options.code : 'ecmake-code.js';
  }

  go() {
    if (this.options.base) {
      // change into the given base before running anything
      process.chdir(path.resolve(this.options.base));
      // consume the used --base option
      ['--base', '-b'].forEach((argument) => {
        const index = process.argv.indexOf(argument);
        if (index > -1) process.argv.splice(index, 2);
      });
    }
    if (process.env.ECMAKE_DOIT) {
      this.doIt();
    } else {
      this.delegateToFinalEnvironment();
    }
  }

  delegateToFinalEnvironment() {
    const args = ['exec', '--', 'ecmake'].concat(process.argv.slice(2));
    const options = {
      env: {
        ...process.env,
        FORCE_COLOR: supportsColor.stdout ? supportsColor.stdout.level : 0,
        ECMAKE_DOIT: true,
      },
    };
    const result = cpr.spawnSync('npm', args, options);
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
  }

  doIt() {
    if (this.options.init) {
      return new Init(this.templatePath, this.code).go();
    } if (this.options.target) {
      const root = new Reader(this.code).getRoot();
      return new TargetRunner(root).go(this.options.target);
    } if (typeof this.options.awaits !== 'undefined') {
      const root = new Reader(this.code).getRoot();
      const target = this.options.awaits === null
        ? 'default' : this.options.awaits;
      return new Reporter(root).showDependencies(target);
    } if (this.options.list) {
      const root = new Reader(this.code).getRoot();
      return new Reporter(root).list();
    } if (this.options.descriptions) {
      const root = new Reader(this.code).getRoot();
      return new Reporter(root).listDescriptions();
    } if (this.options.tree) {
      const root = new Reader(this.code).getRoot();
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
      root = new Reader(this.code).getRoot();
    } catch (error) {
      return makeHelp();
    }
    return new TargetRunner(root).go('default');
  }
};
