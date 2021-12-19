const PackageFixture = require('../lib/testing/package-fixture');

const packageFixture = new PackageFixture();

module.exports.mochaGlobalSetup = () => {
  packageFixture.setUp();
};
module.exports.mochaGlobalTeardown = () => {
  packageFixture.tearDown();
};
