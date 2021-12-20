require('chai').should();
const cpr = require('child_process');

const { PackageFixture } = require('../..').testing;

describe('PackageFixture', function () {
  this.timeout(10000);
  let packageFixture;
  function clean() {
    cpr.spawnSync('npm', ['uninstall', '--global', '@ecmake/ecmake']);
  }

  before(() => {
    packageFixture = new PackageFixture();
  });

  after(() => {
    clean();
    packageFixture.link();
  });

  describe('constructor', function () {
    it('should set package to @ecmake/ecmake', function () {
      packageFixture.package.should.equal('@ecmake/ecmake');
    });
    it('should initially set isUp to false', function () {
      packageFixture.isUp.should.be.false;
    });
  });

  describe('getGlobalPackageState', function () {
    it('should return null if package not in global directory', function () {
      clean();
      (packageFixture.getGlobalPackageState() == null).should.be.true;
    });
    it('should return linked if package is globally linked', function () {
      clean();
      packageFixture.link();
      packageFixture.getGlobalPackageState().should.equal('linked');
    });
    it('should return installed if package is globally installed', function () {
      this.timeout(20000);
      clean();
      try {
        packageFixture.install();
        const state = packageFixture.getGlobalPackageState();
        state.should.equal('installed');
      } catch (error) {
        this.skip();
      }
    });
  });

  describe('install', function () {
    before(function () {
      clean();
      try {
        packageFixture.install();
      } catch (error) {
        this.skip();
      }
    });
    it('should install the package globally', function () {
      packageFixture.getGlobalPackageState().should.equal('installed');
    });
  });

  describe('uninstall', function () {
    before(() => {
      clean();
      try {
        packageFixture.install();
      } catch (error) {
        this.skip();
      }
      packageFixture.uninstall();
    });
    it('should uninstall the package globally', function () {
      (packageFixture.getGlobalPackageState() === null).should.be.true;
    });
  });

  describe('link', function () {
    before(() => {
      clean();
      packageFixture.link();
    });
    it('should link the package globally', function () {
      const state = packageFixture.getGlobalPackageState();
      state.should.equal('linked');
    });
  });

  describe('unlink', function () {
    before(() => {
      clean();
      packageFixture.link();
      packageFixture.unlink();
    });
    it('should unlink the package globally', function () {
      (packageFixture.getGlobalPackageState() === null).should.be.true;
    });
  });

  describe('setUp', function () {
    describe('with empty global installation', function () {
      before(() => {
        clean();
        packageFixture.setUp();
      });
      it('should set isUp to true', function () {
        packageFixture.isUp.should.be.true;
      });
      it('should link the global installation to the library', function () {
        (packageFixture.getGlobalPackageState() === 'linked').should.be.true;
      });
    });
    describe('with existing global link', function () {
      before(() => {
        clean();
        packageFixture.link();
      });
      it('should throw', function () {
        try {
          packageFixture.setUp();
          throw new Error('must not come here');
        } catch (error) {
          (error instanceof PackageFixture.GlobalInstallationError).should.be.true;
        }
      });
    });

    describe('with existing global installation', function () {
      before(() => {
        clean();
        packageFixture.install();
      });
      it('should throw', function () {
        try {
          packageFixture.setUp();
          throw new Error('must not come here');
        } catch (error) {
          (error instanceof PackageFixture.GlobalInstallationError).should.be.true;
        }
      });
    });
  });

  describe('tearDown', function () {
    before(() => {
      clean();
      packageFixture.tearDown();
    });
    it('should set isUp to false', function () {
      packageFixture.isUp.should.be.false;
    });
    it('should unlink the package globally', function () {
      (packageFixture.getGlobalPackageState() === null).should.be.true;
    });
  });
});
