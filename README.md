# ecmake is ecma make

Hint: Software and repository may undergo severe changes until version
1.0.0 is released.

## About

*Ecmake* is a make or rake alike program implemented in ecma script.
`ecmakefile.js` is a valid *node module* without any cryptic syntax.
It is the natural companion of `package.json`.It enters the stage,
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

