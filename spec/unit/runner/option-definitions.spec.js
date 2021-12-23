require('chai').should();

const lib = '../../../lib';
const definitions = require(`${lib}/runner/option-definitions.js`);

describe('option-definitions', function () {
  const expectedTotal = 11;
  const expectedBooleans = 7;
  const expectedStrings = 4;
  const booleanOptions = 'list, descriptions, tree, init, help, options, version'
    .split(/,\s*/).sort();
  const stringOptions = 'target, base, code, awaits'.split(/,\s*/).sort();

  it('should have target as only default option', function () {
    const result = definitions.filter((entry) => entry.defaultOption === true);
    result[0].name.should.equal('target');
    result.should.have.a.lengthOf(1);
  });

  it(
    'should contain short options of the first letter besides target',
    function () {
      definitions
        .filter((entry) => entry.name !== 'target')
        .every((entry) => entry.alias === entry.name.charAt(0))
        .should.be.true;
    },
  );

  it(`should export an array of length ${expectedTotal}`, function () {
    (definitions instanceof Array).should.be.true;
    definitions.length.should.equal(expectedTotal);
  });

  describe('string options', function () {
    it(`should have the type String for ${expectedStrings} options`, function () {
      definitions.filter((entry) => entry.type === String)
        .should.have.a.lengthOf(expectedStrings);
    });

    let counter = 0;
    stringOptions.forEach(function (option) {
      counter += 1;
      it(`should have the type String (${counter}) for --${option}`, function () {
        definitions
          .filter((entry) => entry.name === option)
          .every((entry) => entry.type === String)
          .should.be.true;
      });
    });
  });

  describe('boolean options', function () {
    it(`should have the type Boolean for ${expectedBooleans} options`, function () {
      definitions.filter((entry) => entry.type === Boolean)
        .should.have.a.lengthOf(expectedBooleans);
    });

    let counter = 0;
    booleanOptions.forEach(function (option) {
      counter += 1;
      it(`should have the type Boolean (${counter}) for --${option}`, function () {
        definitions
          .filter((entry) => entry.name === option)
          .every((entry) => entry.type === Boolean)
          .should.be.true;
      });
    });
  });
});
