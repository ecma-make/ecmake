require('chai').should();
const cp = require('child_process');
const ProjectFixture = require('../../../lib/testing/projectFixture');

class TreeParser {
  constructor(text) {
    this.lines = text.match(/[^\n]+/g).filter((line) => line.includes('-'));
    this.tree = {};
  }

  parse() {
    const stack = [this.tree];
    this.lines.forEach((line) => {
      const level = TreeParser.levelOf(line);
      const diff = stack.length - level;
      const name = TreeParser.nodeOf(line);
      const node = {};
      for (let i = 0; i < diff; i += 1) stack.pop();
      stack[stack.length - 1][name] = node;
      stack.push(node);
    });
    return this.tree;
  }

  static nodeOf(line) {
    const match = line.match(/-\s*(\S+)/);
    if (match) {
      return match[1];
    }
    return null;
  }

  static levelOf(line) {
    const match = line.match(/^([ ]+)-/);
    if (match) {
      return (match[1].length + 1) / 2;
    }
    return null;
  }
}

describe('--awaits', function x() {
  this.timeout(5000);
  let fixture;

  before(() => {
    fixture = new ProjectFixture();
    fixture.setUp();
    fixture.initCodeFile();
  });

  after(() => {
    fixture.tearDown();
  });

  ['--awaits', '-a'].forEach((arg) => {
    describe(`ecmake ${arg} hello.planet`, () => {
      const target = 'hello.planet';
      let text;
      let tree;

      before(() => {
        text = cp.execSync(`npx ecmake ${arg} ${target}`).toString();
        tree = new TreeParser(text).parse();
      });

      it('should name the target in the headline', () => {
        const headline = `Dependencies of <${target}>`;
        text.should.include(headline);
      });

      it('should have a dependency on setup', () => {
        tree['hello.planet'].countdown.setup.should.be.ok;
      });
    });

    describe(`ecmake ${arg} default`, () => {
      const target = 'default';
      let text;
      let tree;

      before(() => {
        text = cp.execSync(`npx ecmake ${arg} ${target}`).toString();
        tree = new TreeParser(text).parse();
      });

      it('should name the target in the headline', () => {
        const headline = `Dependencies of <${target}>`;
        text.should.include(headline);
      });

      it('should have a dependency on setup', () => {
        tree.default.all['hello.planet'].countdown.setup.should.be.ok;
      });

      it('should have a dependency on hello.world', () => {
        tree.default.all['hello.world'].should.be.ok;
      });
    });

    describe(`ecmake ${arg}`, () => {
      let text;

      before(() => {
        text = cp.execSync(`npx ecmake ${arg}`).toString();
      });

      it('should get the same output as target <default>', () => {
        const defaultText = cp.execSync(`npx ecmake ${arg} default`).toString();
        text.should.equal(defaultText);
      });
    });
  });
});
