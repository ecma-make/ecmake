const fs = require('fs');
const path = require('path');
const cp = require('child_process');
require('chai').should();
const ProjectFixture = require('../../..').testing.ProjectFixture;

//++++++++++++++++++++++++++++++++++++++++++++++++++
// expectations
//++++++++++++++++++++++++++++++++++++++++++++++++++

function getSingleTargetExpectations() {
  const hw = 'Hello world';
  const hm = 'Hello mars';
  const targetPair = (string) => [string, new RegExp(`${string}`, 'm')];
  const awaitsPair = (task) => [task, new RegExp(`${task}$`, 'm')];

  return {
    target: {
      'hello.world': {
        white: [hw].map(targetPair),
        black: [hm].map(targetPair),
      },
      'hello.planet': {
        white: [hm].map(targetPair),
        black: [hw].map(targetPair),
      },
      all: {
        white: [hm, hw].map(targetPair),
        black: ['foo'].map(targetPair),
      },
    },
    awaits: {
      countdown: {
        white: ['setup'].map(awaitsPair),
        black: ['hello.planet', 'all'].map(awaitsPair),
      },
      all: {
        white: ['hello.world', 'hello.planet', 'countdown', 'setup'].map(awaitsPair),
        black: ['hello', 'default'].map(awaitsPair),
      },
    },
  };
}

function getListingExpectations() {
  const listWhite = ['all', 'hello.planet', 'hello.world'];
  const listBlack = ['default', 'hello', 'countdown', 'setup'];
  const treeWhite = (listWhite.concat(listBlack)).map((t) => `root.${t}`);
  treeWhite.unshift('root');
  const regexPair = (task) => [task,
    new RegExp(`^\\s(\\*\\s)?${task}(\\s.*)?$`, 'm')];
  return {
    list: {
      white: listWhite.map(regexPair),
      black: listBlack.map(regexPair),
    },
    tree: {
      white: treeWhite.map(regexPair),
      black: ['foo'].map(regexPair),
    },
    descriptions: {
      white: ['default', 'hello.planet', 'setup'].map(regexPair),
      black: ['all', 'hello'].map(regexPair),
    },
  };
}

//++++++++++++++++++++++++++++++++++++++++++++++++++
// helpers
//++++++++++++++++++++++++++++++++++++++++++++++++++

function buildCommands(base, code, command = undefined, target = '') {
  const basePath = base ? path.join(...base) : '';
  const codePath = code ? path.join(...code) : '';
  const shortBase = basePath !== '' ? ` -b ${basePath}` : '';
  const shortCode = codePath !== '' ? ` -c ${codePath}` : '';
  const shortCommand = command && command !== 'target'
    ? ` -${command.substring(0, 1)}` : '';
  const longBase = basePath !== '' ? ` --base ${basePath}` : '';
  const longCode = codePath !== '' ? ` --code ${codePath}` : '';
  const longCommand = command ? ` --${command}` : '';
  const bothTarget = target ? ` ${target}` : '';
  const shortForm = `npx ecmake${shortBase}${shortCode}${shortCommand}${bothTarget}`;
  const longForm = `npx ecmake${longBase}${longCode}${longCommand}${bothTarget}`;
  return [shortForm, longForm];
}

function blackAndWhite(command, black, white) {
  let result;
  before(() => {
    result = cp.execSync(command).toString();
  });
  white.forEach(([name, pattern]) => {
    it(`should match <${name}>`, () => {
      result.should.match(pattern);
    });
  });
  black.forEach(([name, pattern]) => {
    it(`should NOT match <${name}>`, () => {
      result.should.not.match(pattern);
    });
  });
}

//++++++++++++++++++++++++++++++++++++++++++++++++++
// tests
//++++++++++++++++++++++++++++++++++++++++++++++++++

