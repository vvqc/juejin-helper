/*
 * @Author: h7ml <h7ml@qq.com>
 * @Date: 2023-07-12 20:08:33
 * @LastEditors: h7ml <h7ml@qq.com>
 * @LastEditTime: 2023-07-13 01:55:47
 * @FilePath: \utils\interview.js
 * @Description:
 *
 * Copyright (c) 2023 by h7ml<h7ml@qq.com>, All Rights Reserved.
 */
const _ = require('lodash')

const types = ['one', 'two', 'today', 'beforetoday', 'yestoday', 'week']
// 存储GitHub Issues数量的缓存，避免频繁请求
let issuesCountCache = {
  count: 0,
  timestamp: 0
};

async function getInterview(type = 'beforetoday', all = false) {
  const maxPage = 165; // 每页5条数据

  // 生成1到maxPage之间的随机页码
  const page = _.random(1, maxPage);
  console.log(`随机获取第${page}页面试题(总共${maxPage}页)`);

  const regex = /第\d+天/g

  // 增加重试次数和超时时间
  const maxRetries = 3
  const timeout = 30000 // 增加到30秒

  let retries = 0
  let lastError = null

  while (retries < maxRetries) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(
        // 使用不同的API端点，避免422错误
        // 尝试使用GitHub的Issues API，每个仓库的限制不同
        `https://api.github.com/repos/haizlin/fe-interview/issues?state=open&per_page=5&page=${page}`,
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'juejin-helper',
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      )

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log(`成功获取面试题，页码: ${page}/${maxPage}`)

      if (!data || data.length === 0) {
        throw new Error('获取面试题数据为空')
      }

      data.forEach((datum) => {
        datum.body = datum.body ? datum.body.split('[3+1官网]')[0].replace(regex, '') : ''
        datum.title = datum.title ? _.tail(_.split(datum.title.replace(regex, ''), '] ')).join('') : '前端面试题'
      })

      return all ? data : _.sample(data).title
    } catch (error) {
      lastError = error
      retries++
      console.log(`获取面试题失败，正在进行第 ${retries} 次重试...`)
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  console.error('获取面试题失败，已达到最大重试次数', lastError)
  // 返回一个默认面试题作为备选
  return all ? [
    { title: '如何提高前端应用的性能？', body: '讨论前端性能优化的各种方法' },
    { title: 'React Hooks 的优势和使用场景', body: '探讨React Hooks的各种使用场景和最佳实践' }
  ] : '如何提高前端应用的性能？'
}

module.exports = {
  getInterview,
  types,
}
