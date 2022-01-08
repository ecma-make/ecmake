require('chai').should();

const Task = require('../../../lib/model/task');
const modelIndex = require('../../../lib/model');
const mainIndex = require('../../..');

describe('Task', () => {
  const description = 'some description of a task';
  const dependencies = ['a', 'b', 'c'];

  it('should be exported by the model index', function () {
    Task.should.equal(modelIndex.Task);
  });

  it('should be exported by the main index', function () {
    Task.should.equal(mainIndex.Task);
  });

  describe('.constructor()', () => {
    it('should create a Task', () => {
      const task = new Task();
      (task instanceof Task).should.be.true;
      Task.name.should.equal('Task');
    });

    it('should set some initial properties', () => {
      const task = new Task();
      (task.___parent === null).should.be.true;
      task.___listed.should.be.false;
      (task.___description === null).should.be.true;
      task.___dependencies.should.be.deep.equal([]);
      task.___willDoCallback.should.exist;
    });

    it('should recursively autocreate new Tasks', () => {
      const root = new Task();
      (root.one.two instanceof Task).should.be.true;
    });

    it('should not autocreate props with three heading unserstores', () => {
      (() => new Task().___._).should.throw(TypeError);
    });

    it('should set the parent when autocreated', () => {
      const root = new Task();
      root.one.___parent.should.equal(root);
    });
  });

  describe('.getParent()', () => {
    it('should return the parent task', () => {
      const task = new Task();
      task.___parent = new Task();
      task.getParent().should.equal(task.___parent);
    });
    describe('when root task', () => {
      it('should return null', () => {
        (new Task().getParent() === null).should.be.true;
      });
    });
  });

  describe('.getName()', () => {
    it('should return the property name within parent', () => {
      const root = new Task();
      root.one.getName().should.equal('one');
    });
    describe('when root task', () => {
      it('should return <root>', () => {
        (new Task()).getName().should.equal('root');
      });
    });
  });

  describe('.getStack()', () => {
    it('should return the stack of nodes from root to task', () => {
      const root = new Task();
      root.one.two.getStack().should.have.ordered.members(
        [root, root.one, root.one.two],
      );
    });
    describe('when root task', () => {
      it('should contain the root task alone', () => {
        const root = new Task();
        root.getStack().should.have.members([root]);
      });
    });
  });

  describe('.getPath()', () => {
    const root = new Task();
    describe('when <withRoot> is true', () => {
      it('should return the path from root down to the task', () => {
        root.one.two.getPath(true).should.equal('root.one.two');
      });
      describe('when at root', () => {
        it('should return <root>', () => {
          root.getPath(true).should.equal('root');
        });
      });
    });
    describe('when <withRoot> is false', () => {
      it('should return the path without the trailing root', () => {
        root.one.two.getPath(false).should.equal('one.two');
      });
      describe('when at root', () => {
        it('should return the empty string', () => {
          root.getPath(false).should.equal('');
        });
      });
    });
    describe('when <withRoot> is not given', () => {
      it('should default to the behaviour of false', () => {
        root.one.two.getPath().should.equal('one.two');
      });
      describe('when at root', () => {
        it('should return the empty string', () => {
          root.getPath().should.equal('');
        });
      });
    });
  });

  describe('.listed()', () => {
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

  describe('.described()', () => {
    it('should return this', () => {
      const task = new Task();
      task.described().should.equal(task);
    });
    it('should store this.___description', () => {
      const task = new Task();
      (task.___description === null).should.be.true;
      task.described(description);
      task.___description.should.equal(description);
    });
  });

  describe('.awaits()', () => {
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

  describe('.handleWillDoArgument()', () => {
    describe('when the argument is a promise', () => {
      const promise = new Promise((resolve) => {}); // eslint-disable-line no-unused-vars
      it('should return a function', () => {
        const task = new Task();
        const result = task.handleWillDoArgument(promise);
        (typeof result).should.equal('function');
      });
      it(' - which should return the original promise', () => {
        const task = new Task();
        const result = task.handleWillDoArgument(promise);
        result.call().should.equal(promise);
      });
    });
    describe('when the argument is a function', () => {
      describe('when the function has no parameters', () => {
        const func = () => {};
        it('should return the func', () => {
          const task = new Task();
          task.handleWillDoArgument(func).should.equal(func);
        });
      });
      describe('when the function has one parameter', () => {
        const func = (resolve) => {}; // eslint-disable-line no-unused-vars
        it('should return a function', () => {
          const task = new Task();
          const result = task.handleWillDoArgument(func);
          (typeof result).should.equal('function');
        });
        it(' - which should return a promise', () => {
          const task = new Task();
          const result = task.handleWillDoArgument(func);
          (result.call() instanceof Promise).should.be.true;
        });
      });
      describe('when the function has two parameters', () => {
        const func = (resolve, reject) => {}; // eslint-disable-line no-unused-vars
        it('should return a function', () => {
          const task = new Task();
          const result = task.handleWillDoArgument(func);
          (typeof result).should.equal('function');
        });
        it(' - which should return a promise', () => {
          const task = new Task();
          const result = task.handleWillDoArgument(func);
          (result.call() instanceof Promise).should.be.true;
        });
      });
    });
  });

  describe('.will()', () => {
    it('should return this', () => {
      const task = new Task();
      task.will(() => undefined).should.equal(task);
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

  describe('.listed(), .described(), .awaits(), .will()', () => {
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

  describe('.go()', () => {
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
    it('should should reject upon error to stop the further execution', () => {
      const myError = new Error('break');
      let errorThrown = false;
      let errorCatched = false;
      let dependentDone = false;
      const breakingTask = new Task()
        .will(() => {
          errorThrown = true;
          throw myError;
        });
      const dependingTask = new Task()
        .awaits(breakingTask)
        .will(() => {
          // must not be executed
          dependentDone = true;
        });
      return dependingTask.go().catch((e) => {
        e.should.equal(myError);
        errorCatched = true;
      }).then(() => {
        errorThrown.should.be.true;
        errorCatched.should.be.true;
        dependentDone.should.be.false;
      });
    });
  });

  describe('.result()', () => {
    it('should initially be undefined', () => {
      const task = new Task();
      (typeof task.result).should.equal('undefined');
    });
    it('should be set after the task has been executed', () => {
      const task = new Task();
      const value = 'DONE';
      task.___willDoCallback = () => value;
      return task.go().then(() => task.result.should.equal(value));
    });
  });

  describe('different DSL setups', () => {
    describe('when being used to set up a synchronous tree of tasks', () => {
      it('should run the full chain of dependencies', () => {
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
    describe('DSL setups with kinds of .will() arguments', () => {
      describe('when the code is synchornous', () => {
        describe('when .will() takes a function', () => {
          it('should run and set a result', () => {
            const result = 'DONE';
            const root = new Task();
            root.will(() => result);
            return root.go().then(() => {
              root.result.should.equal(result);
            });
          });
        });
      });
      describe('when the code is asynchornous', () => {
        describe('when .will() takes a function returning a promise', () => {
          it('should run and set a result', () => {
            const result = 'DONE';
            const root = new Task();
            root.will(() => new Promise((resolve) => { resolve(result); }));
            return root.go().then(() => {
              root.result.should.equal(result);
            });
          });
        });
        describe('when .will() takes a promise', () => {
          it('should run and set a result', () => {
            const result = 'DONE';
            const root = new Task();
            root.will(new Promise((resolve) => { resolve(result); }));
            return root.go().then(() => {
              root.result.should.equal(result);
            });
          });
        });
        describe('when .will() takes a promise callback', () => {
          it('should run and set a result', () => {
            const result = 'DONE';
            const root = new Task();
            root.will((resolve) => resolve(result));
            return root.go().then(() => {
              root.result.should.equal(result);
            });
          });
        });
      });
    });
  });
});
