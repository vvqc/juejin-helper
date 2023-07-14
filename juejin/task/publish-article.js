/*
 * @Author: h7ml <h7ml@qq.com>
 * @Date: 2023-07-12 22:45:29
 * @LastEditors: h7ml <h7ml@qq.com>
 * @LastEditTime: 2023-07-13 08:43:55
 * @FilePath: \juejin\task\publish-article.js
 * @Description:
 *
 * Copyright (c) 2023 by h7ml<h7ml@qq.com>, All Rights Reserved.
 */
const _ = require('lodash')
const { getCookie } = require('../cookie')
const JuejinHttp = require('../api')
const { getInterview, types } = require('../../utils/interview')
const { chatCompletion } = require('../../utils/chatCompletion')
const { getBrowser } = require('../../puppeteer/browser')
const { getInterviewHot } = require('../../utils/interviewHot')
const { getCoverImage } = require('../../utils/coverImage')
const setPageCookie = async (page, cookie) => {
  const cookies = cookie.split(';').map((pair) => {
    const name = pair.trim().slice(0, pair.trim().indexOf('='))
    const value = pair.trim().slice(pair.trim().indexOf('=') + 1)
    return { name, value, domain: '.juejin.cn' }
  })
  await page.setCookie(...cookies)
}

const articlePublish = async (task) => {
  const randomElement = _.sample(types)
  const todayInterview = await getInterview(randomElement, (all = true))
  const hotInterview = await getInterviewHot()
  const interview = todayInterview ?? hotInterview // 容错处理。若请求当天问题失效，使用getInterviewHots
  const coverImage = await getCoverImage()
  const cookie = await getCookie()
  const API = new JuejinHttp(cookie)
  const times = task.limit - task.done //需要执行的次数
  console.log(`需要发布${times}篇文章`)
  let articles = []
  for (let i = 0; i < times; i++) {
    const interviewInfo = interview[i]
    const title = interviewInfo?.title
    console.log('%c [ title ]-40', 'font-size:13px; background:pink; color:#bf2c9f;', title)
    const query = interviewInfo?.body
      ? '请写一篇一千字的markdown格式文章  标题是:' +
        '\n' +
        `${interviewInfo.title}` +
        '\n' +
        `内容包含:${interviewInfo.body}`
      : '请写一篇一千字markdown格式的文章  标题是:' + '\n' + `${interviewInfo.title}`
    const content = await chatCompletion(query)
    console.log(
      `当前正在生成第${i + 1}篇文章\n 标题:${title}\n 文章长度:${content.length}\n  内容:${content}`
    )
    if (!content.length) {
      console.log(`文章长度为0,跳过文章发表`)
      return false
    }
    let brief_content = content.substr(0, 50) + '...'
    while (brief_content.length < 50) {
      brief_content += brief_content
    }
    articles.push({
      title,
      content,
      brief_content
    })
  }
  const browser = await getBrowser()
  const page = await browser.newPage()
  // 获取全屏窗口的大小
  const dimensions = await page.evaluate(() => {
    return {
      width: window.screen.width / 2,
      height: window.screen.height
    }
  })
  // 设置视口大小
  await page.setViewport(dimensions)

  for (let i = 0; i < times; i++) {
    let currentArticle = articles[i]
    let { title, brief_content, content } = currentArticle
    const articleInfo = await API.createArticle(title).catch((err) => {
      console.log(`发布失败`)
      console.log(err)
    })
    const article_id = articleInfo['id']
    await API.updateArticle(article_id, title, brief_content, content, coverImage).catch((err) => {
      console.log(`发布失败2`)
      console.log(err)
    })
    const cookie = await getCookie()
    await setPageCookie(page, cookie)
    // 去草稿箱点击模拟发布文章
    await page.goto(`https://juejin.cn/editor/drafts/${article_id}`)
    await page.waitForSelector('.xitu-btn')
    await page.click('.publish-popup')
    await page.waitForTimeout(2000)
    await page.click('.panel .footer .btn-container button:last-of-type')
    // await page.click("#juejin-web-editor > div.edit-draft > div > header > div.right-box > div.publish-popup.publish-popup.with-padding.active > div > div.footer > div > button.ui-btn.btn.primary.medium.default");

    // 监听发布成功
    const publishRes = await page.waitForResponse((response) =>
      response.url().includes(`https://api.juejin.cn/content_api/v1/article/publish`)
    )
    const publishResJson = await publishRes.json()
    if (publishResJson.err_no == 0) {
      const data = publishResJson.data
      // 删除刚刚发布的文章
      // ids.push(data.article_id)
      // await API.articleRemove(data.article_id || '')
    }
  }
  await page.close()
  console.log(`发布文章 done`)
}

module.exports = articlePublish
