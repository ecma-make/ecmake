require('chai').should();

const lib = '../../../../lib';
const optionSection = require(`${lib}/runner/sections/option-section.js`);
// these are tested and can be used to define the expectatins
const optionDefinitions = require(`${lib}/runner/option-definitions.js`);

describe('option-section', function () {
  it('should export two keys', function () {
    Object.keys(optionSection).length.should.equal(2);
  });
  it('should export header', function () {
    optionSection.header.should.be.ok;
  });
  it('should export optionList', function () {
    optionSection.optionList.should.be.ok;
  });
  describe('header', function () {
    it('should contain "Options"', function () {
      optionSection.header.should.include('Options');
    });
  });
  describe('optionList', function () {
    const { optionList } = optionSection;

    it('should describe each option', function () {
      optionList
        .every((entry) => entry.description.length > 0)
        .should.be.true;
    });

    it('should match the length of option-definitions', function () {
      optionList.should.have.lengthOf(optionDefinitions.length);
    });

    it(
      'should match the option-definitions for name, alias, type, defaultOption',
      function () {
        const checks = ['name', 'alias', 'type', 'defaultOption'];
        const sortedList = optionList.slice();
        const sortedDefinitions = optionDefinitions.slice();
        sortedList.sort((a, b) => a.name.localeCompare(b.name));
        sortedDefinitions.sort((a, b) => a.name.localeCompare(b.name));
        for (let i = 0; i < sortedDefinitions.length; i += 1) {
          checks.forEach((check) => {
            const listValue = sortedList[i][check];
            const definitionsValue = sortedDefinitions[i][check];
            if ((typeof listValue) === 'undefined' || listValue === '') {
              (typeof definitionsValue).should.equal('undefined');
            } else {
              listValue.should.equal(definitionsValue);
            }
          });
        }
      },
    );
  });
});
