const { create } = require("ipfs-http-client/dist/index.cjs")

// 创建一个IPFS客户端实例
const ipfs = create()

// 存储字符串内容到IPFS
async function storeContent(content) {
    try {
        // 将内容添加到IPFS，并获取内容的CID
        const result = await ipfs.add(content)

        // 返回存储内容的CID
        return result.cid.toString()
    } catch (error) {
        console.error("Error storing content to IPFS:", error)
        throw error
    }
}

// 示例用法
async function main() {
    const content = "Hello, IPFS!"
    const cid = await storeContent(content)
    console.log("Content stored to IPFS with CID:", cid)
}

main()
