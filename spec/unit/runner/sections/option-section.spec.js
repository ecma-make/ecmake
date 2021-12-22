require('chai').should();

const lib = '../../../../lib';
const optionSection = require(`${lib}/runner/sections/option-section.js`);

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
    const allOptions = ('target list descriptions tree awaits base code'
    + ' init help options version').split(/\s/).sort();
    it('should contain eleven options', function () {
      allOptions.length.should.equal(11);
    });
    it('should have the type Boolean for eight options', function () {
      const options = 'list descriptions tree init help options version'
        .split(/\s/);
      options.length.should.equal(7);
      optionSection.optionList
        .filter((entry) => options.some((option) => entry.name === option))
        .every((entry) => entry.type === Boolean)
        .should.be.true;
    });
    it('should have the type String for four options', function () {
      const options = 'target base code awaits'.split(/\s/);
      optionSection.optionList
        .filter((entry) => options.some((option) => entry.name === option))
        .every((entry) => entry.type === String)
        .should.be.true;
    });
    it('should contain all options and no others', function () {
      const names = optionSection.optionList.map((entry) => entry.name);
      names.sort().should.deep.equal(allOptions);
    });
    it(
      'should contain short options of the first letter target exclusive',
      function () {
        optionSection.optionList
          .filter((entry) => entry.name !== 'target')
          .every((entry) => entry.alias === entry.name.charAt(0))
          .should.be.true;
      },
    );
    it('should describe each option', function () {
      optionSection.optionList
        .every((entry) => entry.description.length > 0)
        .should.be.true;
    });
  });
});
