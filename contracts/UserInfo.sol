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
        uint256 userState; //用户状态 1存在 0删除
    }

    struct ReturnUser {
        address userAddress; // 用户钱包地址
        string userId; // 用户ID
        string userName; // 用户名
        string pwd; // 密码
        string role; // 用户角色
        string assert; // 用户资产
        string userState; //用户状态
    }
    // 用户ID到用户结构体的映射
    mapping(uint256 => User) public userMap;
    // event UserRegistered(string userId);
    event UserRegistered(uint256 userId);

    // 已注册用
    uint256[] registeredUserId;

    // 添加用户函数
    function createUser(
        string memory _userName,
        string memory _pwd,
        address _userAddress //
    ) public {
        // 生成用户ID（使用简单的伪随机数生成函数）
        uint _userId = uint256(
            keccak256(abi.encodePacked(block.timestamp, _userName))
        );
        // string memory _userId = uint256ToString(userId);
        // 触发事件
        User memory newUser = User(
            _userAddress,
            _userId,
            _userName,
            _pwd,
            // 普通用户roleID是“0”
            "0",
            0,
            1
        );
        userMap[_userId] = newUser;
        registeredUserId.push(_userId);
        emit UserRegistered(_userId);
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
    function getUserInfo(
        uint256 _userId
    ) public view returns (ReturnUser memory) {
        User memory user = userMap[_userId];
        ReturnUser memory returnUser = ReturnUser(
            user.userAddress,
            uint256ToString(user.userId),
            user.userName,
            user.pwd,
            user.role,
            uint256ToString(user.assert),
            uint256ToString(user.userState)
        );
        return returnUser;
    }

    // 更改用户角色函数
    function changeUserRole(uint256 _userId, string memory _role) public {
        userMap[_userId].role = _role;
    }

    function updateUserInfo(
        address userAddress, // 用户钱包地址
        uint256 userId, // 用户ID
        string memory userName, // 用户名
        string memory pwd, // 密码
        string memory role,
        uint256 assertUpdate
    ) public {
        User memory newUser = User(
            userAddress,
            userId,
            userName,
            pwd,
            // 普通用户roleID是“0”
            role,
            assertUpdate,
            userMap[userId].userState
        );
        userMap[userId] = newUser;
    }

    function getRegisteredUserId() public view returns (uint256[] memory) {
        return registeredUserId;
    }

    // 将 uint256 类型转换为字符串
    function uint256ToString(
        uint256 value
    ) public pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + (value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
