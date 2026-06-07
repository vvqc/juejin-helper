// 获取最新文章列表
const { insertTo, dbGet } = require('../utils/db')
const { getCookie } = require('./cookie')
const JuejinHttp = require('./api')

const COMMENTS_MAX_LENGTH = 10000
// 获取文章列表
// 300最新 200 为 默认
async function getArticleList(sort_type) {
  const cookie = await getCookie()
  const API = new JuejinHttp(cookie)
  const list = await API.getRecommendArticles(sort_type).catch((err) => {
    console.log(err)
  })
  const feedList = Array.isArray(list) ? list : Array.isArray(list?.data) ? list.data : []
  const articles = []
  feedList.forEach((v) => {
    if (v.item_type == 2 || v.article_info) {
      articles.push(v.item_info || v)
    }
  })
  return articles || []
}

// 2 为 文章， 4为沸点
async function saveComments(item_id, type = 2) {
  const dbKey = type == 2 ? '/comments/article' : '/comments/pin'
  const cookie = await getCookie()
  const API = new JuejinHttp(cookie)
  const commentItems = await API.getArticleComments(item_id, type).catch((err) => {
    console.log(err)
  })
  const commentList = Array.isArray(commentItems)
    ? commentItems
    : Array.isArray(commentItems?.comments)
      ? commentItems.comments
      : []
  const commentWords = commentList
    .map((v) => v.comment_info?.comment_content || v.comment_content)
    .filter(Boolean)
  const dbComments = await dbGet(dbKey)
  if (dbComments && dbComments.length >= COMMENTS_MAX_LENGTH) return
  for (const item of commentWords) {
    // 获取当前文章的评论并存到文件
    if (!dbComments || !dbComments.includes(item)) {
      await insertTo(`${dbKey}[]`, item)
    }
  }
}

module.exports = {
  getArticleList,
  saveComments,
}
