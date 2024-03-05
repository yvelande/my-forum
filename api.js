const { ethers, getNamedAccounts, deployments } = require("hardhat")
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")

const app = express()
app.use(bodyParser.json())
// 使用CORS中间件
app.use(cors())
// 错误处理中间件
// app.use((err, req, res, next) => {
//     console.error(err.stack)
//     res.status(500).send("Something broke!")
// })

// 注册用户路由
app.post("/register", async (req, res) => {
    console.log("Received POST request to /register")
    try {
        const { userName, pwd, userAddress } = req.body
        console.log(userAddress)
        console.log(pwd)
        const accounts = await ethers.getSigners()
        signer = accounts[0]
        console.log(signer)
        await deployments.fixture(["all"])
        const UserInfoDeployment = await deployments.get("UserInfo")
        userInfo = await ethers.getContractAt(
            UserInfoDeployment.abi,
            UserInfoDeployment.address,
            signer,
        )
        console.log(`got contract in ${userInfo.target}`)
        // 使用 ethers.js 实例化合约

        console.log("Register contract...")
        const userAddressTrue = ethers.getAddress(userAddress)
        console.log
        const transactionResponse = await userInfo.createUser(
            userName,
            pwd,
            userAddress,
        )
        await transactionResponse.wait(1)
        console.log("Down")

        const currentnumber = await userInfo.retrieve()
        console.log(currentnumber)
        // 返回响应给前端
        res.json({ message: "Registration successful" })
    } catch (error) {
        console.error("Error during registration:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

// 启动服务器
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
