# ecmake is ecma make

Hint: Software and repository may undergo severe changes until version
1.0.0 is released.

## About

*Ecmake* is a make or rake alike program implemented in ecma script.
`ecmakefile.js` is a valid *node module* without any cryptic syntax.
It is the natural companion of `package.json`. It enters the stage,
where the scripts section of the json file is reaching the limits.
In the spirit of the ecma language *ecmake* makes intensive use of
promises. This allows to cleanly scedule dependencies while running
tasks in parallel whenever possible.

## Getting started

```
npm init -y
npm install --save-dev @ecmake/ecmake
npx ecmake --init
npx ecmake hello.world
```

## Installation

### Install on project base

```
npm install --save-dev @ecmake/ecmake
npx ecmake --help
```

### Install globally

```
npm install --global @ecmake/ecmake
ecmake --help
```

## `ecmake`

| usage               | command
| ------------------- | --------------------------------------------------------------------
| typical usage       | `$ ecmake target`
| do default target   | `$ ecmake`
| short form          | `$ ecmake [-d directory] [-f makefile] target`
| long form           | `$ ecmake [--directory directory] [--file makefile] --target target`
| show dependencies   | `$ ecmake [--directory directory] [--file makefile] --awaits target`
| list targets        | `$ ecmake [--directory directory] [--file makefile] (--list \| --tree)`
| init project        | `$ ecmake [--directory directory] [--file makefile] --init`
| help                | `$ ecmake (--help \| --options)`

- `[ ]` optional
- `( | )` alternatives

For a full reference of the options type `emake --options` and `ecmake --help`.


