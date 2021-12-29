require('chai').should();
const { fake, createStubInstance } = require('sinon');
const toolBox = require('../../../lib/model/tool-box');

const { lastOf } = toolBox;
const modelIndex = require('../../../lib/model');
const mainIndex = require('../../..');

const { Task } = mainIndex;

describe('toolBox', function () {
  it('should be exported by the main index', function () {
    toolBox.should.equal(mainIndex.toolBox);
  });

  it('should be exported by the model index', function () {
    toolBox.should.equal(modelIndex.toolBox);
  });

  it('should export five keys', function () {
    Object.keys(toolBox).length.should.equal(5);
  });

  it('should export TargetNotFoundError', function () {
    (toolBox.TargetNotFoundError.prototype instanceof Error)
      .should.be.true;
  });

  describe('.lastOf()', function () {
    it('should return the last element of an array', () => {
      lastOf([1, 2]).should.equal(2);
    });
  });

  describe('.getTarget()', function () {
    const tree = { A: { a: {} } };
    it('should get a valid child A', function () {
      toolBox.getTarget(tree, 'A').should.equal(tree.A);
    });
    it('should get a valid grand-child A.a', function () {
      toolBox.getTarget(tree, 'A.a').should.equal(tree.A.a);
    });
    it('should throw for an invalid child X', function () {
      try {
        toolBox.getTarget(tree, 'X').should.not.be.ok;
      } catch (error) {
        (error instanceof toolBox.TargetNotFoundError).should.be.true;
        error.message.should.include('X');
        error.message.should.include('not defined');
      }
    });
  });

  describe('.walkTree()', function () {
    describe('when callbacks are given', function () {
      const orderBefore = [];
      const orderAfter = [];
      const logBefore = (stk) => orderBefore.push(lastOf(stk));
      const logAfter = (stk) => orderAfter.push(lastOf(stk));
      const tree = createStubInstance(Task);
      tree.first = createStubInstance(Task);
      tree.inner = createStubInstance(Task);
      tree.inner.leaf = createStubInstance(Task);
      tree.noTask = {};
      tree.noTask.leaf = createStubInstance(Task);
      tree.last = createStubInstance(Task);

      tree.checkBefore = fake(logBefore);
      tree.checkAfter = fake(logAfter);
      tree.first.checkBefore = fake(logBefore);
      tree.first.checkAfter = fake(logAfter);
      tree.inner.checkBefore = fake(logBefore);
      tree.inner.checkAfter = fake(logAfter);
      tree.inner.leaf.checkBefore = fake(logBefore);
      tree.inner.leaf.checkAfter = fake(logAfter);
      tree.noTask.checkBefore = fake(logBefore);
      tree.noTask.checkAfter = fake(logAfter);
      tree.noTask.leaf.checkBefore = fake(logBefore);
      tree.noTask.leaf.checkAfter = fake(logAfter);
      tree.last.checkBefore = fake(logBefore);
      tree.last.checkAfter = fake(logAfter);

      const stack = [tree];
      before(function () {
        toolBox.walkTree(
          stack,
          (stk) => lastOf(stk).checkBefore(stk),
          (stk) => lastOf(stk).checkAfter(stk),
        );
      });

      it('should call once when entering the root node', function () {
        tree.checkBefore.callCount.should.equal(1);
      });
      it('should call once when leaving the root node', function () {
        tree.checkAfter.callCount.should.equal(1);
      });
      it('should call once when entering an inner node', function () {
        tree.inner.checkBefore.callCount.should.equal(1);
      });
      it('should call once when leaving an inner node', function () {
        tree.inner.checkAfter.callCount.should.equal(1);
      });
      it('should call once when entering a leaf node', function () {
        tree.inner.leaf.checkBefore.callCount.should.equal(1);
      });
      it('should call once when leaving a leaf node', function () {
        tree.inner.leaf.checkAfter.callCount.should.equal(1);
      });
      it('should call doBefore with the stack', function () {
        tree.inner.leaf.checkBefore.calledOnce.should.be.true;
        tree.inner.leaf.checkBefore.calledWith(stack).should.be.true;
      });
      it('should call doAfter with the stack', function () {
        tree.inner.leaf.checkAfter.calledOnce.should.be.true;
        tree.inner.leaf.checkAfter.calledWith(stack).should.be.true;
      });
      it('should not call doBefore if it is not a Task', function () {
        tree.noTask.checkBefore.callCount.should.equal(0);
      });
      it('should not call doAfter if it is not a Task', function () {
        tree.noTask.checkAfter.callCount.should.equal(0);
      });
      it('should not reach a child Task of a non-Task', function () {
        tree.noTask.leaf.checkBefore.callCount.should.equal(0);
      });
      it('should enter the nodes in the expected order', function () {
        orderBefore.should.have.ordered.members([
          tree, tree.first, tree.inner, tree.inner.leaf, tree.last,
        ]);
      });

      it('should leave the nodes in a different order', function () {
        orderAfter.should.have.ordered.members([
          tree.first, tree.inner.leaf, tree.inner, tree.last, tree,
        ]);
      });
    });

    describe('when no callbacks are given', function () {
      it('should not complain', function () {
        toolBox.walkTree([createStubInstance(Task)]);
      });
    });

    describe('when ___parent is set to a Task', function () {
      const root = createStubInstance(Task);
      root.checkBefore = fake();
      root.id = 'root';
      root.child = createStubInstance(Task);
      root.child.id = 'child';
      root.child.checkBefore = fake();
      root.child.___parent = root;
      it('should not run an endless cycle', function () {
        toolBox.walkTree([root], (stk) => lastOf(stk).checkBefore(stk));
        root.checkBefore.calledOnce.should.be.true;
        root.child.checkBefore.calledOnce.should.be.true;
      });
    });
  });

  describe('.walkDependencies()', function () {
    describe('with callbaks', function () {
      const orderBefore = [];
      const orderAfter = [];
      const logBefore = (stk) => orderBefore.push(lastOf(stk).id);
      const logAfter = (stk) => orderAfter.push(lastOf(stk).id);
      const tree = {
        id: 'root',
        checkBefore: fake(logBefore),
        checkAfter: fake(logAfter),
        ___dependencies: [
          {
            id: 'first',
            checkBefore: fake(logBefore),
            checkAfter: fake(logAfter),
            ___dependencies: [],
          },
          {
            id: 'inner',
            checkBefore: fake(logBefore),
            checkAfter: fake(logAfter),
            ___dependencies: [
              {
                id: 'leaf',
                checkBefore: fake(logBefore),
                checkAfter: fake(logAfter),
                ___dependencies: [],
              },
            ],
          },
          {
            id: 'last',
            checkBefore: fake(logBefore),
            checkAfter: fake(logAfter),
            ___dependencies: [],
          },
        ],
      };

      before(function () {
        toolBox.walkDependencies(
          [tree],
          (stk) => lastOf(stk).checkBefore(stk),
          (stk) => lastOf(stk).checkAfter(stk),
        );
      });

      it('should enter the nodes in the expected order', function () {
        orderBefore.should.have.ordered.members(
          ['root', 'first', 'inner', 'leaf', 'last'],
        );
      });

      it('should leave the nodes in a different order', function () {
        orderAfter.should.have.ordered.members(
          ['first', 'leaf', 'inner', 'last', 'root'],
        );
      });
    });

    describe('without callbaks', function () {
      it('should not complain', function () {
        toolBox.walkDependencies([{ ___dependencies: [] }]);
      });
    });
  });
});
