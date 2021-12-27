require('chai').should();
const {EOL} = require('os');

const proxyQuireStrict = require('proxyquire').noCallThru();
const { fake, createStubInstance, replace, replaceGetter, restore } = require('sinon');
const path = require('path');
const sandbox = require("sinon").createSandbox();

const lib = '../../../lib';
const Runner = require(`${lib}/runner/index`);

describe('Runner', function () {
  describe('.constructor()', function () {
    const makeOptions = fake.returns({});
    const templatePath = 'templatePath';
    const path = { resolve: fake.returns(templatePath), };
    const commandLine = { makeOptions };
    const RunnerProxy = proxyQuireStrict(`${lib}/runner/runner`, {
      'path': path,
      './command-line': commandLine,
    });
    const runner = new RunnerProxy();
    it('should create a Runner', function () {
      (runner instanceof RunnerProxy).should.be.true;
      RunnerProxy.name.should.equal('Runner');
    });
    it('should call path.resolve() once', function () {
      path.resolve.calledOnce.should.be.true;
    });
    it(' - for "../../templates/ecmake-code.init.js"', function () {
      path.resolve.calledWith('..', '..', 'templates', 'ecmake-code.init.js');
    });
    it(' - and set the result to this.templatePath"', function () {
      runner.templatePath.should.equal(templatePath);
    });
    describe(`when option code is not given`, function () {
      it('should set this.code to <ecmake-code.js>', function () {
        runner.code.should.equal('ecmake-code.js');
      });
    });
    {
      const code = 'my-ecmake-code.js';
      describe(`when option code is <${code}>`, function () {
        const RunnerProxy = proxyQuireStrict(`${lib}/runner/runner`, {
          './command-line': { makeOptions: fake.returns({ code })  },
        });
        const runner = new RunnerProxy();
        it(`should set this.code to <${code}>`, function () {
          runner.code.should.equal(code);
        });
      });
    }
  });
  describe('.go()', function () {
    describe('when this.options.base is set', function () {
      describe('when called with --base base', function () {
        const base = 'the base';
        let runner;
        before(function() {
          replace(process, 'chdir', fake());
          replace(process, 'argv', ['before', '--base', base, 'after']);
          runner = createStubInstance(Runner);
          runner.options = { base };
          runner.go = Runner.prototype.go;
          runner.delegateToFinalEnvironment = fake();
          runner.go();
        });
        after(function() {
          restore();
        });
        it('should call process.chdir() once', function() {
          process.chdir.calledOnce.should.be.true;
        });
        it(' - with the resolved base path', function() {
          const resolvedBase = path.resolve(base);
          resolvedBase.should.not.equal(base);
          process.chdir.calledWith(resolvedBase).should.be.true;
        });
        it(`should remove <--base base> from process.argv`, function() {
          process.argv.should.have.lengthOf(2);
          process.argv.should.deep.equal(['before', 'after']);
        });
      });
      describe('when called wiht -b base', function () {
        const base = 'the base';
        let runner;
        before(function() {
          replace(process, 'chdir', fake());
          replace(process, 'argv', ['before', '-b', base, 'after']);
          runner = createStubInstance(Runner);
          runner.options = { base };
          runner.go = Runner.prototype.go;
          runner.delegateToFinalEnvironment = fake();
          runner.go();
        });
        after(function() {
          restore();
        });
        it('should call process.chdir() once', function() {
          process.chdir.calledOnce.should.be.true;
        });
        it(' - with the resolved base path', function() {
          const resolvedBase = path.resolve(base);
          resolvedBase.should.not.equal(base);
          process.chdir.calledWith(resolvedBase).should.be.true;
        });
        it(`should remove <-b base> from process.argv`, function() {
          process.argv.should.have.lengthOf(2);
          process.argv.should.deep.equal(['before', 'after']);
        });
      });
    });
    describe('when ECMAKE_DOIT is falsy', function () {
      let runner;
      before(function() {
        replace(process, 'env', { ECMAKE_DOIT: 0});
        runner = createStubInstance(Runner);
        runner.go = Runner.prototype.go;
        runner.options = {};
        runner.go();
      });
      after(function() {
        restore();
      });
      it('should call delegateToFinalEnvironment() once', function() {
        runner.delegateToFinalEnvironment.calledOnce.should.be.true;
      });
    });
    describe('when ECMAKE_DOIT is truthy', function () {
      let runner;
      before(function() {
        replace(process, 'env', { ECMAKE_DOIT: 1});
        runner = createStubInstance(Runner);
        runner.go = Runner.prototype.go;
        runner.options = {};
        runner.go();
      });
      after(function() {
        restore();
      });
      it('should call doIt() once', function() {
        runner.doIt.calledOnce.should.be.true;
      });
    });
  });
  describe('.delegateToFinalEnvironment()', () => {
    let RunnerProxy;
    let runner;
    const spawnResult = {stdout: 'from stdout', stderr: 'from stderr'};
    const cpr = { spawnSync: fake.returns(spawnResult) };
    const supportsColor = { stdout: undefined, };
    const stdoutWrite = fake();
    const stdout = function() { return { write: stdoutWrite } };
    const stderrWrite = fake();
    const stderr = function() { return { write: stderrWrite } };
    const env = { FROM_OUTSIDE: 1};
    const argv = ['arg1', 'arg2', 'arg3'];
    before(() => {
      replace(process, 'env', env);
      replace(process, 'argv', argv);
      replaceGetter(process, 'stdout', stdout);
      replaceGetter(process, 'stderr', stderr);
      RunnerProxy = proxyQuireStrict(`${lib}/runner/runner`, {
        'child_process': cpr,
        'supports-color': supportsColor,
      });
      runner = new RunnerProxy();
      runner.delegateToFinalEnvironment();
    });
    after(() => restore());

    it('should write to stdout', () => {
      stdoutWrite.called.should.be.true;
    });
    it('should write to stderr', () => {
      stderrWrite.called.should.be.true;
    });
    it('should call child_process.spawnSync once', () => {
      cpr.spawnSync.calledOnce.should.be.true;
    });
    it(' - with npm command', () => {
      cpr.spawnSync.calledOnce.should.be.true;
      cpr.spawnSync.args[0][0].should.equal('npm');
    });
    it(' - with exec -- ecmake', () => {
      const arguments = cpr.spawnSync.args[0][1];
      arguments.slice(0, 3).should.deep.equal(['exec', '--', 'ecmake']);
    });
    it(' - and arguments without the leading two', () => {
      const arguments = cpr.spawnSync.args[0][1];
      arguments.should.not.include('arg1');
      arguments.should.not.include('arg2');
      arguments.should.include('arg3');
    });
    it(' - with options containing env', () => {
      cpr.spawnSync.args[0][2].env.should.be.ok;
    });
    it(' - where env.FROM_OUTSIDE is 1', () => {
      cpr.spawnSync.args[0][2].env.FROM_OUTSIDE.should.equal(1);
    });
    it(' - where env.ECMAKE_DOIT is true', () => {
      cpr.spawnSync.args[0][2].env.ECMAKE_DOIT.should.equal(true);
    });
    describe('when the terminal does not support color', () => {
      it(' - where env.FORCE_COLOR is 0', () => {
        cpr.spawnSync.args[0][2].env.FORCE_COLOR.should.equal(0);
      });
    });
    describe('when terminal does support color level 2', () => {
      before(() => {
        cpr.spawnSync = fake.returns(spawnResult);
        supportsColor.stdout = { level: 2 };
        runner = new RunnerProxy();
        runner.delegateToFinalEnvironment();
      });
      it(' - where env.FORCE_COLOR is 2', () => {
        cpr.spawnSync.args[0][2].env.FORCE_COLOR.should.equal(2);
      });
    });
  });
  describe('.getRoot()', function () {
      const root = 'the root task';
      const getRoot = fake.returns(root);
      const Reader = fake(function () { return { getRoot }; });
      const RunnerProxy = proxyQuireStrict(`${lib}/runner/runner`, {
        './reader': Reader,
      });
      let runner;
      let result;
      before(() => {
        runner = new RunnerProxy();
        runner.code = 'codePath';
        result = runner.getRoot();
      });
      it('should call new Reader() once', () => {
        Reader.calledOnce.should.be.true;
        Reader.calledWithNew().should.be.true;
      });
      it(' - with this.code', () => {
        Reader.calledWith(runner.code).should.be.true;
      });
      it(' - chaining .getRoot() once', () => {
        getRoot.calledOnce.should.be.true;
      });
      it(' - which should return root', () => {
        getRoot.returned(root).should.be.true;
      });
      it('should return root', () => {
        result.should.equal(root);
      });
  });

  describe('.doIt()', function () {
    const root = 'the root task';
    describe('when --init', function () {
      const go = fake();
      const Init = fake(function () { return { go }; });
      const RunnerProxy = proxyQuireStrict(`${lib}/runner/runner`, {
        './init': Init,
      });
      let runner;
      before(() => {
        runner = new RunnerProxy();
        runner.options.init = true;
        runner.templatePath = 'templatePath';
        runner.code = 'codePath';
        runner.doIt();
      });
      it('should call new Init() once', () => {
        Init.calledOnce.should.be.true;
        Init.calledWithNew().should.be.true;
      });
      it(' - with this.templatePath and this.code', () => {
        Init.calledWith(runner.templatePath, runner.code).should.be.true;
      });
      it(' - chaning .go() once', () => {
        go.calledOnce.should.be.true;
      });
    });
    describe('when --target', function () {
      const go = fake();
      const TargetRunner = fake(function () { return { go }; });
      const RunnerProxy = proxyQuireStrict(`${lib}/runner/runner`, {
        './target-runner': TargetRunner,
      });
      const runner = new RunnerProxy();
      runner.options.target = 'theTarget';
      runner.getRoot = fake.returns(root);
      before(() => {
        runner.doIt();
      });
      it('should call this.getRoot() once getting root', () => {
        runner.getRoot.calledOnce.should.be.true;
        runner.getRoot.returned(root).should.be.true;
      });
      it('should call new TargetRunner() once', () => {
        TargetRunner.calledOnce.should.be.true;
        TargetRunner.calledWithNew().should.be.true;
      });
      it(' - with root', () => {
        TargetRunner.calledWith(root).should.be.true;
      });
      it(' - chaining .go() once', () => {
        go.calledOnce.should.be.true;
      });
      it(' - with this.options.target', () => {
        go.calledWith(runner.options.target).should.be.true;
      });
    });
    describe('when --awaits', function () {
      const showDependencies = fake();
      const Reporter = fake(function () { return { showDependencies }; });
      const RunnerProxy = proxyQuireStrict(`${lib}/runner/runner`, {
        './reporter': Reporter,
      });
      const Mock = fake();
      Mock.prototype.doIt = RunnerProxy.prototype.doIt;
      Mock.prototype.getRoot = fake.returns(root);
      const runner = new Mock();
      runner.options = { awaits: 'theTarget' };
      before(() => { runner.doIt(); });
      it('should call this.getRoot() once getting root', () => {
        runner.getRoot.calledOnce.should.be.true;
        runner.getRoot.returned(root).should.be.true;
      });
      it('should call new Reporter() once', () => {
        Reporter.calledOnce.should.be.true;
        Reporter.calledWithNew().should.be.true;
      });
      it(' - with root', () => {
        Reporter.calledWith(root).should.be.true;
      });
      it(' - chaining .showDependencies() once', () => {
        showDependencies.calledOnce.should.be.true;
      });
      it(' - with this.options.awaits', () => {
        showDependencies.calledWith(runner.options.awaits).should.be.true;
      });
      describe('when called with empty target', function () {
        const runner = new Mock();
        runner.options = { awaits: null };
        before(() => { runner.doIt(); });
        it(' - with <default>', () => {
          showDependencies.lastCall.calledWith('default').should.be.true;
        });
      });
    });
    describe('when --list', function () {
      const list = fake();
      const Reporter = fake(function () { return { list }; });
      const RunnerProxy = proxyQuireStrict(`${lib}/runner/runner`, {
        './reporter': Reporter,
      });
      const Mock = fake();
      Mock.prototype.doIt = RunnerProxy.prototype.doIt;
      Mock.prototype.getRoot = fake.returns(root);
      const runner = new Mock();
      runner.options = { list: true };
      before(() => { runner.doIt(); });
      it('should call this.getRoot() once getting root', () => {
        runner.getRoot.calledOnce.should.be.true;
        runner.getRoot.returned(root).should.be.true;
      });
      it('should call new Reporter() once', () => {
        Reporter.calledOnce.should.be.true;
        Reporter.calledWithNew().should.be.true;
      });
      it(' - with root', () => {
        Reporter.calledWith(root).should.be.true;
      });
      it(' - chaining .list() once', () => {
        list.calledOnce.should.be.true;
      });
    });
    describe('when --descriptions', function () {
      const listDescriptions = fake();
      const Reporter = fake(function () { return { listDescriptions }; });
      const RunnerProxy = proxyQuireStrict(`${lib}/runner/runner`, {
        './reporter': Reporter,
      });
      const Mock = fake();
      Mock.prototype.doIt = RunnerProxy.prototype.doIt;
      Mock.prototype.getRoot = fake.returns(root);
      const runner = new Mock();
      runner.options = { descriptions: true };
      before(() => { runner.doIt(); });
      it('should call this.getRoot() once getting root', () => {
        runner.getRoot.calledOnce.should.be.true;
        runner.getRoot.returned(root).should.be.true;
      });
      it('should call new Reporter() once', () => {
        Reporter.calledOnce.should.be.true;
        Reporter.calledWithNew().should.be.true;
      });
      it(' - with root', () => {
        Reporter.calledWith(root).should.be.true;
      });
      it(' - chaining .listDescriptions() once', () => {
        listDescriptions.calledOnce.should.be.true;
      });
    });
    describe('when --tree', function () {
      const drawTree = fake();
      const Reporter = fake(function () { return { drawTree }; });
      const RunnerProxy = proxyQuireStrict(`${lib}/runner/runner`, {
        './reporter': Reporter,
      });
      const Mock = fake();
      Mock.prototype.doIt = RunnerProxy.prototype.doIt;
      Mock.prototype.getRoot = fake.returns(root);
      const runner = new Mock();
      runner.options = { tree: true };
      before(() => { runner.doIt(); });
      it('should call this.getRoot() once getting root', () => {
        runner.getRoot.calledOnce.should.be.true;
        runner.getRoot.returned(root).should.be.true;
      });
      it('should call new Reporter() once', () => {
        Reporter.calledOnce.should.be.true;
        Reporter.calledWithNew().should.be.true;
      });
      it(' - with root', () => {
        Reporter.calledWith(root).should.be.true;
      });
      it(' - chaining .drawTree() once', () => {
        drawTree.calledOnce.should.be.true;
      });
    });
    describe('when --help', function () {
      const makeHelp = fake();
      const RunnerProxy = proxyQuireStrict(`${lib}/runner/runner`, {
        './command-line': {makeHelp},
      });
      const Mock = fake();
      Mock.prototype.doIt = RunnerProxy.prototype.doIt;
      const runner = new Mock();
      runner.options = { help: true };
      before(() => { runner.doIt(); });
      it('should call command-line#makeHelp() once', () => {
        makeHelp.calledOnce.should.be.true;
      });
    });
    describe('when --version', function () {
      const version = 'x.x.x';
      const RunnerProxy = proxyQuireStrict(`${lib}/runner/runner`, {
        '../../package.json': {version},
      });
      const Mock = fake();
      Mock.prototype.doIt = RunnerProxy.prototype.doIt;
      const runner = new Mock();
      runner.options = { version: true };
      const stdoutWrite = fake();
      const stdout = function() { return { write: stdoutWrite } };
      before(() => {
        replaceGetter(process, 'stdout', stdout);
        runner.doIt();
      });
      after(() => restore());
      it('should write to stdout', () => {
        stdoutWrite.called.should.be.true;
      });
      it(' - with package.json#version', () => {
        stdoutWrite.args[0][0].should.have.string(version);
      });
      it(' - with line break', () => {
        stdoutWrite.args[0][0].should.have.string(EOL);
      });
    });
    describe('when --options', function () {
      const makeOptionsHelp = fake();
      const RunnerProxy = proxyQuireStrict(`${lib}/runner/runner`, {
        './command-line': {makeOptionsHelp},
      });
      const Mock = fake();
      Mock.prototype.doIt = RunnerProxy.prototype.doIt;
      const runner = new Mock();
      runner.options = { options: true };
      before(() => { runner.doIt(); });
      it('should call command-line#makeOptionsHelp() once', () => {
        makeOptionsHelp.calledOnce.should.be.true;
      });
    });
    describe('when no command option is given', function () {
      describe('when a root task can be be found', function () {
        const go = fake();
        const TargetRunner = fake(function () { return { go }; });
        const RunnerProxy = proxyQuireStrict(`${lib}/runner/runner`, {
          './target-runner': TargetRunner,
        });
        const Mock = fake();
        Mock.prototype.doIt = RunnerProxy.prototype.doIt;
        const runner = new Mock();
        runner.getRoot = fake.returns(root);
        runner.options = { };
        runner.code = 'xxx';
        before(() => { runner.doIt(); });
        it('should call this.getRoot() once getting root', () => {
          runner.getRoot.calledOnce.should.be.true;
          runner.getRoot.returned(root).should.be.true;
        });
        it('should call new TargetRunner() once', () => {
          TargetRunner.calledOnce.should.be.true;
          TargetRunner.calledWithNew().should.be.true;
        });
        it(' - with root', () => {
          TargetRunner.calledWith(root).should.be.true;
        });
        it(' - chaining .go() once', () => {
          go.calledOnce.should.be.true;
        });
        it(' - with <default>', () => {
          go.calledWith('default').should.be.true;
        });
      });
      describe('when no root task can be found', function () {
        const makeHelp = fake();
        const RunnerProxy = proxyQuireStrict(`${lib}/runner/runner`, {
          './command-line': {makeHelp},
        });
        const Mock = fake();
        Mock.prototype.doIt = RunnerProxy.prototype.doIt;
        const runner = new Mock();
        runner.options = { };
        runner.code = 'xxx';
        runner.getRoot = fake.throws('no root');
        before(() => { runner.doIt(); });
        it('should call this.getRoot() once', () => {
          runner.getRoot.calledOnce.should.be.true;
        });
        it(' - which should throw', () => {
          runner.getRoot.threw().should.be.true;
        });
        it('should call command-line#makeHelp() once', () => {
          makeHelp.calledOnce.should.be.true;
        });
      });
    });
  });
});
