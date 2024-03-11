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

    // 部署代币合约
    const tokenContract = await deploy("TokenERC20", {
        from: deployer,
        args: [1000000, "ForumToken", "FT"],
        log: true,
    })
    log("TokenERC20 deployed at:", tokenContract.address)
    log("----------------------------------------------------")

    // 部署 ManagementInfo 合约并连接其他合约
    const managementInfoContract = await deploy("ManageInfo", {
        from: deployer,
        args: [
            userContract.address, // 传递 UserInfo 合约地址
            contentContract.address, // 传递 ContentInfo 合约地址
            tokenContract.address, // 传递 TokenERC20 合约地址
        ],
        log: true,
    })
    log("ManagementInfo deployed at:", managementInfoContract.address)
    log("----------------------------------------------------")
}
module.exports.tags = ["all"]
