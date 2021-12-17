require('chai').should();
const { expect } = require('chai');

const { Task } = require('../..');

describe('Task', () => {
  const description = 'some description of a task';
  const dependencies = ['a', 'b', 'c'];

  describe('constructor', () => {
    it('should create a Task', () => {
      const task = new Task();
      (task instanceof Task).should.be.true;
      Task.name.should.equal('Task');
    });

    it('should set some initial properties', () => {
      const task = new Task();
      task.___listed.should.be.false;
      expect(task.___description).to.be.null;
      task.___dependencies.should.be.deep.equal([]);
      task.___willDoCallback.should.exist;
    });

    it('should recursively autocreate new Tasks', () => {
      const task = new Task();
      task.parent.child = 3;
      task.parent.child.should.equal(3);
    });

    it('should not autocreate props with three heading unserstores', () => {
      (() => new Task().___._).should.throw(TypeError);
    });
  });

  describe('listed', () => {
    it('should return this', () => {
      const task = new Task();
      task.listed().should.equal(task);
    });
    it('should set this.___listed to true', () => {
      const task = new Task();
      task.___listed.should.equal(false);
      task.listed();
      task.___listed.should.equal(true);
    });
  });

  describe('described', () => {
    it('should return this', () => {
      const task = new Task();
      task.described().should.equal(task);
    });
    it('should store this.___description', () => {
      const task = new Task();
      expect(task.___description).to.be.null;
      task.described(description);
      task.___description.should.equal(description);
    });
  });

  describe('awaits', () => {
    it('should return this', () => {
      const task = new Task();
      task.awaits().should.equal(task);
    });
    it('should store a bunch of dependencies into this.___dependencies', () => {
      const task = new Task();
      task.awaits(...dependencies);
      task.___dependencies.should.deep.equal(dependencies);
    });
  });

  describe('will', () => {
    it('should return this', () => {
      const task = new Task();
      task.will().should.equal(task);
    });
    it('should be optional to all', () => {
      const task = new Task();
      (typeof task.___willDoCallback).should.equal('function');
      return task.go();
    });
    it('should be able to set a callback', () => {
      const callback = () => {};
      const task = new Task().will(callback);
      task.___willDoCallback.should.equal(callback);
    });
  });

  describe('listed, described, awaits, will', () => {
    it('should be able to chain them', () => {
      const callback = () => {};
      const task = new Task()
        .listed()
        .described(description)
        .awaits(...dependencies)
        .will(callback);
      task.___listed.should.be.true;
      task.___description.should.equal(description);
      task.___dependencies.should.deep.equal(dependencies);
      task.___willDoCallback.should.equal(callback);
    });
    it('should take any order ', () => {
      const callback = () => {};
      const task = new Task()
        .will(callback)
        .awaits(...dependencies)
        .described(description)
        .listed();
      task.___listed.should.be.true;
      task.___description.should.equal(description);
      task.___dependencies.should.deep.equal(dependencies);
      task.___willDoCallback.should.equal(callback);
    });
  });

  describe('go', () => {
    it('should return this.___promise if promised before', () => {
      const promise = Promise.resolve();
      const task = new Task();
      task.___promise = promise;
      task.go().should.equal(promise);
    });
    it('should give a new promise if not promised before', () => {
      const task = new Task();
      const promise = task.go();
      task.___promise.should.equal(promise);
    });
    it('should execute the dependencies before', () => {
      const task1 = new Task().will(() => 1);
      const task2 = new Task().will(() => 2);
      const task3 = new Task().awaits(task1, task2)
        .will(() => [task1.result, task2.result]);
      return task3.go().then(() => task3.result.should.deep.equal([1, 2]));
    });
  });

  describe('result', () => {
    it('is initially undefined', () => {
      const task = new Task();
      (typeof task.result).should.equal('undefined');
    });
    it('is set once the task has been executed', () => {
      const task = new Task();
      task.___willDoCallback = () => 'DONE';
      return task.go().then(() => task.result.should.equal('DONE'));
    });
  });

  describe('ecmake DSL', () => {
    it('integration test', () => {
      const root = new Task();
      root.all.awaits(root.test).will(() => [root.test.t1.result, root.test.t2.result]);
      root.test.awaits(root.test.t1, root.test.t2);
      root.test.t1.awaits(root.env).will(() => `${root.env.result}+1`);
      root.test.t2.awaits(root.env).will(() => `${root.env.result}+2`);
      root.env.will(() => 'env');
      return root.all.go().then(() => {
        root.all.result.should.deep.equal(['env+1', 'env+2']);
      });
    });
  });
});
