/**
 * 检查是否已经评论过该内容
 * @param {Array} comments 评论列表
 * @param {String} userId 用户ID，如果不传则不检查用户ID
 * @returns {Boolean} 是否已评论过
 */
function isDupComment(comments, userId = null) {
  // 如果没有获取到评论列表或者评论列表为空，返回false
  if (!comments || !comments.length) {
    return false;
  }

  // 获取评论列表
  const commentList = comments.comments || [];
  if (!commentList || !commentList.length) {
    return false;
  }

  // 如果有用户ID，检查是否已经评论过
  if (userId) {
    return commentList.some(comment => comment.user_id === userId);
  }

  // 没有用户ID，通过cookie记录评论状态
  // 这种情况下默认返回false，表示没有评论过
  // 实际项目中可以使用更复杂的逻辑，如检查IP等
  return false;
}

module.exports = {
  isDupComment
};
