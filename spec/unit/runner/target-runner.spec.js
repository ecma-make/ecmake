require('chai').should();
const proxyQuireStrict = require('proxyquire').noCallThru();
const { fake } = require('sinon');

const lib = '../../../lib';
const TargetRunner = require(`${lib}/runner/target-runner`);

describe('TargetRunner', function () {
  describe('.constructor(rootTask)', function () {
    const rootTask = 'root task';
    let targetRunner;
    before(function () {
      targetRunner = new TargetRunner(rootTask);
    });
    it('should create a TargetRunner', function () {
      (targetRunner instanceof TargetRunner).should.be.true;
      TargetRunner.name.should.equal('TargetRunner');
    });
    it('should set rootTask into this.rootTask', function () {
      targetRunner.rootTask.should.equal(rootTask);
    });
  });

  describe('.go(target)', function () {
    const task = { go: fake() };
    const getTarget = fake.returns(task);
    const rootTask = 'root task';
    const target = 'target';
    const TargetRunnerProxy = proxyQuireStrict(`${lib}/runner/target-runner`, {
      '../model/tool-box': { getTarget },
    });
    const targetRunner = new TargetRunnerProxy('dummy');
    targetRunner.rootTask = rootTask;
    before(function () {
      targetRunner.go(target);
    });
    it('should call tool-box.getTarget() once', function () {
      getTarget.calledOnce.should.be.true;
    });
    it('- with rootTask and target', function () {
      getTarget.calledWith(rootTask, target).should.be.true;
    });
    it('- and delegate to task.go()', function () {
      task.go.calledOnce.should.be.true;
    });
  });
});
