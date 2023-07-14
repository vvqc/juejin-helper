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
const axios = require('axios')
const _ = require('lodash')

const types = ['one', 'two', 'today', 'beforetoday', 'yestoday', 'week']

async function getInterview(type = 'beforetoday', all = false) {
  const issues = []
  let page = 1
  let hasNextPage = true

  while (hasNextPage) {
    const response = await fetch(
      `https://api.github.com/repos/haizlin/fe-interview/issues?page=${page}&per_page=100`,
    )
    const data = await response.json()
    console.log('%c [ data ]-26', 'font-size:13px; background:pink; color:#bf2c9f;', data)

    if (data.length === 0) {
      // 当返回的数据为空时，表示已经获取完所有的问题，退出循环
      hasNextPage = false
    } else {
      issues.push(...data)
      page++
    }
  }

  const formattedIssues = _.map(issues, (issue) => ({
    title: issue.title,
    url: issue.html_url,
    number: issue.number,
    body: issue.title.split('题：')[1] ?? issue.title,
  }))
  return formattedIssues
}

module.exports = {
  getInterview,
  types,
}
