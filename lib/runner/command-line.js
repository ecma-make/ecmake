const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const optionDefinitions = require('./option-definitions');
const sections = require('./sections');

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
    sections.taskTreeOptionsSection,
    sections.optionSection,
    sections.exampleSection,
    sections.terminologySection,
  ]);
  process.stdout.write(usage);
}

module.exports = { makeOptions, makeHelp, makeOptionsHelp };
