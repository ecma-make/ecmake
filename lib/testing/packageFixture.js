const fs = require('fs');
const os = require('os');
const path = require('path');
const process = require('process');
const cpr = require('child_process');

module.exports = class PackageFixture {
  constructor() {
    this.isUp = false;
  }

  setUp() {
    this.isUp = true;
  }

  tearDown() {
    this.isUp = false;
  }

  static getGlobalPackageState(pkg='@ecmake/ecmake') {
    const proc = cpr.spawnSync('npm', ['list', '--global', pkg]);
    const data = proc.stdout.toString();
    if(data.includes('empty')) {
      return null;
    } else {
      const proc = cpr.spawnSync('npm', ['list', '--global', '--link', pkg]);
      const data = proc.stdout.toString();
      if(data.includes('empty')) {
        return 'installed';
      } else {
        return 'linked';
      }
    }
  }
}

