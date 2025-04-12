// 沸点评论
const _ = require('lodash')
const { getCookie } = require('../cookie')
const JuejinHttp = require('../api')
const config = require('../../config')
const { isDupComment } = require('../../utils/isDupComment')
const { deepMerge } = require('../../utils')
const { getRandomInt } = require('../../utils')
const { chatCompletion } = require('../../utils/chatCompletion')

// 评论沸点
async function commentPin(task) {
  try {
    const cookie = await getCookie()
    const API = new JuejinHttp(cookie)
    const times = task.limit - task.done // 需要执行的次数

    console.log(`需要评论${times}篇沸点`)
    if (!config.chatgpt.OPENAI_API_KEY) {
      console.log(`未配置OPENAI_API_KEY,跳过评论沸点`)
      return
    }

    // 获取沸点
    const data = await API.getRecommendPins()
    const pinList = data.data
    if (pinList && pinList.length) {
      const commentCount = Math.min(times, pinList.length)
      let actualCommentCount = 0

      for (let i = 0; i < commentCount; i++) {
        try {
          const item = pinList[i]
          const msg_id = item.msg_id
          const content = item.msg_info.content || '前端面试题'

          // 检查是否已评论过
          const comments = await API.getArticleComments(msg_id, 4)
          const isDup = isDupComment(comments)
          if (isDup) {
            console.log(`沸点 ID:${msg_id} 已评论过，跳过`)
            continue
          }

          // 获取评论内容
          const result = await chatCompletion(content)
          const isDefaultContent = result.isDefaultContent || false;
          const completion = result.content || result; // 兼容旧版返回格式

          // 检查是否使用默认内容，如果是则跳过发布
          if (isDefaultContent) {
            console.warn(`沸点 ID:${msg_id} 评论使用了默认内容，跳过评论`);
            continue;
          }

          // 发表评论
          let commentContent = completion.substring(0, 100);
          if (commentContent.length < 10) {
            commentContent = `好内容，学习了！`;
          }

          await API.articleCommentAdd(msg_id, commentContent, 4)
          console.log(`评论沸点 ID:${msg_id} 成功`)
          actualCommentCount++

          // 随机等待1-3秒，避免操作过快
          await new Promise(resolve => setTimeout(resolve, _.random(1000, 3000)));
        } catch (err) {
          console.error(`评论沸点失败:`, err.message)
        }
      }
      console.log(`沸点评论完成，成功评论${actualCommentCount}篇沸点`)
    } else {
      console.log('获取沸点列表失败')
    }
  } catch (err) {
    console.error('评论沸点任务失败:', err.message)
  }
}

module.exports = commentPin
