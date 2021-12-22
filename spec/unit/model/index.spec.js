require('chai').should();

const lib = '../../../lib';
const { Task, toolBox } = require(lib);
const modelIndex = require(`${lib}/model`);

describe('lib/model/index', function () {
  it('should export two keys', function () {
    Object.keys(modelIndex).length.should.equal(2);
  });
  it('should export Task', function () {
    modelIndex.Task.should.equal(Task);
  });
  it('should export toolBox', function () {
    modelIndex.toolBox.should.equal(toolBox);
  });
});
