const Staking = artifacts.require("Staking");

module.exports = async(deployer) => {
  await deployer.deploy(Staking);
};