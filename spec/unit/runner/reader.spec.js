require('chai').should();
const path = require('path');
const { fake } = require('sinon');
const proxyQuireStrict = require('proxyquire').noCallThru();

const lib = '../../../lib';
const Reader = require(`${lib}/runner/reader`);

describe('Reader', function () {
  describe('.constructor(codePath)', function () {
    const codePath = 'codePath';
    let reader;
    before(function () {
      reader = new Reader(codePath);
    });
    it('should create a Raider', function () {
      (reader instanceof Reader).should.be.true;
      Reader.name.should.equal('Reader');
    });
    it('should resolve codePath into this.resolvedCodePath', function () {
      reader.resolvedCodePath.should.not.equal(codePath);
      reader.resolvedCodePath.should.equal(path.resolve(codePath));
    });
  });
  describe('when accessing own error classes', function () {
    ['InvalidRootTaskError', 'NoCodeFileError'].forEach(function (error) {
      it(`should offer Reader.${error}`, function () {
        Reader[error].should.be.ok;
      });
      it('- descendent of Error', function () {
        (Reader[error].prototype instanceof Error).should.be.true;
      });
    });
  });
  describe('.getRoot()', function () {
    describe('when things go well', function () {
      const FakeTask = fake();
      const rootTask = new FakeTask();
      const resolvedCodePath = 'resolvedCodePath';
      const ReaderProxy = proxyQuireStrict(`${lib}/runner/reader`, {
        '../model': { Task: FakeTask },
        resolvedCodePath: rootTask, // proxy for require(resolvedCodePath);
      });
      const reader = new ReaderProxy('dummy');
      reader.resolvedCodePath = resolvedCodePath;
      let root;
      before(function () {
        root = reader.getRoot();
      });
      it('should return the root Task', function () {
        root.should.equal(rootTask);
      });
    });
    describe('when the code file could not be found', function () {
      const invalidPath = path.resolve('invalidPath');
      const reader = new Reader('.');
      reader.resolvedCodePath = invalidPath;
      let error;
      before(function () {
        try {
          reader.getRoot();
        } catch (e) {
          error = e;
        }
      });
      it('should throw NoCodeFileError', function () {
        (error instanceof Reader.NoCodeFileError).should.be.true;
      });
      it('- with an informative error message', function () {
        ['not', 'find', 'or', 'read', invalidPath].forEach(
          (string) => { error.message.should.have.string(string); },
        );
      });
    });
    describe('when the code file does not export a Task', function () {
      const resolvedCodePath = 'resolvedCodePath';
      const invalidRootTask = 'not a Task, just a string';
      const ReaderProxy = proxyQuireStrict(`${lib}/runner/reader`, {
        resolvedCodePath: invalidRootTask,
      });
      const reader = new ReaderProxy('dummy');
      reader.resolvedCodePath = resolvedCodePath;
      let error;
      before(function () {
        try {
          reader.getRoot();
        } catch (e) {
          error = e;
        }
      });
      it('should throw InvalidRootTaskError', function () {
        (error instanceof ReaderProxy.InvalidRootTaskError).should.be.true;
      });
      it('- with an informative error message', function () {
        [resolvedCodePath, 'must', 'export', 'root', 'Task'].forEach(
          (string) => { error.message.should.have.string(string); },
        );
      });
    });
  });
});
