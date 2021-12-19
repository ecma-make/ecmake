const cpr = require('child_process');

const ErrorClassFactory = require('../error-class-factory');

module.exports = class PackageFixture {
  constructor() {
    this.package = '@ecmake/ecmake';
    this.isUp = false;
  }

  setUp() {
    const state = this.getGlobalPackageState();
    if (state === null) {
      this.link();
      this.isUp = true;
    } else {
      throw new this.constructor.GLOBAL_INSTALLATION_ERROR(
        'A global installation or link has to be removed before the tests',
      );
    }
  }

  tearDown() {
    this.unlink();
    this.isUp = false;
  }

  install() {
    cpr.spawnSync('npm', ['install', '--global', this.package]);
  }

  uninstall() {
    cpr.spawnSync('npm', ['uninstall', '--global', this.package]);
  }

  link() { // eslint-disable-line class-methods-use-this
    cpr.spawnSync('npm', ['link']);
  }

  unlink() {
    cpr.spawnSync('npm', ['unlink', '--global', this.package]);
  }

  getGlobalPackageState() {
    {
      const proc = cpr.spawnSync('npm', ['list', '--global', this.package]);
      const data = proc.stdout.toString();
      if (data.includes('empty')) return null;
    } {
      const proc = cpr.spawnSync('npm', ['list', '--global', '--link',
        this.package]);
      const data = proc.stdout.toString();
      if (data.includes('empty')) return 'installed';
    }
    return 'linked';
  }
};

ErrorClassFactory.register(module.exports, 'GLOBAL_INSTALLATION_ERROR');
