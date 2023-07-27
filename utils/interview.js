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

async function getInterview(type = 'beforetoday', all = false) {
  const page = _.random(1, 1085)

  const regex = /第\d+天/g

  const response = await fetch(
    `https://api.github.com/repos/haizlin/fe-interview/issues?page=${page}&per_page=5`,
  )
  const data = await response.json()
  data.forEach((datum) => {
    datum.body = datum.body.split('[3+1官网]')[0].replace(regex, '')
    datum.title = _.tail(_.split(datum.title.replace(regex, ''), '] ')).join('')
  })

  return all ? data : _.sample(data).title
}

module.exports = {
  getInterview,
  types,
}
