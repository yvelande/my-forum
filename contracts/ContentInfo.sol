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
        string comment; // 评论内容
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

    struct ReturnComment {
        string contentId; // 文章id
        string userId; // 用户id
        string commentId; // 评论id
        string comment; // 评论内容
        string updateTime; // 更新时间
        string praiseCount; // 点赞数
        string commentState; // 评论状态
    }

    mapping(uint256 => Content) public contentMap;
    uint256[] public contentIds;
    mapping(uint256 => Comment) public commentMap;
    mapping(uint256 => Complain) public complainMap;
    mapping(uint256 => uint256[]) public contentComments; // 映射 contentId 到评论数组

    // event UserRegistered(string userId);
    event ContentCreated(uint256 contentId);
    event PraiseDone(uint256 praiseCount); //这是对帖子进行评论的内容
    event CommentCreated(uint256 commentId);
    event PraiseCommentDone(uint256 praiseCount);

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
        contentMap[_contentId] = content;
        emit PraiseDone(content.praiseCount);
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
                allContent[index] = getContent(contentIds[i]);
                index++;
            }
        }
        return allContent;
    }

    //创建评论
    function createComment(
        uint256 _contentId,
        uint256 _userId,
        string memory _comment
    ) public {
        //记得最后开启
        // require(
        //     contentMap[_contentId].contentState == 1,
        //     "Content does not exist"
        // );

        // Generate comment ID
        uint256 _commentId = uint256(
            keccak256(abi.encodePacked(block.timestamp, _contentId, _userId))
        );

        // Create the comment struct
        Comment memory comment = Comment(
            _contentId,
            _userId,
            _commentId,
            _comment,
            block.timestamp,
            0, // Initial praise count is 0
            1 // Comment state is active
        );
        commentMap[_commentId] = comment;
        // // Update the content's comment count
        contentComments[_contentId].push(_commentId);
        // Trigger an event
        emit CommentCreated(_commentId);
    }

    // 更新评论
    function updateComment(uint256 _commentId, string memory _comment) public {
        // 确保评论存在
        // require(
        //     commentMap[_commentId].commentState == 1,
        //     "Comment does not exist"
        // );

        // 更新评论内容
        Comment memory comment = commentMap[_commentId];
        comment.comment = _comment;
        comment.updateTime = block.timestamp;
        commentMap[_commentId] = comment;
    }

    // 获取评论
    function getComment(
        uint256 _commentId
    ) public view returns (ReturnComment memory) {
        // 确保评论存在
        // require(
        //     commentMap[_commentId].commentState == 1,
        //     "Comment does not exist"
        // );
        Comment memory comment = commentMap[_commentId];
        ReturnComment memory returnComment = ReturnComment(
            uint256ToString(comment.contentId),
            uint256ToString(comment.userId),
            uint256ToString(comment.commentId),
            comment.comment,
            uint256ToString(comment.updateTime),
            uint256ToString(comment.praiseCount),
            uint256ToString(comment.commentState)
        );
        // 返回评论内容
        return returnComment;
    }

    // 删除评论
    function deleteComment(uint256 _commentId) public {
        // 确保评论存在
        // require(
        //     commentMap[_commentId].commentState == 1,
        //     "Comment does not exist"
        // );

        // 删除评论
        Comment memory commentDelete = commentMap[_commentId];
        commentDelete.commentState = 0;
        commentMap[_commentId] = commentDelete;
    }

    function getCommentsByContentId(
        uint256 _contentId
    ) public view returns (ReturnComment[] memory) {
        //contentId对应的评论的数组
        uint256[] memory commmentArray = contentComments[_contentId];
        uint256 count = commmentArray.length;
        uint256 existCount = 0;
        // 遍历所有评论，统计符合条件的评论数量
        for (uint256 i = 0; i < count; i++) {
            if (commentMap[commmentArray[i]].commentState == 1) {
                existCount++;
            }
        }
        // 创建一个数组用于存储符合条件的评论
        ReturnComment[] memory comments = new ReturnComment[](existCount);
        uint256 index = 0;
        // 遍历所有评论，将符合条件的评论存入数组
        for (uint256 i = 0; i < count; i++) {
            if (commentMap[commmentArray[i]].commentState == 1) {
                comments[index] = getComment(commmentArray[i]);
                index++;
            }
        }
        // 返回所有评论
        return comments;
    }

    function praiseComment(uint256 _commentId) public {
        // 确保评论存在
        // require(
        //     commentMap[_commentId].commentState == 1,
        //     "Comment does not exist"
        // );

        // 增加评论的赞数
        commentMap[_commentId].praiseCount++;
        // 触发事件
        emit PraiseCommentDone(commentMap[_commentId].praiseCount);
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
