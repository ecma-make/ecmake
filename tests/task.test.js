require('chai').should();

const { Task } = require('..');

describe('Task', () => {
  const title = 'SOME DESCRIPTIVE TITLE';
  const dependencies = ['a', 'b', 'c'];

  describe('constructor', () => {
    it('should create a Task', () => {
      const task = new Task();
      (task instanceof Task).should.be.true;
      Task.name.should.equal('Task');
    });

    it('should recursively create undefined props as new Tasks', () => {
      const task = new Task();
      task.parent.child = 3;
      task.parent.child.should.equal(3);
    });

    it('should not autocreate props with three heading unserstores', () => {
      (() => new Task().___._).should.throw(TypeError);
    });
  });

  describe('titled', () => {
    it('should return this', () => {
      const task = new Task();
      task.titled().should.equal(task);
    });
    it('should store title into this.___title', () => {
      const task = new Task();
      task.titled(title);
      task.___title.should.equal(title);
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

  describe('titled, awaits, will', () => {
    it('should be able to chain them', () => {
      const callback = () => {};
      const task = new Task().titled(title).awaits(...dependencies)
        .will(callback);
      task.___title.should.equal(title);
      task.___dependencies.should.deep.equal(dependencies);
      task.___willDoCallback.should.equal(callback);
    });
    it('should take any order ', () => {
      const callback = () => {};
      const task = new Task()
        .will(callback)
        .awaits(...dependencies)
        .titled(title);
      task.___title.should.equal(title);
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
