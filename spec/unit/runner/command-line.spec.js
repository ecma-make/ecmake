require('chai').should();
const proxyquire = require('proxyquire');
const { stdout } = require('test-console');

const lib = '../../../lib';
const commandLine = require(`${lib}/runner/command-line`);

describe('command-line', function () {
  it('should export three keys', function () {
    Object.keys(commandLine).length.should.equal(3);
  });
  'makeOptions, makeHelp, makeOptionsHelp'.split(/,\s*/).forEach(
    function (token) {
      it(`should export ${token}`, function () {
        commandLine[token].should.be.ok;
      });
    },
  );
  describe('makeOptions', function () {
    const optionDefinitions = {};
    const output = 'output of command-line-args';
    let argument;
    let returned;
    before(function () {
      const commandLineProxy = proxyquire(`${lib}/runner/command-line`, {
        './option-definitions': optionDefinitions,
        'command-line-args': (arg) => {
          argument = arg;
          return output;
        },
      });
      returned = commandLineProxy.makeOptions();
    });
    it('should call commandLineArgs with optionDefinitions', function () {
      argument.should.equal(optionDefinitions);
    });
    it('should return the output of commandLineArgs', function () {
      returned.should.equal(output);
    });
  });

  describe('makeOptionsHelp', function () {
    const sections = { optionSection: 'option section' };
    const output = 'output of command-line-usage';
    let argument;
    let inspect;
    before(function () {
      const commandLineProxy = proxyquire(`${lib}/runner/command-line`, {
        './sections': sections,
        'command-line-usage': (arg) => {
          argument = arg;
          return output;
        },
      });
      inspect = stdout.inspect();
      commandLineProxy.makeOptionsHelp();
      inspect.restore();
    });
    it('should call commandLineUsage with the optionSection only', function () {
      argument[0].should.equal(sections.optionSection);
      argument.should.have.lengthOf(1);
    });
    it('should print the output of commandLineUsage', function () {
      inspect.output[0].should.equal(output);
    });
  });

  describe('makeHelp', function () {
    const sections = {
      headerSection: {},
      gettingStartedSection: {},
      synopsisSection: {},
      commandOptionsSection: {},
      targetOptionsSection: {},
      taskTreeOptionsSection: {},
      optionSection: {},
      exampleSection: {},
      terminologySection: {},
    };
    const output = 'output of command-line-usage';
    let argument;
    let inspect;
    before(function () {
      const commandLineProxy = proxyquire(`${lib}/runner/command-line`, {
        './sections': sections,
        'command-line-usage': (arg) => {
          argument = arg;
          return output;
        },
      });
      inspect = stdout.inspect();
      commandLineProxy.makeHelp();
      inspect.restore();
    });
    it('should call commandLineUsage with nine sections', function () {
      argument.should.have.lengthOf(9);
      argument.forEach((entry) => {
        Object.values(sections).includes(entry).should.be.true;
      });
    });
    it(
      'should call commandLineUsage with the expected order of sections',
      function () {
        const order = Object.keys(sections).map((key) => sections[key]);
        for (let i = 0; i < order.length; i += 1) {
          order[i].should.equal(argument[i]);
        }
      },
    );
    it('should print the output of commandLineUsage', function () {
      inspect.output[0].should.equal(output);
    });
  });
});
