var Migrations = artifacts.require("../contacts/Election.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
