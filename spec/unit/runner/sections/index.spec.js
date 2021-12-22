require('chai').should();

const lib = '../../../../lib';
const index = require(`${lib}/runner/sections/index.js`);
const requiredSections = {
  /* eslint-disable global-require */
  synopsisSection: require(`${lib}/runner/sections/synopsis-section.js`),
  optionSection: require(`${lib}/runner/sections/option-section.js`),
  exampleSection: require(`${lib}/runner/sections/example-section.js`),
  terminologySection: require(`${lib}/runner/sections/terminology-section.js`),
  /* eslint-enable global-require */
};

describe('runner/sections/index', function () {
  const ownSections = `
    headerSection,
    gettingStartedSection,
    commandOptionsSection,
    targetOptionsSection,
    taskTreeOptionsSection
  `.split(/,\s*/).map((s) => s.trim()).sort();
  const importedSections = `
    exampleSection,
    optionSection,
    synopsisSection,
    terminologySection
  `.split(/,\s*/).map((s) => s.trim()).sort();
  const allSections = ownSections.concat(importedSections);
  const importTotal = 4;
  const ownTotal = 5;
  const exportTotal = 9;
  describe('import and export of sections', function () {
    it(`should be tested for ${importTotal} imported sections`, function () {
      importedSections.length.should.equal(importTotal);
    });
    it(`should be tested for ${ownTotal} own sections`, function () {
      ownSections.length.should.equal(ownTotal);
    });
    it(`should export ${exportTotal} sections`, function () {
      Object.keys(index).length.should.equal(exportTotal);
    });
    allSections.forEach(function (section) {
      it(`should export ${section}`, function () {
        index[section].should.be.ok;
      });
    });
    importedSections.forEach(function (section) {
      it(`should have imported ${section}`, function () {
        index[section].should.equal(requiredSections[section]);
      });
    });
  });
  describe('ownSections', function () {
    const expectations = {
      headerSection: {
        header: 'ecmake is ecma make',
        content: 'Code your makefile as a pure node module!',
      },
      gettingStartedSection: {
        header: 'Getting started',
        content: `
          --init,
          ecmake,
          hello.world
        `,
      },
      commandOptionsSection: {
        header: 'Command options',
        content: `
          --init,
          --target,
          --awaits,
          --list,
          --tree,
          --descriptions,
          --help,
          --options,
          --version,
          xclusive
        `,
      },
      targetOptionsSection: {
        header: 'Target options',
        content: `
          --target,
          --awaits,
          default
        `,
      },
      taskTreeOptionsSection: {
        header: 'Task tree options',
        content: `
          --init,
          --target,
          --awaits,
          --list,
          --tree,
          --descriptions,
          combined,
          --base,
          --code
        `,
      },
    };
    Object.keys(expectations).forEach(function (key) {
      const entry = expectations[key];
      describe(`${key}`, function () {
        it(`should have the header "${entry.header}"`, function () {
          index[key].header.should.equal(entry.header);
        });
        entry.content.split(/,\s*/).map((p) => p.trim()).forEach(function (part) {
          it(`should contain "${part}"`, function () {
            index[key].content.should.include(part);
          });
        });
      });
    });
  });
});
