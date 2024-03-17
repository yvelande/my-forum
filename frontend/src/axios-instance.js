import axios from "axios"

// 设置后端 API 的基本 URL
const baseURL = "http://localhost:3000" // 或者后端部署的地址

// 创建 Axios 实例
const axiosInstance = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
})

export default axiosInstance
