// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./UserInfo.sol";
import "./ContentInfo.sol";
import "./TokenERC20.sol";

contract ManageInfo {
    UserInfo public userInfo;
    ContentInfo public contentInfo;
    TokenERC20 public tokenInfo;

    // 委员会成员投票结构体
    struct Vote {
        uint256 voter; // 投票者地址
        uint256 complaintId; // 投诉的ID
        uint256 inSupport; // 是否支持投诉 "1"是支持 "0"是不支持"
    }
    //委员会成员
    uint256[] commitMember;
    // 投票数组
    mapping(uint256 => Vote[]) complainVotesMap;

    constructor(
        address _userInfoAddress,
        address _contentInfoAddress,
        address _tokenInfoAddress
    ) {
        userInfo = UserInfo(_userInfoAddress);
        contentInfo = ContentInfo(_contentInfoAddress);
        tokenInfo = TokenERC20(_tokenInfoAddress);
    }

    function getTopAssetUsers(uint256 count) public returns (uint256[] memory) {
        uint256[] memory registeredUserId = userInfo.getRegisteredUserId();
        uint256[] memory assetAmounts = new uint256[](registeredUserId.length);

        for (uint256 i = 0; i < registeredUserId.length; i++) {
            assetAmounts[i] = tokenInfo.getBalance(
                userInfo.getUserInfo(registeredUserId[i]).userAddress
            );
        }

        // 使用大顶堆找到前11名用户
        uint256[] memory topUsers = new uint256[](count);
        uint256[] memory topAssets = new uint256[](count);

        // 建立大顶堆
        for (uint256 i = 0; i < count && i < registeredUserId.length; i++) {
            topUsers[i] = registeredUserId[i];
            topAssets[i] = assetAmounts[i];
            heapify(topAssets, topUsers, i);
        }

        // 继续迭代剩余的用户
        for (uint256 i = count; i < registeredUserId.length; i++) {
            if (assetAmounts[i] > topAssets[0]) {
                topAssets[0] = assetAmounts[i];
                topUsers[0] = registeredUserId[i];
                heapify(topAssets, topUsers, 0);
            }
        }

        return topUsers;
    }

    // 用于调整堆
    function heapify(
        uint256[] memory assets,
        uint256[] memory users,
        uint256 root
    ) internal {
        uint256 largest = root;
        uint256 left = 2 * root + 1;
        uint256 right = 2 * root + 2;

        if (left < assets.length && assets[left] > assets[largest]) {
            largest = left;
        }

        if (right < assets.length && assets[right] > assets[largest]) {
            largest = right;
        }

        if (largest != root) {
            (assets[root], assets[largest]) = (assets[largest], assets[root]);
            (users[root], users[largest]) = (users[largest], users[root]);
            heapify(assets, users, largest);
        }
    }

    function getCommitMembers() public returns (string[] memory) {
        uint256[] memory topAssetUsers = getTopAssetUsers(3);
        string[] memory ret = new string[](3);
        // uint256[] memory registeredUser = userInfo.getRegisteredUserId();

        // // 随机抽取9位用户
        // uint256[] memory randomUsers = getRandomIds(registeredUser);

        // 将资产排名前11的用户和随机抽取的9位用户的 userRole 改为委员会成员
        for (uint256 i = 0; i < topAssetUsers.length; i++) {
            userInfo.changeUserRole(topAssetUsers[i], "1");
            ret[i] = uint256ToString(topAssetUsers[i]);
        }
        // for (uint256 i = 0; i < randomUsers.length; i++) {
        //     userInfo.changeUserRole(randomUsers[i], "Committee Member");
        // }
        commitMember = topAssetUsers;
        // 返回委员会成员
        return ret;
    }

    function returnCommitMembers() public view returns (string[] memory) {
        string[] memory ret = new string[](3);
        // uint256[] memory registeredUser = userInfo.getRegisteredUserId();

        // // 随机抽取9位用户
        // uint256[] memory randomUsers = getRandomIds(registeredUser);

        // 将资产排名前11的用户和随机抽取的9位用户的 userRole 改为委员会成员
        for (uint256 i = 0; i < commitMember.length; i++) {
            ret[i] = uint256ToString(commitMember[i]);
        }
        // for (uint256 i = 0; i < randomUsers.length; i++) {
        //     userInfo.changeUserRole(randomUsers[i], "Committee Member");
        // }
        return ret;
    }

    // 辅助函数：从注册用户中随机抽取不重复的九个地址
    function getRandomIds(
        uint256[] memory registeredUserAddresses
    ) internal view returns (uint256[] memory) {
        require(
            registeredUserAddresses.length >= 9,
            "Insufficient registered users"
        );

        uint256[] memory randomAddresses = new uint256[](9);
        bool[] memory selectedIndices = new bool[](
            registeredUserAddresses.length
        );
        uint256 remainingUsers = registeredUserAddresses.length;
        uint256 remainingSelections = 9;

        // 使用伪随机数生成器选择随机用户地址
        while (remainingSelections > 0) {
            uint256 randomIndex = uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.difficulty,
                        block.number
                    )
                )
            ) % remainingUsers;

            // 如果选择的索引没有被选中过，则将其添加到随机地址数组中，并标记为已选中
            if (!selectedIndices[randomIndex]) {
                randomAddresses[
                    9 - remainingSelections
                ] = registeredUserAddresses[randomIndex];
                selectedIndices[randomIndex] = true;
                remainingSelections--;
            }

            // 将已选中的地址移至末尾，避免重复选择
            if (randomIndex != remainingUsers - 1) {
                registeredUserAddresses[randomIndex] = registeredUserAddresses[
                    remainingUsers - 1
                ];
            }

            // 缩小可选范围
            remainingUsers--;
        }

        return randomAddresses;
    }

    function isCommitteeMember(uint256 userId) public view returns (bool) {
        for (uint256 i = 0; i < commitMember.length; i++) {
            if (commitMember[i] == userId) return true;
        }
        return false;
    }

    // 进行投票
    function makeVote(
        uint256 userId,
        uint256 complainId,
        uint256 isVote
    ) public {
        // // 检查是否为委员会成员
        // require(
        //        isCommitteeMember(userId),
        //     "Only committee members can vote"
        // );

        // 检查用户是否已经投过票
        // require(
        //     !hasVoted(userId, complainId),
        //     "You have already voted for this complaint"
        // );

        // 创建投票对象并添加到投票数组中
        Vote memory newVote = Vote({
            voter: userId,
            complaintId: complainId,
            inSupport: isVote
        });
        complainVotesMap[complainId].push(newVote);
    }

    // 删除文章
    function deleteContent(uint256 contentId) public {
        // 在 ContentInfo 合约中定义了删除文章的函数，可以调用相关函数来删除
        contentInfo.deleteContent(contentId);
    }

    // 删除评论
    function deleteComment(uint256 commentId) public {
        // 在 ContentInfo 合约中定义了删除评论的函数，可以调用相关函数来删除
        contentInfo.deleteComment(commentId);
    }

    // 删除评论
    function deleteComplain(uint256 complainId) public {
        // 在 ContentInfo 合约中定义了删除评论的函数，可以调用相关函数来删除
        contentInfo.deleteComplain(complainId);
    }

    // 获取投票结果
    function getVoteResults(
        uint256 _complaintId
    ) public view returns (string memory) {
        uint256 supportCount = 0;
        uint256 oppositionCount = 0;
        Vote[] memory votes = complainVotesMap[_complaintId];
        for (uint256 i = 0; i < votes.length; i++) {
            if (votes[i].inSupport == 1) {
                supportCount++;
            } else {
                oppositionCount++;
            }
        }
        return uint256ToString(supportCount);
    }

    // 检查用户是否已经投过票
    function hasVoted(
        uint256 _voter,
        uint256 _complaintId
    ) internal view returns (bool) {
        Vote[] memory votes = complainVotesMap[_complaintId];
        for (uint256 i = 0; i < votes.length; i++) {
            if (votes[i].voter == _voter) {
                return true;
            }
        }
        return false;
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
