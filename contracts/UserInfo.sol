// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract UserInfo {
    // 定义用户结构体
    struct User {
        address userAddress; // 用户钱包地址
        uint256 userId; // 用户ID
        string userName; // 用户名
        string pwd; // 密码
        string role; // 用户角色
        uint256 assert; // 用户资产
        // uint256 activeValue; // 活跃值
    }

    // 用户ID到用户结构体的映射
    mapping(uint256 => User) public userMap;

    // 已注册用户地址
    address[] public registeredUserAddresses;

    // // 委员会成员列表
    // uint256[] public commitMembers;

    // // 资产排名前20用户列表
    // address[] public topAssertListAddresses;

    // 添加用户函数
    function createUser(string memory _userName, string memory _pwd) public {
        // 生成用户ID（使用简单的伪随机数生成函数）
        uint256 _userId = uint256(
            keccak256(abi.encodePacked(block.timestamp, _userName))
        );
        address _userAddress = msg.sender;
        User memory newUser = User(
            _userAddress,
            _userId,
            _userName,
            _pwd,
            //普通用户roleID是“0”
            "0",
            0
        );
        userMap[_userId] = newUser;
        registeredUserAddresses.push(_userAddress);
    }

    // 用户登录函数
    function loginUser(
        uint256 _userId,
        string memory _pwd
    ) public view returns (bool) {
        return
            keccak256(abi.encodePacked(userMap[_userId].pwd)) ==
            keccak256(abi.encodePacked(_pwd));
    }

    // 查询用户信息函数
    function getUserInfo(uint256 _userId) public view returns (User memory) {
        return userMap[_userId];
    }

    // 更改用户角色函数
    function changeUserRole(uint256 _userId, string memory _role) public {
        userMap[_userId].role = _role;
    }
}
