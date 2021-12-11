module.exports = {
  header: 'Options',
  optionList: [
    {
      name: 'target',
      alias: '',
      type: String,
      typeLabel: '{italic {underline target}}',
      defaultOption: true,
      description: 'The {italic {underline target}} to do.'
      + ' This is the {bold default option}.'
      + ' (Trim {red {italic root.tests.unit}} to {green {italic tests.unit}}'
      + ' by omitting the root element of the target path.)'
      + ' .\n',
    },
    {
      name: 'list',
      alias: 'l',
      type: Boolean,
      description: 'List all targets with a title.\n',
    },
    {
      name: 'tree',
      alias: 't',
      type: Boolean,
      description: 'Dispaly the whole target tree.\n',
    },
    {
      name: 'awaits',
      alias: 'a',
      type: String,
      typeLabel: '{italic {underline target}}',
      description: 'Show the dependencies of a {underline {italic target}}.\n',
    },
    {
      name: 'base',
      alias: 'b',
      type: String,
      typeLabel: '{italic {underline base}}',
      description: 'Change into {italic {underline base}} before'
      + ' doing anything. The base defaults to the working directory.'
      + ' .\n',
    },
    {
      name: 'file',
      alias: 'f',
      type: String,
      typeLabel: '{italic {underline file}}',
      description: 'Read {italic {underline file}} as the makefile.'
      + ' It is relative to {underline base}'
      + ' and defaults to {italic ecmakefile.js}.'
      + ' .\n',
    },
    {
      name: 'init',
      alias: 'i',
      type: Boolean,
      description: 'Create a basic {italic ecmakefile.js}.\n',
    },
    {
      name: 'help',
      alias: 'h',
      type: Boolean,
      description: 'Show this usage guide.\n',
    },
    {
      name: 'options',
      alias: 'o',
      type: Boolean,
      description: 'Show the options only.\n',
    },
    {
      name: 'version',
      alias: 'v',
      type: Boolean,
      description: 'Show the version.\n',
    },
  ],
};
