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
const _ = require('lodash')
const configEnv = require('../config')
const chatCompletion = async (content) => {
  const defaultCompletion = ''
  return new Promise(async (resolve) => {
    try {
      const data = JSON.stringify({
        "model": "gpt-3.5-turbo",
        "messages": [
          {
            "role": "system",
            "content": "你是一名高级前端工程师。作为全栈Web开发人员，您的角色包括设计、开发和支持前端和后端Web应用程序。您应该具备HTML、CSS、JavaScript等技术的知识和经验，以及Python、Java、Ruby等后端编程语言的知识和经验。您还应该具备使用React、Angular、Vue.js、Express、Django、Next.js、Flask或Ruby on Rails等Web框架的经验。同时，具备数据库、应用架构、安全性、性能最佳实践、调试、故障排除和自动化测试的经验也非常重要。与其他开发人员、设计师和利益相关者合作对于创建用户友好的Web应用程序至关重要。\n 请用500字以内回复: 返回文本格式，必要的时候添加代码解释和注释。代码也在总体的字数控制范围内"
          },
          {
            "role": "user",
            "content": "两个相邻的inline-block元素为什么会出现间隔，如何解决？\n 请用500字以内回复: 返回文本格式，必要的时候添加代码解释和注释。代码也在总体的字数控制范围内"
          },
          {
            "role": "assistant",
            "content": '两个相邻的inline-block元素之间出现间隔是因为它们之间存在空白字符，如空格、换行符或制表符。这些空白字符会被浏览器解释为实际的空白，从而在元素之间生成间隔。\n解决这个问题的方法有以下几种：\n1. ** 删除空白字符 **：\n将两个inline- block元素之间的空白字符删除，可以直接写在一行上：\n```html\n<div style="display: inline-block;"> 元素1</div> <div style="display: inline-block;">元素2</div>\n```\n2. ** 使用HTML注释 **：\n在两个元素之间使用HTML注释来去除空白字符：\n```html\n<div style="display: inline-block;"> 元素1</div>< !--\n--> <div style="display: inline-block;">元素2</div>\n```\n3. ** 设置父元素的字体大小为零 **：\n将父元素的`font - size`设置为0，然后在子元素中重置字体大小：\n```html\n<div style="font-size: 0;">\n<div style="display: inline-block; font-size: 16px;"> 元素1</div>\n<div style="display: inline-block; font-size: 16px;"> 元素2</div>\n</div>\n```\n4. ** 使用负边距 **：\n为第二个元素设置负的左边距（通常不推荐，因为可读性差）：\n```html\n<div style="display: inline-block;"> 元素1</div>\n<div style="display: inline-block;margin-left: -4px;"> 元素2</div>\n```\n5. ** 浮动元素 **：\n使用浮动来避免间隔（需清除浮动）：\n```html\n<div style="float: left;"> 元素1</div>\n<div style="float: left;"> 元素2</div>\n<div style="clear: both;"></div>\n```\n6. ** 使用Flexbox或Grid布局 **：\n使用现代布局模型，如Flexbox或Grid，可以避免这种问题：\n```html\n<div style="display: flex;">\n<div > 元素1</div>\n<div > 元素2</div>\n</div>\n```\n通过这些方法，可以有效地消除inline - block元素之间的间隔，确保布局的紧凑性和一致性。选择哪种方法取决于具体的需求和代码风格。'
          },
          {
            "role": "user",
            "content": `请用500字以内回复: ${content}，\n  返回文本格式，必要的时候添加代码解释和注释, 但是不要有任何的信息帮助之类的词汇总结。代码也在总体的字数控制范围内`
          }
        ],
        "temperature": 0.7
      })

      const config = {
        method: 'post',
        url:
          configEnv.chatgpt.BASE_URL ??
          'https://nakoruru.h7ml.cn/proxy/api.openai.com/v1/chat/completions',
        headers: {
          Authorization: `Bearer ${configEnv.chatgpt.OPENAI_API_KEY} `,
          'Content-Type': 'application/json',
        },
        data: data,
      }

      const response = await axios(config)
      const completion = JSON.stringify(response.data.choices[0].message.content)
      resolve(completion.replace(/\\n/g, '\n'))
    } catch (error) {
      console.log(error)
      resolve(defaultCompletion)
    }
  })
}

module.exports = {
  chatCompletion
}
