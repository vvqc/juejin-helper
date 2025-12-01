// 文章评论
const _ = require('lodash')
const { getCookie } = require('../cookie')
const JuejinHttp = require('../api')
const { getArticleList, saveComments } = require('../common')
const { insertTo, dbGet } = require('../../utils/db')
const config = require('../../config')
const { chatCompletion } = require('../../utils/chatCompletion')
const { getRandomInt } = require('./../../utils/index')
const { deepMerge } = require('../../utils')
const { isDupComment } = require('../../utils/isDupComment')

async function articleComment(task) {
  try {
    const cookie = await getCookie()
    const API = new JuejinHttp(cookie)
    const times = task.limit - task.done // 需要执行的次数

    console.log(`需要评论${times}篇文章`)
    if (!config.chatgpt.OPENAI_API_KEY) {
      console.log(`未配置OPENAI_API_KEY,跳过评论文章`)
      return
    }
    // 获取文章
    const data = await API.getRecommendArticles()
    const articleList = (data && data.data) || []
    if (!Array.isArray(articleList) || !articleList.length) {
      console.log('获取文章失败或返回为空，跳过评论任务')
      return
    }

    const validArticleList = articleList.filter((item) => {
      return (
        item.item_type === 2 &&
        item.article_info &&
        item.article_info.audit_status === 2 &&
        item.article_info.verify_status !== 0
      )
    })
    // 评论文章
    if (validArticleList && validArticleList.length) {
      const commentCount = Math.min(times, validArticleList.length)
      let actualCommentCount = 0
      for (let i = 0; i < commentCount; i++) {
        const item = validArticleList[i]
        const article_id = item.article_id
        const title = item.article_info.title
        const brief_content = item.article_info.brief_content

        try {
          // 检查是否已评论过
          const comments = await API.getArticleComments(article_id)
          const isDup = isDupComment(comments)
          if (isDup) {
            console.log(`文章 ${title} 已评论过，跳过`)
            continue
          }

          // 获取评论内容
          const result = await chatCompletion(title + brief_content)
          const isDefaultContent = result.isDefaultContent || false;
          const completion = result.content || result; // 兼容旧版返回格式

          // 检查是否使用默认内容，如果是则跳过发布
          if (isDefaultContent) {
            console.warn(`文章《${title}》评论使用了默认内容，跳过评论`);
            continue;
          }

          // 发表评论
          let commentContent = completion.substring(0, 100);
          if (commentContent.length < 10) {
            commentContent = `好文章，学习了！`;
          }

          await API.articleCommentAdd(article_id, commentContent, 2)
          console.log(`评论文章《${title}》成功`)
          actualCommentCount++

          // 随机等待1-3秒，避免操作过快
          await new Promise(resolve => setTimeout(resolve, _.random(1000, 3000)));
        } catch (err) {
          console.error(`评论文章《${title}》失败:`, err.message)
        }
      }
      console.log(`文章评论完成，成功评论${actualCommentCount}篇文章`)
    } else {
      console.log('获取文章失败')
    }
  } catch (err) {
    console.error('评论文章任务失败:', err.message)
  }
}

module.exports = articleComment
