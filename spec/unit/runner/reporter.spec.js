require('chai').should();

const { EOL } = require('os');
const {
  fake, stub, replace, replaceGetter, restore,
} = require('sinon');

const lib = '../../../lib';
const Reporter = require(`${lib}/runner/reporter`);
const toolBox = require(`${lib}/model/tool-box`);

describe('Reporter', function () {
  describe('.constructor', () => {
    const root = 'the root task';
    const reporter = new Reporter(root);

    it('should create a Reporter', () => {
      (reporter instanceof Reporter).should.be.true;
      Reporter.name.should.equal('Reporter');
    });

    it('should set this.root', () => {
      reporter.root.should.equal(root);
    });
  });

  describe('.report()', () => {
    const fixture = {
      setUp() {
        this.stdoutWrite = fake();
        this.stdout = function () { return { write: this.stdoutWrite }; };
        this.title = 'the title';
        this.entries = ['one', 'two'];
        replaceGetter(process, 'stdout', this.stdout.bind(this));
        Reporter.report(this.title, this.entries);
      },
      tearDown() {
        restore();
      },
    };
    beforeEach(() => {
      fixture.setUp();
    });
    afterEach(() => {
      fixture.tearDown();
    });
    it('should should call stdout.write six times', () => {
      fixture.stdoutWrite.callCount.should.equal(6);
    });
    it('should give the title on call 1', () => {
      fixture.stdoutWrite.args[1][0].should.have.string(
        fixture.title,
      );
    });
    it('should join entries with EOL on call 4', () => {
      fixture.stdoutWrite.args[4][0].should.equal(
        fixture.entries.join(EOL),
      );
    });
    it('should give EOL on call 0, 2, 3, 5', () => {
      [0, 2, 3, 5].forEach((i) => fixture.stdoutWrite.args[i][0].should.equal(EOL));
    });
  });

  describe('.makeEntries()', () => {
    const fixture = {
      setUp() {
        this.nodeName = 'node name';
        this.node = { getName: fake.returns(this.nodeName) };
        this.getSubNodes = fake();
        this.entry = 'an entry';
        this.makeEntry = stub()
          .onFirstCall().returns(this.entry)
          .onSecondCall()
          .returns(undefined);
        this.walk = fake();
        replace(toolBox, 'walk', this.walk.bind(this));
        return Reporter.makeEntries(this.node, this.getSubNodes, this.makeEntry);
      },
      tearDown() {
        restore();
      },
    };
    let entries;
    beforeEach(() => { entries = fixture.setUp(); });
    afterEach(() => { fixture.tearDown(); });
    it('should return an array', () => {
      (entries instanceof Array).should.be.true;
    });
    describe('when toolBox.walk() is being called', () => {
      let getSubNodes; let nodeStack; let doBefore; let doAfter;
      beforeEach(() => {
        // eslint-disable-next-line
        [getSubNodes, nodeStack, doBefore, doAfter] = fixture.walk.args[0];
      });
      it('should be called once', () => {
        fixture.walk.calledOnce.should.be.true;
      });
      it(' - with getSubNodes as first argument named getSubNodes', () => {
        getSubNodes.should.equal(fixture.getSubNodes);
      });
      it(' - with [node] as second argument named nodeStack', () => {
        nodeStack.should.have.members([fixture.node]);
      });
      it(' - with a function as third argument named doBefore', () => {
        (typeof doBefore).should.equal('function');
      });
      it(' - with a function as fourth argument named doAfter', () => {
        (typeof doAfter).should.equal('function');
      });
      describe('when doBefore() is being called', () => {
        let myResultStack;
        let myNodeStack;
        beforeEach(() => {
          myNodeStack = [1, fixture.node];
          myResultStack = [1];
          doBefore(myNodeStack, myResultStack);
        });
        it('should push the result stack with .getName() of the head node', () => {
          myResultStack.should.have.members([1, fixture.nodeName]);
        });
        it('should call the makeEntry argument of .makeEntries() once', () => {
          fixture.makeEntry.calledOnce.should.be.true;
        });
        it(' - with the head node of the stack as first argument', () => {
          fixture.makeEntry.args[0][0].should.equal(fixture.node);
        });
        it(' - with the the result stack as second argument', () => {
          fixture.makeEntry.args[0][1].should.equal(myResultStack);
        });
        it('should push the return value of makeEntry to entries', () => {
          entries.slice(-1)[0].should.equal(fixture.entry);
        });
        describe(
          'when the return value is falsy (upon the second call)',
          () => {
            it('should not push to entries', () => {
              entries.length.should.equal(1);
              doBefore(myNodeStack, myResultStack);
              entries.length.should.equal(1);
            });
          },
        );
      });
      describe('when doAfter() is being called', () => {
        it('should pop the result stack', () => {
          const myResultStack = [1, 2];
          doAfter(undefined, myResultStack);
          myResultStack.should.have.members([1]);
        });
      });
    });
  });

  describe('.list()', () => {
    const fixture = {
      setUp() {
        this.entries = [];
        this.getSubNodes = fake();
        replace(toolBox, 'getSubNodesInTreeWalk', this.getSubNodes);
        this.ReporterMock = function () {
          this.constructor.makeEntries = fake.returns(fixture.entries);
          this.constructor.report = fake();
          this.constructor.prototype.list = Reporter.prototype.list;
        };
        this.reporter = new this.ReporterMock();
        this.reporter.root = {};
        this.reporter.list();
      },
      tearDown() {
        restore();
      },
    };
    beforeEach(() => {
      fixture.setUp();
    });
    afterEach(() => {
      fixture.tearDown();
    });
    describe('when Reporter.makeEntries() is being called', () => {
      let node; let getSubNodes; let
        makeEntry;
      beforeEach(() => {
        // eslint-disable-next-line
        [node, getSubNodes, makeEntry] = fixture.ReporterMock.makeEntries.args[0];
      });
      it('should be called once', () => {
        fixture.ReporterMock.makeEntries.calledOnce.should.be.true;
      });
      it(' - with this.root as first argument named node', () => {
        node.should.equal(fixture.reporter.root);
      });
      it(
        ' - with toolBox.getSubNodesInTreeWalk as second argument named getSubNodes',
        () => {
          getSubNodes.should.equal(toolBox.getSubNodesInTreeWalk);
        },
      );
      it(' - with a function as third argument named makeEntry', () => {
        (typeof makeEntry).should.equal('function');
      });
      describe('when makeEntry() is being called', () => {
        describe('when node.___listed is false', () => {
          it('should return undefined', () => {
            const result = makeEntry({ ___listed: false }, []);
            (result === undefined).should.be.true;
          });
        });
        describe('when node.___listed is true', () => {
          let result;
          const myNode = { ___listed: true };
          const myResultStack = ['root', 'one', 'two'];
          beforeEach(() => {
            result = makeEntry(myNode, myResultStack);
          });
          it('should return a string including the node path', () => {
            result.should.have.string('-');
            result.should.have.string('one.two');
          });
          it(' -- without the heading root element', () => {
            result.should.not.have.string('root');
          });
          describe('when node.___description is not given', () => {
            it('should return one line only', () => {
              result.should.not.have.string(EOL);
            });
          });
          describe(
            'when node.___description is given (not containing EOL itself)',
            () => {
              let lines;
              beforeEach(() => {
                myNode.___description = 'description';
                lines = makeEntry(myNode, myResultStack).split(EOL);
              });
              it('should return the node path in the first line', () => {
                lines[0].should.have.string('one.two');
              });
              it('should return description in the second line', () => {
                lines[1].should.have.string(myNode.___description);
              });
              it('should not have a third line', () => {
                lines.should.have.lengthOf(2);
              });
            },
          );
        });
      });
    });
    describe('when Reporter.report() is being called', () => {
      it('should be called once', () => {
        fixture.ReporterMock.report.calledOnce.should.be.true;
      });
      it(' - with "Targets" as first argument named title', () => {
        fixture.ReporterMock.report.args[0][0].should.equal('Targets');
      });
      it(' - with entries as second argument named entries', () => {
        fixture.ReporterMock.report.args[0][1].should.equal(fixture.entries);
      });
    });
  });

  describe('.listDescriptions()', () => {
    const fixture = {
      setUp() {
        this.entries = [];
        this.getSubNodes = fake();
        replace(toolBox, 'getSubNodesInTreeWalk', this.getSubNodes);
        this.ReporterMock = function () {
          this.constructor.makeEntries = fake.returns(fixture.entries);
          this.constructor.report = fake();
          this.constructor.prototype.listDescriptions = Reporter.prototype.listDescriptions;
        };
        this.reporter = new this.ReporterMock();
        this.reporter.root = {};
        this.reporter.listDescriptions();
      },
      tearDown() {
        restore();
      },
    };
    beforeEach(() => {
      fixture.setUp();
    });
    afterEach(() => {
      fixture.tearDown();
    });
    describe('when Reporter.makeEntries() is being called', () => {
      let node; let getSubNodes; let
        makeEntry;
      beforeEach(() => {
        // eslint-disable-next-line
        [node, getSubNodes, makeEntry] = fixture.ReporterMock.makeEntries.args[0];
      });
      it('should be called once', () => {
        fixture.ReporterMock.makeEntries.calledOnce.should.be.true;
      });
      it(' - with this.root as first argument named node', () => {
        node.should.equal(fixture.reporter.root);
      });
      it(
        ' - with toolBox.getSubNodesInTreeWalk as second argument named getSubNodes',
        () => {
          getSubNodes.should.equal(toolBox.getSubNodesInTreeWalk);
        },
      );
      it(' - with a function as third argument named makeEntry', () => {
        (typeof makeEntry).should.equal('function');
      });
      describe('when makeEntry() is being called', () => {
        describe('when node.___description is not given', () => {
          it('should return undefined', () => {
            const result = makeEntry({ ___description: false }, []);
            (result === undefined).should.be.true;
          });
        });
        describe('when node.___description is given', () => {
          let result;
          let lines;
          const myNode = { ___description: 'the description' };
          const myResultStack = ['root', 'one', 'two'];
          beforeEach(() => {
            result = makeEntry(myNode, myResultStack);
            lines = result.split(EOL);
          });
          it('should return a string including the node path in the first line', () => {
            lines[0].should.have.string('-');
            lines[0].should.have.string('one.two');
          });
          it(' -- without the heading root element', () => {
            lines[0].should.not.have.string('root');
          });
          it('should contain the description', () => {
            result.should.have.string(myNode.___description);
          });
          it('should be terminated with EOL', () => {
            result.endsWith(EOL).should.be.true;
          });
          describe('when node.___listed is true', () => {
            it('should append "(listed)" to the first line', () => {
              myNode.___listed = true;
              result = makeEntry(myNode, myResultStack);
              lines = result.split(EOL);
              lines[0].endsWith('(listed)').should.be.true;
            });
          });
          describe('when node.___listed is false', () => {
            it('should not append "(listed)" to the first line', () => {
              myNode.___listed = false;
              result = makeEntry(myNode, myResultStack);
              lines = result.split(EOL);
              lines[0].endsWith('(listed)').should.be.false;
            });
          });
        });
      });
    });
    describe('when Reporter.report() is being called', () => {
      it('should be called once', () => {
        fixture.ReporterMock.report.calledOnce.should.be.true;
      });
      it(' - with "Descriptions" as first argument named title', () => {
        fixture.ReporterMock.report.args[0][0].should.equal('Descriptions');
      });
      it(' - with entries as second argument named entries', () => {
        fixture.ReporterMock.report.args[0][1].should.equal(fixture.entries);
      });
    });
  });

  describe('.drawTree()', () => {
    const fixture = {
      setUp() {
        this.entries = [];
        this.getSubNodes = fake();
        replace(toolBox, 'getSubNodesInTreeWalk', this.getSubNodes);
        this.ReporterMock = function () {
          this.constructor.makeEntries = fake.returns(fixture.entries);
          this.constructor.report = fake();
          this.constructor.prototype.drawTree = Reporter.prototype.drawTree;
        };
        this.reporter = new this.ReporterMock();
        this.reporter.root = {};
        this.reporter.drawTree();
      },
      tearDown() {
        restore();
      },
    };
    beforeEach(() => {
      fixture.setUp();
    });
    afterEach(() => {
      fixture.tearDown();
    });
    describe('when Reporter.makeEntries() is being called', () => {
      let node; let getSubNodes; let
        makeEntry;
      beforeEach(() => {
        // eslint-disable-next-line
        [node, getSubNodes, makeEntry] = fixture.ReporterMock.makeEntries.args[0];
      });
      it('should be called once', () => {
        fixture.ReporterMock.makeEntries.calledOnce.should.be.true;
      });
      it(' - with this.root as first argument named node', () => {
        node.should.equal(fixture.reporter.root);
      });
      it(
        ' - with toolBox.getSubNodesInTreeWalk as second argument named getSubNodes',
        () => {
          getSubNodes.should.equal(toolBox.getSubNodesInTreeWalk);
        },
      );
      it(' - with a function as third argument named makeEntry', () => {
        (typeof makeEntry).should.equal('function');
      });
      describe('when makeEntry() is being called', () => {
        it('should return a string including node path with root', () => {
          const myNode = {};
          const myResultStack = ['root', 'one', 'two'];
          const result = makeEntry(myNode, myResultStack);
          result.should.have.string('root.one.two');
        });
      });
    });
    describe('when Reporter.report() is being called', () => {
      it('should be called once', () => {
        fixture.ReporterMock.report.calledOnce.should.be.true;
      });
      it(' - with "The target tree" as first argument named title', () => {
        fixture.ReporterMock.report.args[0][0].should.equal('The target tree');
      });
      it(' - with entries as second argument named entries', () => {
        fixture.ReporterMock.report.args[0][1].should.equal(fixture.entries);
      });
    });
  });
  describe('.showDependencies()', () => {
    const fixture = {
      setUp() {
        this.entries = [];
        this.target = 'the target';
        this.task = 'the task';
        this.getSubNodes = fake();
        replace(toolBox, 'getSubNodesInAwaitsWalk', this.getSubNodes);
        this.getTarget = fake.returns(this.task);
        replace(toolBox, 'getTarget', this.getTarget);
        this.ReporterMock = function () {
          this.constructor.makeEntries = fake.returns(fixture.entries);
          this.constructor.report = fake();
          this.constructor.prototype.showDependencies = Reporter.prototype.showDependencies;
        };
        this.reporter = new this.ReporterMock();
        this.reporter.root = {};
        this.reporter.showDependencies(this.target);
      },
      tearDown() {
        restore();
      },
    };
    beforeEach(() => {
      fixture.setUp();
    });
    afterEach(() => {
      fixture.tearDown();
    });
    describe('when Reporter.makeEntries() is being called', () => {
      let node; let getSubNodes; let
        makeEntry;
      beforeEach(() => {
        // eslint-disable-next-line
        [node, getSubNodes, makeEntry] = fixture.ReporterMock.makeEntries.args[0];
      });
      it('should be called once', () => {
        fixture.ReporterMock.makeEntries.calledOnce.should.be.true;
      });
      it(' - with the target task as first argument named node', () => {
        node.should.equal(fixture.task);
      });
      it(
        ' - with toolBox.getSubNodesInAwaitsWalk as second argument named getSubNodes',
        () => {
          getSubNodes.should.equal(toolBox.getSubNodesInAwaitsWalk);
        },
      );
      it(' - with a function as third argument named makeEntry', () => {
        (typeof makeEntry).should.equal('function');
      });
      describe('when makeEntry() is being called', () => {
        const myResultStack = ['root', 'one', 'two'];
        const nodePath = 'the node path';
        const myNode = { getPath: () => nodePath };
        const indentationExpectation = ' '.repeat(2 * myResultStack.length);
        let result;
        beforeEach(() => {
          result = makeEntry(myNode, myResultStack);
        });
        it('should return a string including the node path', () => {
          result.should.have.string(nodePath);
        });
        it('should be indented by spaces two times the stack length ', () => {
          result.startsWith(indentationExpectation).should.be.true;
        });
        it(' - followed by " - "', () => {
          const andMore = `${indentationExpectation}- `;
          result.startsWith(andMore).should.be.true;
        });
      });
    });
    describe('when Reporter.report() is being called', () => {
      it('should be called once', () => {
        fixture.ReporterMock.report.calledOnce.should.be.true;
      });
      it(' - with "Dependencies of <$target>" as first argument named title', () => {
        fixture.ReporterMock.report.args[0][0].should.equal(
          `Dependencies of <${fixture.target}>`,
        );
      });
      it(' - with entries as second argument named entries', () => {
        fixture.ReporterMock.report.args[0][1].should.equal(fixture.entries);
      });
    });
  });
});
