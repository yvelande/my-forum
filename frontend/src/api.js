import axiosInstance from "./axios-instance"

export const registerUser = async (userName, pwd, userAddress) => {
    try {
        const response = await axiosInstance.post("/register", {
            userName: userName,
            pwd: pwd,
            userAddress: userAddress,
        })
        return response.data
    } catch (error) {
        throw error
    }
}

// 其他请求方法类似，根据后端路由的定义来调用相应的 API
