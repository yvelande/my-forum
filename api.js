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
        // res.json({ message: "Registration successful", userId: userId })
        // 调用智能合约的创建用户函数
        //从事件中获得返回的userId
        let userIdReturn
        userInfo.on("UserRegistered", (userId) => {
            console.log("User Registered:", userId)
            userIdReturn = userId
        })
        const transactionResponse = await userInfo.createUser(
            userName,
            pwd,
            userAddress,
        )
        await transactionResponse.wait()
        //因为是uint256要进行转化
        res.json({ userId: userIdReturn })
        // 从交易响应中提取用户 ID
        // 返回用户 ID 给前端
    } catch (error) {
        console.error("Error during registration:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

// 注册用户路由
app.post("/login", async (req, res) => {
    console.log("Received POST request to /login")
    try {
        const { userId, pwd } = req.body
        // 使用 ethers.js 实例化合约
        console.log("Login contract...")
        // res.json({ message: "Registration successful", userId: userId })
        // 调用智能合约的创建用户函数
        //从事件中获得返回的userId
        const isValidLogin = await userInfo.loginUser(userId, pwd)
        res.json({ isValidLogin: isValidLogin })
    } catch (error) {
        console.error("Error during registration:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.get("/user/:userId", async (req, res) => {
    console.log("Received GET request to /user/:userId")
    try {
        const userId = req.params.userId
        console.log("User ID:", userId)
        console.log(`Got contract in ${userInfo.target}`)
        console.log("获取用户信息如下")
        // 调用合约的 getUserInfo 函数
        const user = await userInfo.getUserInfo(userId)
        console.log(user)

        // 返回用户信息给前端
        res.json(user)
    } catch (error) {
        console.error("Error fetching user info:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

// 启动服务器
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
