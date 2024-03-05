const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config.js")

const { network } = require("hardhat")
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    //when going for localhost or hardhat network we want to use a mock
    const fundMe = await deploy("UserInfo", {
        from: deployer,
        log: true,
    })
    log("----------------------------------------------------")
}
module.exports.tags = ["all"]
