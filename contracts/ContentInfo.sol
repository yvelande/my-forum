// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract ContentInfo {
    struct Content {
        uint256 contentId; // 文章id
        uint256 userId; // 用户id
        string title; // 标题
        string content; // 内容
        uint256 updateTime; // 更新时间
        uint256 praiseCount; // 点赞数
        uint256 contentState; //文章状态  1存在 0删除
    }

    struct Comment {
        uint256 contentId; // 文章ID
        uint256 userId; // 用户ID
        uint256 commentId; //评论ID
        string content; // 评论内容
        uint256 updateTime; // 评论发表时间
        uint256 praiseCount; // 赞的数
        uint256 commentState; // 评论状态  1存在 0删除
    }

    struct Complain {
        uint256 complaintId; // 投诉id
        uint256 contentId; // 文章ID
        uint256 userId; // 用户ID
        uint256 commentId; // 评论ID
        string content; // 评论内容
        uint256 updateTime; // 评论发表时间
        uint256 complainState; // 评论状态  1存在 0删除
    }

    struct ReturnContent {
        string contentId; // 文章id
        string userId; // 用户id
        string title; // 标题
        string content; // 内容
        string updateTime; // 更新时间
        string praiseCount; // 点赞数
        string contentState; //文章状态
    }

    mapping(uint256 => Content) public contentMap;
    uint256[] public contentIds;
    mapping(uint256 => Comment) public commentMap;
    mapping(uint256 => Complain) public complainMap;

    // event UserRegistered(string userId);
    event ContentCreated(uint256 contentId);

    function createContent(
        uint256 _userId,
        string memory _title,
        string memory _content
    ) public {
        uint256 _contentId = uint256(
            keccak256(abi.encodePacked(block.timestamp, _userId, _title))
        );
        contentMap[_contentId] = Content(
            _contentId,
            _userId,
            _title,
            _content,
            block.timestamp,
            0,
            1
        );
        contentIds.push(_contentId);
        emit ContentCreated(_contentId);
    }

    function getContent(
        uint256 _contentId
    ) public view returns (ReturnContent memory) {
        Content memory content = contentMap[_contentId];
        ReturnContent memory returnContent = ReturnContent(
            uint256ToString(content.contentId),
            uint256ToString(content.userId),
            content.title,
            content.content,
            uint256ToString(content.updateTime),
            uint256ToString(content.praiseCount),
            uint256ToString(content.contentState)
        );
        return returnContent;
    }

    function updateContent(
        uint256 _contentId,
        string memory _title,
        string memory _content
    ) public {
        Content memory contentOld = contentMap[_contentId];
        contentOld.title = _title;
        contentOld.content = _content;
        contentOld.updateTime = block.timestamp;
        contentMap[_contentId] = contentOld;
    }

    function deleteContent(uint256 _contentId) public {
        Content memory contentDelete = contentMap[_contentId];
        contentDelete.contentState = 0;
        contentMap[_contentId] = contentDelete;
    }

    function praiseContent(uint256 _contentId) public {
        Content memory content = contentMap[_contentId];
        content.praiseCount++;
    }

    function getAllContent() public view returns (ReturnContent[] memory) {
        uint256 count = contentIds.length;
        uint256 existCount = 0;
        for (uint256 i = 0; i < count; i++) {
            if (contentMap[contentIds[i]].contentState == 1) {
                existCount++;
            }
        }
        ReturnContent[] memory allContent = new ReturnContent[](existCount);
        uint256 index = 0;
        for (uint256 i = 0; i < count; i++) {
            if (contentMap[contentIds[i]].contentState == 1) {
                allContent[index] = getContent(i);
                index++;
            }
        }
        return allContent;
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
