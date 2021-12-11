module.exports = {
  header: 'Synopsis',
  content: [
    { tag: '{underline typical usage}:', line: '{bold $} ecmake {italic target}' },
    { tag: 'do default target:', line: '{bold $} ecmake' },
    { tag: 'short form:', line: '{bold $} ecmake [-b {italic base}] [-f {italic makefile}] {italic target}' },
    { tag: 'long form:', line: '{bold $} ecmake [--base {italic base}] [--file {italic makefile}] --target {italic target}' },
    { tag: 'show dependencies:', line: '{bold $} ecmake [--base {italic base}] [--file {italic makefile}] --awaits {italic target}' },
    { tag: 'list targets:', line: '{bold $} ecmake [--base {italic base}] [--file {italic makefile}] (--list | --tree)' },
    { tag: 'init project:', line: '{bold $} ecmake [--base {italic base}] [--file {italic makefile}] --init' },
    { tag: 'help:', line: '{bold $} ecmake (--help | --options | --version)' },
    { tag: '', line: '' },
    { tag: '[ ]', line: 'optional' },
    { tag: '( | )', line: 'alternatives' },
  ],
};
