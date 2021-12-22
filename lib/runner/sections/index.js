const synopsisSection = require('./synopsis-section');
const optionSection = require('./option-section');
const exampleSection = require('./example-section');
const terminologySection = require('./terminology-section');

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
  content: '{italic --init, --target, --awaits, --list, --tree, --descriptions, --help, --options, --version}'
            + '\n\nExclusive. One of them can be used at a time.',
};
const targetOptionsSection = {
  header: 'Target options',
  content: '{italic --target, --awaits}'
            + '\n\nIf no target is given, the target {italic default} is tried.',
};
const taskTreeOptionsSection = {
  header: 'Task tree options',
  content: '{italic --init, --target, --awaits --list, --tree, --descriptions}'
            + '\n\nCan be combined with {italic --base} and/or {italic --code}.',
};

module.exports = {
  commandOptionsSection,
  exampleSection,
  gettingStartedSection,
  headerSection,
  optionSection,
  synopsisSection,
  targetOptionsSection,
  taskTreeOptionsSection,
  terminologySection,
};
