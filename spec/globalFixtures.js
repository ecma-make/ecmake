const PackageFixture = require('../lib/testing/packageFixture');

const packageFixture = new PackageFixture();

module.exports.mochaGlobalSetup = () => {
  packageFixture.setUp();
};
module.exports.mochaGlobalTeardown = () => {
  packageFixture.tearDown();
};
