# `ecmake` is ecma make

Next generation of task running

Hint: Software and repository may undergo severe changes until version
1.0.0 is released.

## About

The task runner `ecmake` is a make, rake or gulp alike command implemented in
ecmascript. The data model is built around a tree of task objects and offers a
DSL, modern aprroaches, that make it stand out amoungst others. In the spirit
of the ecmasript *ecmake* makes intensive use of promises. This allows to
cleanly scedule dependencies while running tasks in parallel whenever possible.

The makefile `ecmakefile.js` is a valid *node module* without any new syntax to
learn. It is the natural companion of `package.json`. It enters the stage,
where the scripts section of the json file is reaching the limits.

## What makes the difference?

* The task is the primary citizen, not just a configuration to a tool.
* Each task is addressable.
* The task tree allows for hierarchical organisation of the tasks quite like a
  directory.
* Semantic path names are a goal of the tree.
* The tree nodes are autocreated just by declaring a path.
* The methods of a task can be chained.
* They are designed as a simple domain specific language (DSL).
* The object tree allows for composition.
* The makefile can be modularised into multiple files.
* You don't need adapters. Just require any library to freely use it.

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
npx ecmake --version
```

### Install globally

```
npm install --global @ecmake/ecmake
ecmake --version
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
| help                | `$ ecmake (--help \| --options \| --version)`

- `[ ]` optional
- `( | )` alternatives

For a full reference of the options type `emake --options` and `ecmake --help`.

