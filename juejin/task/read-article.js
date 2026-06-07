const { getCookie } = require('../cookie')
const JuejinHttp = require('../api')
const { getArticleList } = require('../common')
// 阅读文章
async function readArticle(task) {
  const cookie = await getCookie()
  const API = new JuejinHttp(cookie)
  const articles = await getArticleList()
  const times = task.limit - task.done // 需要执行的次数
  console.log(`需要阅读${times}篇文章`)
  if (!Array.isArray(articles) || articles.length < times) {
    console.log(`获取文章列表失败或数量不足`)
    return false
  }
  for (let i = 0; i < times; i++) {
    const article = articles[i]
    console.log(`阅读文章《${article.article_info.title}》`)
    await API.growthPointReport(article.article_id)
  }
  console.log('阅读文章 done')
  return true
}

module.exports = readArticle
