/*
 * @Author: h7ml <h7ml@qq.com>
 * @Date: 2023-07-12 20:34:13
 * @LastEditors: h7ml <h7ml@qq.com>
 * @LastEditTime: 2023-07-12 22:36:12
 * @FilePath: \utils\chatCompletion.js
 * @Description:
 *
 * Copyright (c) 2023 by h7ml<h7ml@qq.com>, All Rights Reserved.
 */
const axios = require('axios')
const configEnv = require('../config')
const chatCompletion = async (content) => {
  const defaultCompletion = ''
  return new Promise(async (resolve) => {
    try {
      const data = JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: content
          }
        ],
        temperature: 0.7
      })

      const config = {
        method: 'post',
        url:
          configEnv.chatgpt.BASE_URL ??
          'https://nakoruru.h7ml.cn/proxy/api.openai.com/v1/chat/completions',
        headers: {
          Authorization: `Bearer ${configEnv.chatgpt.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        data: data
      }

      const response = await axios(config)
      const completion = JSON.stringify(response.data.choices[0].message.content)
      resolve(completion)
    } catch (error) {
      console.log(error)
      resolve(defaultCompletion)
    }
  })
}

module.exports = {
  chatCompletion
}
