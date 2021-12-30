require('chai').should();
const { fake, stub } = require('sinon');
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

  it('should export six keys', function () {
    Object.keys(toolBox).length.should.equal(6);
  });

  it('should export TargetNotFoundError', function () {
    (toolBox.TargetNotFoundError.prototype instanceof Error)
      .should.be.true;
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

  describe('.lastOf()', function () {
    it('should return the last element of an array', () => {
      lastOf([1, 2]).should.equal(2);
    });
  });

  describe('.walk()', function () {
    const Fixture = function () {
      this.nodeStack = [];
      this.getSubNodes = fake.returns([]);
      this.doBefore = fake();
      this.doAfter = fake();
      this.resultStack = [];
      this.go = function () {
        toolBox.walk(
          this.getSubNodes,
          this.nodeStack,
          this.doBefore,
          this.doAfter,
          this.resultStack,
        );
      };
    };

    const fixAndGo = function () {
      const fixture = new Fixture();
      fixture.go();
      return fixture;
    };

    it('should default resultStack to []', () => {
      const fixture = new Fixture();
      fixture.resultStack = undefined;
      fixture.doBefore = fake();
      fixture.go();
      fixture.doBefore.firstCall.args[1].should.deep.equal([]);
    });
    it('should call doBefore once', () => {
      fixAndGo().doBefore.calledOnce.should.be.true;
    });
    it(' - with nodeStack as first argument', () => {
      const fixture = fixAndGo();
      fixture.doBefore.getCall(0).args[0].should.equal(fixture.nodeStack);
    });
    it(' - with resultStack as second argument', () => {
      const fixture = fixAndGo();
      fixture.doBefore.getCall(0).args[1].should.equal(fixture.resultStack);
    });
    describe('when doBefore is undefined', () => {
      it('should not complain', () => {
        const fixture = new Fixture();
        fixture.doBefore = undefined;
        fixture.go();
      });
    });
    it('should call doAfter once', () => {
      fixAndGo().doAfter.calledOnce.should.be.true;
    });
    it(' - with nodeStack as first argument', () => {
      const fixture = fixAndGo();
      fixture.doAfter.getCall(0).args[0].should.equal(fixture.nodeStack);
    });
    it(' - with resultStack as second argument', () => {
      const fixture = fixAndGo();
      fixture.doAfter.getCall(0).args[1].should.equal(fixture.resultStack);
    });
    describe('when doAfter is undefined', function () {
      it('should not complain ', () => {
        const fixture = new Fixture();
        fixture.doAfter = undefined;
        fixture.go();
      });
    });
    it('should call getSubNodes once', () => {
      fixAndGo().getSubNodes.calledOnce.should.be.true;
    });
    it(' - with nodeStack as first argument', () => {
      const fixture = fixAndGo();
      fixture.getSubNodes.getCall(0).args[0].should.equal(fixture.nodeStack);
    });
    it(' - with resultStack as second argument', () => {
      const fixture = fixAndGo();
      fixture.getSubNodes.getCall(0).args[1].should.equal(fixture.resultStack);
    });
    describe('when iterating children of getSubNodes', function () {
      const RecursiveFixture = function () {
        // defaults to root and one child, so the initial stack is [root]
        this.root = 'root';
        this.child = 'child';
        this.nodeStack = [this.root];
        this.getSubNodes = (stk) => (stk.length === 1 ? [this.child] : []);
        this.doBefore = fake();
        this.doAfter = fake();
        this.resultStack = [];
        this.go = function () {
          toolBox.walk(
            this.getSubNodes,
            this.nodeStack,
            this.doBefore,
            this.doAfter,
            this.resultStack,
          );
        };
      };
      RecursiveFixture.setUp = function () {
        if (this.walkStub) this.walkStub.restore();
        this.recursivenessProven = false;
        this.stackHead = undefined;
        this.walkStub = stub(toolBox, 'walk')
          .onCall(1).callsFake((_, nodeStack) => {
            this.recursivenessProven = true;
            this.stackHead = lastOf(nodeStack);
          });
        this.walkStub.callThrough();
        return new RecursiveFixture();
      };
      RecursiveFixture.tearDown = function () {
        this.walkStub.restore();
      };

      let fixture;
      beforeEach(() => {
        fixture = RecursiveFixture.setUp();
      });

      afterEach(() => {
        RecursiveFixture.tearDown();
      });

      it('should push the child to nodeStack before call to walk', () => {
        fixture.go();
        RecursiveFixture.stackHead.should.equal(fixture.child);
      });
      it('should pop the child from nodeStack after call to walk', () => {
        fixture.go();
        fixture.nodeStack.should.have.members([fixture.root]);
      });
      it('should call walk recursively', () => {
        fixture.go();
        RecursiveFixture.recursivenessProven.should.be.true;
      });
      it(' - once for each child', () => {
        for (let i = 0; i < 3; i += 1) {
          const expectation = 1 + i;
          const children = Array.from(Array(i).keys());
          const myFixture = RecursiveFixture.setUp();
          myFixture.getSubNodes = (stk) => (stk.length === 1 ? children : []);
          myFixture.go();
          RecursiveFixture.walkStub.callCount.should.equal(expectation);
          RecursiveFixture.tearDown();
        }
      });
      it(' - with getSubNodes as first argument', () => {
        fixture.go();
        RecursiveFixture.walkStub.secondCall.args[0]
          .should.equal(fixture.getSubNodes);
      });
      it(' - with nodeStack as second argument', () => {
        fixture.go();
        RecursiveFixture.walkStub.secondCall.args[1]
          .should.equal(fixture.nodeStack);
      });
      it(' - with doBefore as third argument', () => {
        fixture.go();
        RecursiveFixture.walkStub.secondCall.args[2]
          .should.equal(fixture.doBefore);
      });
      it(' - with doAfter as fourth argument', () => {
        fixture.go();
        RecursiveFixture.walkStub.secondCall.args[3]
          .should.equal(fixture.doAfter);
      });
      it(' - with resultStack as fifth argument', () => {
        fixture.go();
        RecursiveFixture.walkStub.secondCall.args[4]
          .should.equal(fixture.resultStack);
      });
    });
  });

  describe('.getSubNodesInAwaitsWalk()', function () {
    it(
      'should return the elements of ___dependencies of the head node of stack',
      () => {
        const ___dependencies = [];
        toolBox.getSubNodesInAwaitsWalk([1, 2, 3, { ___dependencies }])
          .should.equal(___dependencies);
      },
    );
  });

  describe('.getSubNodesInTreeWalk()', function () {
    it('should return poperties of head node of stack', () => {
      const task = new Task();
      task.one = new Task();
      task.two = new Task();
      toolBox.getSubNodesInTreeWalk([1, 2, 3, task])
        .should.have.members([task.one, task.two]);
    });
    it(' - filtering Tasks', () => {
      const task = new Task();
      task.task = new Task();
      task.noTask = 'no task';
      toolBox.getSubNodesInTreeWalk([task]).should.include(task.task);
      toolBox.getSubNodesInTreeWalk([task]).should.not.include(task.noTask);
    });
    it(' - but excluding the ___parent Task', () => {
      const task = new Task();
      task.___parent = new Task();
      toolBox.getSubNodesInTreeWalk([task]).should.not.include(task.___parent);
    });
  });
});
