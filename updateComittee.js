const Web3 = require("web3")
const { abi, bytecode } = require("./ManageInfo.json") // 导入智能合约ABI和字节码
const providerUrl = process.env.SEPOLIA_RPC_URL // 以太坊节点提供者URL
const accounts = await ethers.getSigners()
signer = accounts[0]
await deployments.fixture(["all"])
const ManageInfoDeployment = await deployments.get("ManageInfo")
manageInfo = await ethers.getContractAt(
    ManageInfoDeployment.abi,
    ManageInfoDeployment.address,
    signer,
)
const contractAddress = manageInfo.target
const privateKey = process.env.PRIVATE_KEY // 发送交易的账户私钥
const updateInterval = 15 * 24 * 60 * 60 * 1000 // 15天的毫秒数
// 创建一个Web3实例连接到以太坊网络
const web3 = new Web3(providerUrl)

// 设置交易发送账户
const account = web3.eth.accounts.privateKeyToAccount(privateKey)
web3.eth.accounts.wallet.add(account)

// 创建智能合约实例
const contract = new web3.eth.Contract(abi, contractAddress)

// 函数来发送事务以触发更新委员会成员的功能
async function triggerUpdateCommittee() {
    try {
        const gasPrice = await web3.eth.getGasPrice()
        const nonce = await web3.eth.getTransactionCount(account.address)

        const tx = contract.methods.updateCommitteeMembers() // 调用智能合约的更新委员会成员函数
        const data = tx.encodeABI()

        const transactionObject = {
            from: account.address,
            to: contractAddress,
            gasPrice: gasPrice,
            data: data,
            nonce: nonce,
            gas: 3000000, // 估计的Gas数量
        }

        const signedTx = await web3.eth.accounts.signTransaction(
            transactionObject,
            privateKey,
        )
        const receipt = await web3.eth.sendSignedTransaction(
            signedTx.rawTransaction,
        )
        console.log("Transaction sent. Receipt:", receipt)
    } catch (error) {
        console.error("Error:", error)
    }
}

// 定义一个函数来定期执行更新委员会成员的功能
function executeUpdateCommitteeFunction() {
    setInterval(async () => {
        await triggerUpdateCommittee()
    }, updateInterval)
}

// 启动定时执行功能
executeUpdateCommitteeFunction()
