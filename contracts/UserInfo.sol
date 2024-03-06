// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract UserInfo {
    // 定义用户结构体
    struct User {
        address userAddress; // 用户钱包地址
        string userId; // 用户ID
        string userName; // 用户名
        string pwd; // 密码
        string role; // 用户角色
        uint256 assert; // 用户资产
        // uint256 activeValue; // 活跃值
    }

    // 用户ID到用户结构体的映射
    mapping(string => User) public userMap;

    // 已注册用户地址
    address[] public registeredUserAddresses;

    event UserRegistered(string userId);

    // 添加用户函数
    function createUser(
        string memory _userName,
        string memory _pwd,
        address _userAddress //
    ) public {
        // 生成用户ID（使用简单的伪随机数生成函数）
        string memory _userId = "1";

        // 触发事件
        User memory newUser = User(
            _userAddress,
            _userId,
            _userName,
            _pwd,
            // 普通用户roleID是“0”
            "0",
            0
        );
        userMap[_userId] = newUser;
        registeredUserAddresses.push(_userAddress);
        emit UserRegistered(_userId);
    }

    // 用户登录函数
    function loginUser(
        string memory _userId,
        string memory _pwd
    ) public view returns (bool) {
        return
            keccak256(abi.encodePacked(userMap[_userId].pwd)) ==
            keccak256(abi.encodePacked(_pwd));
    }

    // 用户登录函数
    function getPwd(string memory _userId) public view returns (string memory) {
        return
            // keccak256(abi.encodePacked(userMap[_userId].pwd)) ==
            // keccak256(abi.encodePacked(_pwd));
            userMap[_userId].pwd;
    }

    // 查询用户信息函数
    function getUserInfo(
        string memory _userId
    ) public view returns (User memory) {
        return userMap[_userId];
    }

    // 更改用户角色函数
    function changeUserRole(string memory _userId, string memory _role) public {
        userMap[_userId].role = _role;
    }
}