function setupSingleTargets(fixture, base, code) {
  Object.entries(getSingleTargetExpectations())
    .forEach(([option, targets]) => {
      describe(`--${option}`, () => {
        Object.entries(targets).forEach(([target, { white, black }]) => {
          buildCommands(base, code, option, target).forEach((command) => {
            describe(command, () => {
              blackAndWhite(command, black, white);
            });
          });
        });
      });
    });
}

function setupListingTasks(fixture, base, code) {
  Object.entries(getListingExpectations())
    .forEach(([option, { white, black }]) => {
      describe(`--${option}`, () => {
        buildCommands(base, code, option).forEach((command) => {
          describe(command, () => {
            blackAndWhite(command, black, white);
          });
        });
      });
    });
}

function setupUninitialized(fixture, base, code) {
  const offset = code ? path.join(...code) : 'ecmake-code.js';
  describe('inside uninitialized project', () => {
    describe('--init', () => {
      afterEach(() => {
        if (fixture.hasCodeFile(offset)) fixture.removeCodeFile(offset);
      });
      buildCommands(base, code, 'init').forEach((command) => {
        describe(command, () => {
          if (code && code.length > 2) {
            it('should should protest for a missing directory', (done) => {
              cp.exec(command, (error, stdout, stderr) => {
                // due to the inner child process thrown errors end up in stderr so far
                stderr.toString().should.include('ENOENT');
                fixture.hasCodeFile(offset).should.be.false;
                done();
              });
            });
            it('should should create into an existing directory', (done) => {
              const sub = path.join(fixture.projectBase, path.dirname(offset));
              fs.mkdirSync(sub, { recursive: true });
              cp.exec(command, (error, stdout, stderr) => {
                stderr.should.include('Created');
                fixture.hasCodeFile(offset).should.be.true;
                fixture.removeCodeFile(offset);
                done();
              });
            });
          } else {
            it('should create a code file', (done) => {
              cp.exec(command, (error, stdout, stderr) => {
                stderr.should.include('Created');
                fixture.hasCodeFile(offset).should.be.true;
                done();
              });
            });
          }
        });
      });
    });
  });
}

function setupInitialized(fixture, base, code) {
  const offset = code ? path.join(...code) : 'ecmake-code.js';
  describe('inside initialized project', () => {
    before(() => {
      fixture.initCodeFile(offset);
    });
    after(() => {
      if (fixture.hasCodeFile(offset)) fixture.removeCodeFile(offset);
    });
    setupSingleTargets(fixture, base, code);
    setupListingTasks(fixture, base, code);
  });
}

function setupBaseCodeCombinations(fixture, base, code) {
  setupUninitialized(fixture, base, code);
  setupInitialized(fixture, base, code);
}

function iterateCodeOptions(fixture, base) {
  [undefined, ['code.js'], ['one', 'two', 'code.js']].forEach((code) => {
  // [undefined, ['one', 'two', 'code.js']].forEach((code) => {
    const head = code ? `code: <${code.join('/')}>` : 'code: [none]';
    describe(head, () => {
      setupBaseCodeCombinations(fixture, base, code);
    });
  });
}

function iterateBaseOptions(fixture) {
  [undefined, ['.'], ['one'], ['one', 'two']].forEach((base) => {
  // [undefined, ['one', 'two']].forEach((base) => {
    const head = base ? `base: <${base.join('/')}>` : 'base: [none]';
    describe(head, () => {
      const offset = base ? path.join(...base) : undefined;

      before(() => {
        if (offset) {
          fixture.setUp(offset);
        } else {
          fixture.setUp(); // explicitly without arguments
        }
      });

      after(() => {
        fixture.tearDown();
      });

      iterateCodeOptions(fixture, base);
    });
  });
}

//++++++++++++++++++++++++++++++++++++++++++++++++++
// start the test
//++++++++++++++++++++++++++++++++++++++++++++++++++

describe('combinations of --base and --code with command options', function x() {
  this.timeout(5000);
  const fixture = new ProjectFixture();
  iterateBaseOptions(fixture);
});
