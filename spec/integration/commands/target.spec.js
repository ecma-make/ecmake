require('chai').should();
const cp = require('child_process');

const lib = '../../../lib';
const ProjectFixture = require(`${lib}/testing/project-fixture`);

describe('--target', function x() {
  this.timeout(5000);
  let fixture;
  const worldString = 'Hello world!';
  const marsString = 'Hello mars, here we go!';
  const configuration = {
    default: [worldString, marsString],
    all: [worldString, marsString],
    'hello.world': [worldString],
    'hello.planet': [marsString],
    hello: [],
    countdown: [],
    setup: [],
  };

  function meetsExpectations(text, order) {
    if (order.length === 0) return true;
    let i = 0;
    text.match(/[^\n]+/g).forEach((line) => {
      i += line.includes(order[i]) ? 1 : 0;
    });
    return i === order.length;
  }

  before(() => {
    fixture = new ProjectFixture();
    fixture.setUp();
    fixture.initCodeFile();
  });

  after(() => {
    fixture.tearDown();
  });

  Object.entries(configuration).forEach(([target, order]) => {
    describe(target, () => {
      ['--target', ''].forEach((option) => {
        const cmd = `ecmake ${option} ${target}`;
        describe(cmd, () => {
          it('should return lines in the expected order', () => {
            const text = cp.execSync(`npx ${cmd}`).toString();
            meetsExpectations(text, order).should.be.true;
          });
        });
      });
    });
  });
});
