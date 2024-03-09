// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./UserInfo.sol";
import "./ContentInfo.sol";

contract ManagementInfo {
    UserInfo public userInfo;
    ContentInfo public contentInfo;

    constructor(address _userInfoAddress, address _contentInfoAddress) {
        userInfo = UserInfo(_userInfoAddress);
        contentInfo = ContentInfo(_contentInfoAddress);
    }
}
