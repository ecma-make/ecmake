require('chai').should();
const path = require('path');
const fs = require('fs');
const cpr = require('child_process');

const PackageFixture = require('../../lib/testing/packageFixture');

before(() => {
  cpr.execSync('npm uninstall --global @ecmake/ecmake');
  cpr.execSync('npm unlink --global @ecmake/ecmake');
});

after(() => {
  cpr.execSync('npm uninstall --global @ecmake/ecmake');
  cpr.execSync('npm link');
});

describe('PackageFixture', function () {
  describe('constructor', () => {
    const packageFixture = new PackageFixture();
    it('should initially set isUp to false', () => {
      packageFixture.isUp.should.be.false;
    });
  });

  describe('getGlobalPackageState', function() {
    this.timeout(10000);
    it('should return null if package not in global directory', function() {
      const state = PackageFixture.getGlobalPackageState();
      (state === null).should.be.true;
    });
    it('should return linked if package is globally linked', function() {
      cpr.execSync('npm link');
      const state = PackageFixture.getGlobalPackageState();
      state.should.equal('linked');
      cpr.execSync('npm unlink --global @ecmake/ecmake');
    });
    it('should return installed if package is globally installed', function() {
      try {
        cpr.execSync('npm install --global @ecmake/ecmake', { stdio: 'ignore' });
        const state = PackageFixture.getGlobalPackageState();
        state.should.equal('installed');
      } catch(error) {
        this.skip();
      } finally {
        cpr.execSync('npm uninstall --global @ecmake/ecmake');
      }
    });
  });
});
