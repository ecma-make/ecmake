#!/usr/bin/env node

const { Task, toolBox } = require('./model');

module.exports = {
  Task,
  toolBox,
  makeRoot() {
    return new Task();
  },
  globalRoot() {
    global.root = new Task();
  },
};

if (require.main === module) {
  const Runner = require('./runner'); // eslint-disable-line global-require
  new Runner().go();
}
