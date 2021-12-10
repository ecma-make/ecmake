const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const sections = require('./sections');

const optionDefinitions = [
  { name: 'awaits', alias: 'a', type: String },
  { name: 'directory', alias: 'd', type: String },
  { name: 'file', alias: 'f', type: String },
  { name: 'help', alias: 'h', type: Boolean },
  { name: 'init', alias: 'i', type: Boolean },
  { name: 'list', alias: 'l', type: Boolean },
  { name: 'options', alias: 'o', type: Boolean },
  { name: 'target', defaultOption: true, type: String },
  { name: 'tree', alias: 't', type: Boolean },
  { name: 'version', alias: 'v', type: Boolean },
];

function makeOptions() {
  return commandLineArgs(optionDefinitions);
}

function makeOptionsHelp() {
  const usage = commandLineUsage([
    sections.optionSection,
  ]);
  process.stdout.write(usage);
}

function makeHelp() {
  const usage = commandLineUsage([
    sections.headerSection,
    sections.gettingStartedSection,
    sections.synopsisSection,
    sections.commandOptionsSection,
    sections.targetOptionsSection,
    sections.makefileOptionsSection,
    sections.optionSection,
    sections.exampleSection,
    sections.terminologySection,
  ]);
  process.stdout.write(usage);
}

module.exports = { makeOptions, makeHelp, makeOptionsHelp };
