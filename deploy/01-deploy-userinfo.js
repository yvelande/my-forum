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
    const userContract = await deploy("UserInfo", {
        from: deployer,
        log: true,
    })
    log("UserInfo deployed at:", userContract.address)
    log("----------------------------------------------------")

    // 部署第二个合约
    const contentContract = await deploy("ContentInfo", {
        from: deployer,
        log: true,
    })
    log("ContentInfo deployed at:", contentContract.address)

    log("----------------------------------------------------")
}
module.exports.tags = ["all"]
