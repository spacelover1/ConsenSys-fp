const MarketPlace = artifacts.require("MarketPlace.sol");

module.exports = function(deployer) {
 deployer.deploy(MarketPlace);
};