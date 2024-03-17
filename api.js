const { ethers, getNamedAccounts, deployments } = require("hardhat")
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const { web3, default: Web3 } = require("web3")
const { application } = require("express")
const app = express()
app.use(bodyParser.json())

// 使用CORS中间件
app.use(cors())
// 错误处理中间件
// app.use((err, req, res, next) => {
//     console.error(err.stack)
//     res.status(500).send("Something broke!")
// })
let userInfo
let contentInfo
let tokenContract
let manageInfo
// 注册用户路由

// 创建合约
app.post("/create-user", async (req, res) => {
    console.log("Received POST request to /create-content")
    try {
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
        res.json({ message: "成功创建用户合约" })
    } catch (error) {
        console.error("Error creating Content:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.post("/register", async (req, res) => {
    console.log("Received POST request to /register")
    try {
        const { userName, pwd, userAddress } = req.body
        console.log(userAddress)
        console.log(pwd)
        console.log(`got contract in ${userInfo.target}`)
        // 使用 ethers.js 实例化合约

        console.log("Register contract...")
        // 创建一个 Promise 用于等待事件被触发
        const userIdRegisteredPromise = new Promise((resolve, reject) => {
            userInfo.once("UserRegistered", (userId) => {
                console.log("User Registered:", userId)
                resolve(userId)
            })
        })

        // 发送创建用户的交易
        const transactionResponse = await userInfo.createUser(
            userName,
            pwd,
            userAddress,
        )
        await transactionResponse.wait()

        // 等待事件被触发，并获取用户 ID
        const userIdReturn = await userIdRegisteredPromise

        // 返回用户 ID 给前端
        res.json({ userId: userIdReturn.toString() })
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
        // const isValidLogin = await userInfo.loginUser(userId, pwd)
        // const userIduint = ethers.keccak256(ethers.toUtf8Bytes(userId))
        const userIduint = fromStringToUint(userId)
        console.log(userIduint)
        const isValidLogin = await userInfo.loginUser(userIduint, pwd)
        console.log(isValidLogin)
        res.json({ isValidLogin: isValidLogin })
    } catch (error) {
        console.error("Error during Login:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.get("/user/get/:userId", async (req, res) => {
    console.log("Received GET request to /user/:userId")
    try {
        const userId = req.params.userId
        console.log("User ID:", userId)
        console.log(`Got contract in ${userInfo.target}`)
        console.log("获取用户信息如下")
        // 调用合约的 getUserInfo 函数
        const user = await userInfo.getUserInfo(fromStringToUint(userId))
        console.log(user)

        // 返回用户信息给前端
        res.json(user)
    } catch (error) {
        console.error("Error fetching user info:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.post("/user/update", async (req, res) => {
    console.log("Received POST request to /user/update")
    try {
        const {
            userAddress, // 用户钱包地址
            userId, // 用户ID
            userName, // 用户名
            pwd, // 密码
            role,
            assertUpdate,
        } = req.body
        console.log("User ID:", userId)
        console.log(`Got contract in ${userInfo.target}`)
        console.log("进行更新")
        // 调用合约的 getUserInfo 函数
        const transactionResponse = await userInfo.updateUserInfo(
            userAddress,
            fromStringToUint(userId),
            userName,
            pwd,
            role,
            fromStringToUint(assertUpdate),
        )
        await transactionResponse.wait()
        // 返回用户信息给前端
        res.json({ message: "Registration successful" })
    } catch (error) {
        console.error("Error updating user info:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

// 创建合约
app.post("/create-content", async (req, res) => {
    console.log("Received POST request to /create-content")
    try {
        // const { userId, title, content } = req.body
        // // 获取以太坊账号
        const accounts = await ethers.getSigners()
        const signer = accounts[0]

        // 部署合约
        await deployments.fixture(["all"])
        const ContentInfoDeployment = await deployments.get("ContentInfo")

        // 获取文章合约实例
        contentInfo = await ethers.getContractAt(
            ContentInfoDeployment.abi,
            ContentInfoDeployment.address,
            signer,
        )
        console.log(`got contract in ${contentInfo.target}`)
        res.json({ message: "成功创建内容合约" })
    } catch (error) {
        console.error("Error creating content:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.post("/create-article", async (req, res) => {
    console.log("Received POST request to /create-article")
    try {
        const { userId, title, content } = req.body
        //获取用户
        const user = await userInfo.getUserInfo(fromStringToUint(userId))
        // 获取以太坊账号
        console.log(`got contract in ${contentInfo.target}`)
        console.log("Creating article...")

        // 创建一个 Promise 用于等待事件被触发
        const contentCreatedPromise = new Promise((resolve, reject) => {
            contentInfo.once("ContentCreated", (contentId) => {
                console.log("Content Created:", contentId)
                resolve(contentId)
            })
        })

        // 发送创建文章交易
        const transactionResponse = await contentInfo.createContent(
            fromStringToUint(userId),
            title,
            content,
        )
        await transactionResponse.wait()

        // 转账给用户100个代币
        const tx = await tokenContract.transfer(user.userAddress, 100)
        await tx.wait()

        // 等待事件被触发，并获取文章 ID
        const contentIdReturn = await contentCreatedPromise

        console.log("Article created successfully")
        console.log(contentIdReturn)
        res.json({ contentId: contentIdReturn.toString() })
    } catch (error) {
        console.error("Error creating article:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.get("/content/get/:contentId", async (req, res) => {
    console.log("Received GET request to /content/:contentId")
    try {
        const contentId = req.params.contentId
        console.log("Content ID:", contentId)
        console.log(`Got contract in ${contentInfo.target}`)
        const content = await contentInfo.getContent(
            fromStringToUint(contentId),
        )
        console.log("获取文章信息如下", content)
        const item = content
        // 返回用户信息给前端
        res.json({
            contentId: item.contentId,
            userId: item.userId,
            title: item.title,
            content: item.content,
            updateTime: item.updateTime,
            praiseCount: item.praiseCount,
            contentState: item.contentState,
        })
    } catch (error) {
        console.error("Error fetching content info:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.post("/content/update", async (req, res) => {
    console.log("Received POST request to /content/update")
    try {
        const { contentId, title, content } = req.body
        console.log("Content ID:", contentId)
        console.log(`Got contract in ${contentInfo.target}`)
        console.log("进行文章更新")
        // 调用合约的 getUserInfo 函数
        const transactionResponse = await contentInfo.updateContent(
            fromStringToUint(contentId),
            title,
            content,
        )
        await transactionResponse.wait()
        // 返回用户信息给前端
        res.json({ message: "Registration successful" })
    } catch (error) {
        console.error("Error updating content info:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.get("/content/getAllContent", async (req, res) => {
    console.log("Received GET request to /content/getAllContent")
    try {
        console.log(`Got contract in ${contentInfo.target}`)
        const contentAll = await contentInfo.getAllContent()
        console.log("获取文章List信息如下", contentAll)
        const contentArray = contentAll.map((item) => ({
            contentId: item.contentId,
            userId: item.userId,
            title: item.title,
            content: item.content,
            updateTime: item.updateTime,
            praiseCount: item.praiseCount,
            contentState: item.contentState,
        }))

        // 返回用户信息给前端
        res.json(contentArray)
    } catch (error) {
        console.error("Error fetching all content info:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.post("/content/doPraise", async (req, res) => {
    console.log("Received POST request to /comment/praiseComment")
    try {
        const { contentId } = req.body
        console.log("content ID:", contentId)
        console.log(`Got contract in ${contentInfo.target}`)
        console.log("对帖子进行点赞", contentId)

        // 创建一个 Promise 用于等待事件被触发
        const praiseDonePromise = new Promise((resolve, reject) => {
            contentInfo.once("PraiseDone", (praiseCount) => {
                console.log("PraiseDone:", praiseCount)
                resolve(praiseCount)
            })
        })

        // 调用智能合约的点赞评论函数
        const transactionResponse = await contentInfo.praiseContent(contentId)
        await transactionResponse.wait()

        const content = await contentInfo.getContent(
            fromStringToUint(contentId),
        )
        const contentUser = await userInfo.getUserInfo(
            fromStringToUint(content.userId),
        )
        //转账给发表文章用户1代币
        const tx1 = await tokenContract.transfer(contentUser.userAddress, 1)
        await tx1.wait()

        // 等待点赞事件被触发，并获取点赞数
        const praiseCountReturn = await praiseDonePromise

        // 返回点赞数给前端
        res.json({ praiseCount: praiseCountReturn.toString() })
    } catch (error) {
        console.error("Error praising content:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.post("/create-comment", async (req, res) => {
    console.log("Received POST request to /create-comment")
    try {
        const { userId, contentId, comment } = req.body
        // 获取以太坊账号
        console.log(`got contract in ${contentInfo.target}`)
        console.log("Creating comment...")

        // 创建一个 Promise 用于等待事件被触发
        const commentCreatedPromise = new Promise((resolve, reject) => {
            contentInfo.once("CommentCreated", (commentId) => {
                console.log("Comment Created:", commentId)
                resolve(commentId)
            })
        })

        // 发送创建评论交易
        const transactionResponse = await contentInfo.createComment(
            fromStringToUint(contentId),
            fromStringToUint(userId),
            comment,
        )
        await transactionResponse.wait()

        const user = await userInfo.getUserInfo(fromStringToUint(userId))
        // 转账给发表评论用户10个代币
        const tx = await tokenContract.transfer(user.userAddress, 10)
        await tx.wait()

        const content = await contentInfo.getContent(
            fromStringToUint(contentId),
        )
        const contentUser = await userInfo.getUserInfo(
            fromStringToUint(content.userId),
        )
        //转账给发表文章用户1代币
        const tx1 = await tokenContract.transfer(contentUser.userAddress, 1)
        await tx1.wait()
        // 等待事件被触发，并获取评论 ID
        const commentIdReturn = await commentCreatedPromise

        console.log("Comment created successfully")
        console.log(commentIdReturn)
        res.json({ commentId: commentIdReturn.toString() })
    } catch (error) {
        console.error("Error creating comment:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.get("/comment/get/:commentId", async (req, res) => {
    console.log("Received GET request to /comment/get/:commentId")
    try {
        const commentId = req.params.commentId
        console.log("Comment ID:", commentId)
        console.log(`Got contract in ${contentInfo.target}`)
        const comment = await contentInfo.getComment(
            fromStringToUint(commentId),
        )
        console.log("获取评论信息如下", comment)
        // 返回评论信息给前端
        res.json({
            contentId: comment.contentId,
            userId: comment.userId,
            commentId: comment.commentId,
            comment: comment.comment,
            updateTime: comment.updateTime,
            praiseCount: comment.praiseCount,
            commentState: comment.commentState,
        })
    } catch (error) {
        console.error("Error fetching comment info:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.post("/comment/update", async (req, res) => {
    console.log("Received POST request to /comment/update")
    try {
        const { commentId, comment } = req.body
        console.log("Comment ID:", commentId)
        console.log(`Got contract in ${contentInfo.target}`)
        console.log("Updating comment...")
        // 调用合约的 updateComment 函数
        const transactionResponse = await contentInfo.updateComment(
            fromStringToUint(commentId),
            comment,
        )
        await transactionResponse.wait()
        // 返回成功消息给前端
        res.json({ message: "Comment updated successfully" })
    } catch (error) {
        console.error("Error updating comment:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

//获取content对应的comment
app.get("/content/getCommentsByContentId/:contentId", async (req, res) => {
    console.log("Received GET request to /content/getCommentsByContentId")
    try {
        const contentId = req.params.contentId
        console.log("Content ID:", contentId)
        console.log(`Got contract in ${contentInfo.target}`)
        const comments = await contentInfo.getCommentsByContentId(
            fromStringToUint(contentId),
        )
        console.log("获取评论信息如下", comments)
        const commentArray = comments.map((item) => ({
            contentId: item.contentId,
            userId: item.userId,
            commentId: item.commentId,
            comment: item.comment,
            updateTime: item.updateTime,
            praiseCount: item.praiseCount,
            commentState: item.commentState,
        }))
        // 返回评论信息给前端
        res.json(commentArray)
    } catch (error) {
        console.error("Error fetching comment info:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.post("/comment/praiseComment", async (req, res) => {
    console.log("Received POST request to /comment/praiseComment")
    try {
        const { commentId } = req.body
        console.log("Comment ID:", commentId)
        console.log(`Got contract in ${contentInfo.target}`)
        console.log("对评论进行点赞", commentId)

        // 创建一个 Promise 用于等待事件被触发
        const praiseDonePromise = new Promise((resolve, reject) => {
            contentInfo.once("PraiseCommentDone", (praiseCount) => {
                console.log("PraiseCommentDone:", praiseCount)
                resolve(praiseCount)
            })
        })

        // 调用智能合约的点赞评论函数
        const transactionResponse = await contentInfo.praiseComment(commentId)
        await transactionResponse.wait()

        // 等待点赞评论事件被触发，并获取点赞数
        const praiseCountReturn = await praiseDonePromise

        // 返回点赞数给前端
        res.json({ praiseCount: praiseCountReturn.toString() })
    } catch (error) {
        console.error("Error praising comment:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

// 创建投诉
app.post("/create-complain", async (req, res) => {
    console.log("Received POST request to /create-complain")
    try {
        const { userId, contentId, commentId, content } = req.body
        console.log(`Got contract in ${contentInfo.target}`)
        console.log("创建新的投诉")

        // 创建一个 Promise 用于等待事件被触发
        const complaintCreatedPromise = new Promise((resolve, reject) => {
            contentInfo.once("ComplaintCreated", (complaintId) => {
                console.log("Complaint Created:", complaintId)
                resolve(complaintId)
            })
        })

        // 发送创建评论交易
        const transactionResponse = await contentInfo.createComplaint(
            fromStringToUint(contentId),
            fromStringToUint(userId),
            fromStringToUint(commentId),
            content,
        )
        await transactionResponse.wait()

        // 等待事件被触发，并获取评论 ID
        const complaintIdReturn = await complaintCreatedPromise

        console.log("Comment created successfully")
        console.log(complaintIdReturn)
        res.json({ complainId: complaintIdReturn.toString() })
    } catch (error) {
        console.error("Error creating complaint:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.get("/complain/get/:complainId", async (req, res) => {
    console.log("Received GET request to /complain/get/:complainId")
    try {
        const complainId = req.params.complainId
        console.log("Complain ID:", complainId)
        console.log(`Got contract in ${contentInfo.target}`)
        const complain = await contentInfo.getComplain(
            fromStringToUint(complainId),
        )
        console.log("获取投诉信息如下", complain)
        // 返回投诉信息给前端
        res.json({
            complaintId: complain.complaintId,
            contentId: complain.contentId,
            userId: complain.userId,
            commentId: complain.commentId,
            content: complain.content,
            updateTime: complain.updateTime,
            complainState: complain.complainState,
        })
    } catch (error) {
        console.error("Error fetching complain info:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.get("/complain/getAllComplaints", async (req, res) => {
    console.log("Received GET request to /complain/getAllComplaints")
    try {
        console.log(`Got contract in ${contentInfo.target}`)
        const complaintAll = await contentInfo.getAllComplain()
        console.log("获取投诉信息如下", complaintAll)
        const complaintArray = complaintAll.map((item) => ({
            complaintId: item.complaintId,
            contentId: item.contentId,
            userId: item.userId,
            commentId: item.commentId,
            content: item.content,
            updateTime: item.updateTime,
            complainState: item.complainState,
        }))

        // 返回投诉信息给前端
        res.json(complaintArray)
    } catch (error) {
        console.error("Error fetching all complaint info:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

// 创建代币合约
app.post("/create-token", async (req, res) => {
    console.log("Received POST request to /create-token")
    try {
        const accounts = await ethers.getSigners()
        signer = accounts[0]
        console.log(signer)
        await deployments.fixture(["all"])
        const TokenDeployment = await deployments.get("TokenERC20")
        tokenContract = await ethers.getContractAt(
            TokenDeployment.abi,
            TokenDeployment.address,
            signer,
        )
        console.log(`got contract in ${tokenContract.target}`)
        res.json({ message: "成功创建代币合约" })
    } catch (error) {
        console.error("Error creating Content:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

//查询用户id对应的代币余额
app.get("/token/get/:userId", async (req, res) => {
    console.log("Received GET request to /user-token-balance")
    try {
        const { userId } = req.params
        const user = await userInfo.getUserInfo(fromStringToUint(userId))
        console.log(user)
        // 查询用户代币余额
        const balance = await tokenContract.getBalance(user.userAddress)

        console.log(
            `User ${user.userAddress} token balance:`,
            balance.toString(),
        )
        res.json({ userId, balance: balance.toString() })
    } catch (error) {
        console.error("Error fetching user token balance:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.post("/token/transfer", async (req, res) => {
    console.log("Received POST request to /token/transfer")
    try {
        const { userId, amount } = req.body
        const user = await userInfo.getUserInfo(fromStringToUint(userId))

        // 假设你的代币合约在 tokenContract 变量中
        // 发起转账交易
        const transactionResponse = await tokenContract.transfer(
            user.userAddress,
            fromStringToUint(amount),
        )

        console.log("Transfer transaction response:", transactionResponse)

        res.json({
            status: "Transfer successful",
            transactionHash: transactionResponse.hash,
        })
    } catch (error) {
        console.error("Error transferring tokens:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

// 创建合约
app.post("/create-manage", async (req, res) => {
    console.log("Received POST request to /create-manage")
    try {
        const accounts = await ethers.getSigners()
        signer = accounts[0]
        console.log(signer)
        await deployments.fixture(["all"])
        const ManageInfoDeployment = await deployments.get("ManageInfo")
        manageInfo = await ethers.getContractAt(
            ManageInfoDeployment.abi,
            ManageInfoDeployment.address,
            signer,
        )
        console.log(`got contract in ${manageInfo.target}`)
        res.json({ message: "成功创建管理合约" })
    } catch (error) {
        console.error("Error creating Manage:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.post("/manage/createCommittee", async (req, res) => {
    console.log("Received POST request to /manage/createCommittee")
    try {
        console.log(`got contract in ${manageInfo.target}`)
        // const committeePromise = new Promise((resolve, reject) => {
        //     manageInfo.once("CommitteGotten", (committee) => {
        //         console.log("Committe Gotten:", committee)
        //         resolve(committee)
        //     })
        // })
        const transactionResponse = await manageInfo.getCommitMembers()
        await transactionResponse.wait()
        console.log(transactionResponse)
        // const committeeInReturn = await committeePromise
        res.json({
            committe: "success",
        })
    } catch (error) {
        console.error("Error transferring tokens:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.get("/manage/getCommittee", async (req, res) => {
    console.log("Received POST request to /manage/getCommittee")
    try {
        console.log(`got contract in ${manageInfo.target}`)
        const ret = await manageInfo.returnCommitMembers()
        console.log(ret)
        res.json({
            committe: ret,
        })
    } catch (error) {
        console.error("Error transferring tokens:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.post("/manage/makeVotes", async (req, res) => {
    console.log("Received POST request to /manage/makeVotes")
    try {
        const { userId, complainId, isVote } = req.body
        console.log(`got contract in ${manageInfo.target}`)
        const transactionResponse = await manageInfo.makeVote(
            fromStringToUint(userId),
            fromStringToUint(complainId),
            fromStringToUint(isVote),
        )
        await transactionResponse.wait()
        console.log(transactionResponse)
        res.json({
            message: "success",
        })
    } catch (error) {
        console.error("Error transferring tokens:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.get("/manage/getVoteResults/:complainId", async (req, res) => {
    console.log("Received GET request to /manage/getVoteResults")
    try {
        const { complainId } = req.params
        console.log("获取的投诉是", complainId)
        console.log(`got contract in ${manageInfo.target}`)
        const supportNumber = await manageInfo.getVoteResults(complainId)
        console.log("赞同的数量是", supportNumber)
        res.json({
            supportNumber: supportNumber,
        })
    } catch (error) {
        console.error("Error transferring tokens:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

// 启动服务器
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

function fromStringToUint(userId) {
    // const hash= ethers.keccak256(ethers.toUtf8Bytes(userId))
    // return Web3.utils.toBigInt(userId)
    return Web3.utils.toBigInt(userId)
}
