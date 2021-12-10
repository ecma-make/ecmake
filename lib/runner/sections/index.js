const synopsisSection = require('./synopsisSection');
const optionSection = require('./optionSection');
const exampleSection = require('./exampleSection');
const terminologySection = require('./terminologySection');

const headerSection = {
  header: 'ecmake is ecma make',
  content: 'Code your makefile as a pure node module!',
};
const gettingStartedSection = {
  header: 'Getting started',
  content: '{bold $} ecmake --init'
            + '\n{bold $} ecmake {italic hello.world}',
};
const commandOptionsSection = {
  header: 'Command options',
  content: '{italic --init, --target, --depends, --list, --tree, --help, --options, --version}'
            + '\n\nExclusive. One of them can be used at a time.',
};
const targetOptionsSection = {
  header: 'Target options',
  content: '{italic --target, --depends}'
            + '\n\nIf no target is given, the target {italic default} is tried.',
};
const makefileOptionsSection = {
  header: 'Makefile options',
  content: '{italic --init, --target, --depends --list, --tree}'
            + '\n\nCan be combined with {italic --directory} and/or {italic --file}.',
};

module.exports = {
  synopsisSection,
  optionSection,
  exampleSection,
  terminologySection,
  headerSection,
  gettingStartedSection,
  commandOptionsSection,
  targetOptionsSection,
  makefileOptionsSection,
};
