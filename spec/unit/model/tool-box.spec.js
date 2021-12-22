require('chai').should();
const { fake, createStubInstance } = require('sinon');
const toolBox = require('../../../lib/model/tool-box');
const modelIndex = require('../../../lib/model');
const mainIndex = require('../../..');
const Task = mainIndex.Task;

describe('tool box', function () {
  it('should be exported by the main index', function () {
    toolBox.should.equal(mainIndex.toolBox);
  });

  it('should be exported by the model index', function () {
    toolBox.should.equal(modelIndex.toolBox);
  });

  it('should export four keys', function () {
    Object.keys(toolBox).length.should.equal(4);
  });

  it('should export TargetNotFoundError', function () {
    (toolBox.TargetNotFoundError.prototype instanceof Error)
      .should.be.true;
  });

  describe('getTarget', function () {
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

  describe('walkTree', function () {
    describe('with callbacks', function() {
      const orderBefore = [];
      const orderAfter = [];
      const logBefore = (name) => orderBefore.push(name);
      const logAfter = (name) => orderAfter.push(name);
      const tree = createStubInstance(Task);
      tree.first = createStubInstance(Task);
      tree.inner = createStubInstance(Task);
      tree.inner.leaf = createStubInstance(Task);
      tree.noTask = {};
      tree.noTask.leaf = createStubInstance(Task);
      tree.last = createStubInstance(Task);

      tree.first.checkBefore = fake(logBefore);
      tree.first.checkAfter = fake(logAfter);
      tree.checkBefore = fake(logBefore);
      tree.checkAfter = fake(logAfter);
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


      before(function () {
        toolBox.walkTree(
          'tree',
          tree,
          (name, node) => node.checkBefore(name, node),
          (name, node) => node.checkAfter(name, node),
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
      it('should call doBefore with the outer name', function () {
        tree.inner.checkBefore.lastCall.args[0].should.equal('inner');
      });
      it('should call doBefore with the node itself', function () {
        tree.inner.checkBefore.lastCall.args[1].should.equal(tree.inner);
      });
      it('should call doAfter with the outer name', function () {
        tree.inner.checkAfter.lastCall.args[0].should.equal('inner');
      });
      it('should call doAfter with the node itself', function () {
        tree.inner.checkAfter.lastCall.args[1].should.equal(tree.inner);
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
        const expected = ['tree', 'first', 'inner', 'leaf', 'last'];
        orderBefore.should.deep.equal(expected);
      });

      it('should leave the nodes in a different order', function () {
        const expected = ['first', 'leaf', 'inner', 'last', 'tree'];
        orderAfter.should.deep.equal(expected);
      });
    });

    describe('without callbaks', function () {
      it('should not complain', function() {
        const tree = createStubInstance(Task);
        toolBox.walkTree( 'tree', tree);
      });
    });
  });

  describe('walkDependencies', function () {
    describe('with callbaks', function () {
      const orderBefore = [];
      const orderAfter = [];
      const logBefore = (node) => orderBefore.push(node);
      const logAfter = (node) => orderAfter.push(node);
      const tree = {
        checkBefore: fake(logBefore),
        checkAfter: fake(logAfter),
        ___dependencies: [
          {
            checkBefore: fake(logBefore),
            checkAfter: fake(logAfter),
            ___dependencies: [],
          },
          {
            checkBefore: fake(logBefore),
            checkAfter: fake(logAfter),
            ___dependencies: [
              {
                checkBefore: fake(logBefore),
                checkAfter: fake(logAfter),
                ___dependencies: [],
              },
            ],
          },
          {
            checkBefore: fake(logBefore),
            checkAfter: fake(logAfter),
            ___dependencies: [],
          },
        ],
      };

      before(function () {
        toolBox.walkDependencies(
          tree,
          (node) => node.checkBefore(node),
          (node) => node.checkAfter(node),
        );
      });

      it('should enter the nodes in the expected order', function () {
        const expected = [
          tree,
          tree.___dependencies[0],
          tree.___dependencies[1],
          tree.___dependencies[1].___dependencies[0],
          tree.___dependencies[2],
        ];
        orderBefore.should.deep.equal(expected);
      });

      it('should leave the nodes in a different order', function () {
        const expected = [
          tree.___dependencies[0],
          tree.___dependencies[1].___dependencies[0],
          tree.___dependencies[1],
          tree.___dependencies[2],
          tree,
        ];
        orderAfter.should.deep.equal(expected);
      });
    });
    describe('without callbaks', function () {
      it('should not complain', function() {
        toolBox.walkDependencies( { ___dependencies: [], });
      });
    });
  });
});
