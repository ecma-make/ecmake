# `ecmake` is ecma make

Next generation task running

[![npm version](https://badge.fury.io/js/@ecmake%2Fecmake.svg)](https://badge.fury.io/js/@ecmake%2Fecmake)
[![Join the chat at https://gitter.im/ecma-make/ecmake](https://badges.gitter.im/ecma-make/ecmake.svg)](https://gitter.im/ecma-make/ecmake?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Hint: Software and repository may undergo severe changes until version
1.0.0 is released.

## About

The task runner `ecmake` is a make, rake or gulp alike command implemented in
ecmascript. The data model is a tree of task objects and offers a DSL. These
modern aproaches make it stand out amoungst other task runners. In the spirit
of the ecmasript *ecmake* makes intensive use of promises. This allows to
cleanly scedule dependencies while running tasks in parallel whenever possible.

The makefile `ecmakeCode.js` is a valid *node module* without any new syntax to
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

```sh
npm init -y
npm install --save-dev @ecmake/ecmake
npx ecmake --init
npx ecmake hello.world
```

## Installation

### Install on project base

```sh
npm install --save-dev @ecmake/ecmake
npx ecmake --version
npx ecmake --init
```

### Install globally

```sh
npm install --global @ecmake/ecmake
ecmake --version
```

Then in the local project:

```sh
npm link @ecmake/ecmake
ecmake --init
```

## `ecmake`

| usage               | command
| -----               | -------
| typical usage       | `$ ecmake target`
| do default target   | `$ ecmake`
| short form          | `$ ecmake [-b base] [-c code] target`
| long form           | `$ ecmake [--base base] [--code code] --target target`
| show dependencies   | `$ ecmake [--base base] [--code code] --awaits target`
| list targets        | `$ ecmake [--base base] [--code code] (--list \| --tree \| --descriptions)`
| init project        | `$ ecmake [--base base] [--code code] --init`
| help                | `$ ecmake (--help \| --options \| --version)`

- `[ ]` optional
- `( )` alternative

For a full reference of the options type `emake --options` and `ecmake --help`.

## `ecmakeCode.js`

### A minimal makefile

A callback is assigned by `will()`.

```js
const root = module.exports = require('@ecmake/ecmake').makeRoot();

root.default.will(() => console.log('Hello world!'));
```

### Educational examples

The `awaits()` method declares a dependency of `root.greeting` upon
`root.setup`. The `result` of `root.setup` is then used within the log message.

```js
root.setup.
    .will(() => { return { name: 'Mary' }; });

root.greeting
    .awaits(root.setup)
    .will(() => console.log(`Hello ${root.setup.result.name}!`));
```

Every task can be called on command line. Calling `ecmake setup` wouldn't give
any user experience, though. Hence, only the greeting task is selected as
a listable target. Only listable targets are listed by the option `--list`.

```js
root.setup.
    .will(() => { return { name: 'Mary' }; });

root.greeting
    .listed()
    .awaits(root.setup)
    .will(() => console.log(`Hello ${root.setup.name}!`));
```

A description can be given.

```js
root.setup.
    .will(() => { return { name: 'Mary' }; });

root.greeting
    .described("greets the person named in the setup task")
    .listed()
    .awaits(root.setup)
    .will(() => console.log(`Hello ${root.setup.name}!`));
```

The nodes already spring into existence upon the first call to their path. So
they can be wired up in any order.

```js
root.greeting
    .described("greets the person named in the setup task")
    .listed()
    .awaits(root.setup)
    .will(() => console.log(`Hello ${root.setup.name}!`));

root.setup.
    .will(() => { return { name: 'Mary' }; });
```

Multiple dependencies can be given to `awaits()`. Here `root.hello.world` and
`root.hello.mars` will be done in parallel. Hence, there is no order of
execution defined by the order of the argumens. On the other hand both are
garanteed to be finished before `root.default` will be executed. This is
of special importance for asynchronous tasks.

```js
root.default
    .awaits(root.hello.world, root.hello.mars)
    .will(() => console.log('finally done'));

root.hello.world
    .will(() => console.log('Hello world!'));

root.hello.mars
    .will(() => console.log('Hello mars!'));
```

For asynchronous code a promise is to be returned by the callback.

```js
root.countdown
    .will(() => new Promise(
      (resolve) => {
        setTimeout(() => {
            console.log('Hello moon, here we come!');
            resolve();
        }, 1000);
      },
    ));
```

### Full example of the template file

This example shows, how results are returned from a synchronous and an
asynchronous callback. In case of the asynchronous callback `root.countdown`
the result is returned with help of the `resolve` callback of the promise. In
case of the synchronous callback `root.setup` the result is returned directely.

```js
const root = module.exports = require('@ecmake/ecmake').makeRoot();

root.default
  .described('defaults to all')
  .awaits(root.all);

root.all
  .listed()
  .awaits(root.hello.planet, root.hello.world);

root.setup
  .described("it's the mars")
  .will(() => ({ planet: 'mars', countdown: 1000 }));

root.hello.world
  .listed()
  .will(() => console.log('Hello world!'));

root.hello.planet
  .described('to the planet given in setup')
  .listed()
  .awaits(root.countdown)
  .will(() => { console.log(root.countdown.result); });

root.countdown
  .awaits(root.setup)
  .will(() => new Promise(
    (resolve) => {
      setTimeout(() => {
        resolve(`Hello ${root.setup.result.planet}, here we go!`);
      }, root.setup.result.countdown);
    },
  ));
```

## Namig conventions for the task tree

### Domain name rules for the path

To get a uniform task tree it is recommended, to hold to rules for the choice
of domain names. This will also make sure, that no conflicts with private
properties of the `Task` object will occur. In special (heading) underscores
should be avoided. If a hypen is not enforced by the orthography, dots should
be prefered as separators.

### Nouns for the tasks

Tasks should be preferably named by nouns. While the API of the class `Task`
may be extended by `titled()` in future, `title` is a future proof
task name. However, this rule is not that strict, as the example of
`root.hello.world` shows. It is just a matter of weighting the risc.

## Terminology

- **runner**: The main job of the `ecmake` command line tool is to run the
  selected *task* called *target*.

- **makefile**: The *makefile* defines the *tasks*. The *default name* is
  `ecmakeCode.js`. It is a pure node module.

- **model**: The makefile defines a data model. It consists of a *task tree*
  and assigned *callback functions*.

- **callback**: To each task a callback function can be assigned by the
  `will()` method. It holds the instructions to be executed by the task.

- **promise**: A callback can return a **Promise** to be able to do
  asynchronous jobs.

- **task tree**: The tasks are organized as a tree, not as a list.It as a mere
  container of callbacks and does not reflect any dependencies between them.
  *See: dependency*

- **root**: The *root node* is to be exported by the *makefile* as access point
  for the *runner*.

- **leaf**: The *leaf nodes* typically hold the *callback functions*, but you
  are free to assign them to *inner nodes*, too.

- **task**: Technically every node in the tree is an object of the class `Task`
  from the root down to the leaves. It may hold a callback or not.

- **target**: The **target** is the *task*, that you select on the command line
  to be executed.

- **result of a task**: You **CAN** return a **result** from a callback, which
  will then become the *result of the task*. If it does *asynchronous* stuff,
  you **MUST** return a  ***Promise*** from the callback. The promise **CAN**
  *resolve* with a result itself, which will in turn become the *result of the
  task*.

- **result access**: The result of a task is accessible by the `result`
  property of the task as soon as the internal *Promise* is solved. Inside the
  callbacks of dependent tasks it is addressable via the task tree.

- **dependency**: The dependencies are declared by use of the `awaits()`
  method of a task.

- **order of execution**: The promises of all dependencies are solved before a
  callback is executed. The **results** of the dependencies are ready to be
  used. In short, it works as you would expect it to work.

- **parallel execution**: Tasks may be executed in parallel, if there is no
  dependency.

- **race condition**: If conflicts pop up due to race conditions of two tasks,
  you solve this by declaring a dependency to make sure they are executed in a
  timely order.
