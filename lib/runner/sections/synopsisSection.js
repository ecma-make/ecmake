module.exports = {
  header: 'Synopsis',
  content: [
    { tag: '{underline typical usage}:', line: '{bold $} ecmake {italic target}' },
    { tag: 'do default target:', line: '{bold $} ecmake' },
    { tag: 'short form:', line: '{bold $} ecmake [-b {italic base}] [-c {italic code}] {italic target}' },
    { tag: 'long form:', line: '{bold $} ecmake [--base {italic base}] [--code {italic code}] --target {italic target}' },
    { tag: 'show dependencies:', line: '{bold $} ecmake [--base {italic base}] [--code {italic code}] --awaits {italic target}' },
    { tag: 'list targets:', line: '{bold $} ecmake [--base {italic base}] [--code {italic code}] (--list | --tree)' },
    { tag: 'init project:', line: '{bold $} ecmake [--base {italic base}] [--code {italic code}] --init' },
    { tag: 'help:', line: '{bold $} ecmake (--help | --options | --version)' },
    { tag: '', line: '' },
    { tag: '[ ]', line: 'optional' },
    { tag: '( | )', line: 'alternatives' },
  ],
};
