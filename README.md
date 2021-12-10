# `ecmake` is ecma make

Next generation task running

Hint: Software and repository may undergo severe changes until version
1.0.0 is released.

## About

The task runner `ecmake` is a make, rake or gulp alike command implemented in
ecmascript. The data model is a tree of task objects and offers a DSL, modern
aprroaches, that make it stand out amoungst others. In the spirit of the
ecmasript *ecmake* makes intensive use of promises. This allows to cleanly
scedule dependencies while running tasks in parallel whenever possible.

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
| -----               | -------
| typical usage       | `$ ecmake target`
| do default target   | `$ ecmake`
| short form          | `$ ecmake [-d directory] [-f makefile] target`
| long form           | `$ ecmake [--directory directory] [--file makefile] --target target`
| show dependencies   | `$ ecmake [--directory directory] [--file makefile] --awaits target`
| list targets        | `$ ecmake [--directory directory] [--file makefile] (--list \| --tree)`
| init project        | `$ ecmake [--directory directory] [--file makefile] --init`
| help                | `$ ecmake (--help \| --options \| --version)`

- `[ ]` optional
- `( )` alternative

For a full reference of the options type `emake --options` and `ecmake --help`.

## Terminology

- **runner**: The main job of the `ecmake` command line tool is to run the
  selected *task* called *target*.

- **makefile**: The *makefile* defines the *tasks*. The *default name* is
  `ecmakefile.js`. It is a pure node module.

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

- **title**: A *title* can be assigened to a *task* by use of the `titled()`
  method. It will be listed with the `--list` option und becomes part of the
  user interface by this step.

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
