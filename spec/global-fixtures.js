const PackageFixture = require('./lib/package-fixture');

const packageFixture = new PackageFixture();

module.exports.mochaGlobalSetup = () => {
  packageFixture.setUp();
};
module.exports.mochaGlobalTeardown = () => {
  packageFixture.tearDown();
};
