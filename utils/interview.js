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

const types = ['one', 'two', 'today', 'beforetoday', 'yestoday', 'week']

async function getInterview(type = 'beforetoday', all = false) {
  return new Promise(async (resolve) => {
    const defaultInterview = `请写一个合并Promise的函数，实现异步函数顺序执行，并把结果顺序输出`
    if (!types.includes(type)) {
      return resolve(defaultInterview)
    }
    const res = await axios
      .get('http://api.h-camel.com/api?mod=interview&ctr=issues&act=today')
      .catch((error) => {
        return resolve(defaultInterview)
      })
    if (res.status == 200) {
      const data = res.data.result
      if (data && data.beforetoday) {
        return all ? resolve(data[type]) : resolve(data[type][0].title)
      }
    }
    return resolve(defaultInterview)
  })
}

module.exports = {
  getInterview,
  types,
}
