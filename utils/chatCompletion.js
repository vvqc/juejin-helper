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
        "model": "gpt-3.5-turbo",
        "messages": [
          {
            "role": "system",
            "content": "你是一名高级前端工程师。\n 请用500字以内回复: 返回文本格式，必要的时候添加代码解释和注释。代码也在总体的字数控制范围内"
          },
          {
            "role": "user",
            "content": "[软技能]  chatgpt对提升前端开发效率有什么帮助？\n 请用500字以内回复: 返回文本格式，必要的时候添加代码解释和注释。代码也在总体的字数控制范围内"
          },
          {
            "role": "assistant",
            "content": 'ChatGPT 是一种基于大规模预训练的自然语言处理模型，它可以在很多方面帮助提升前端开发效率。\n\n首先，ChatGPT 可以用于自动化生成文档和注释。在前端开发中，文档和注释是非常重要的，它们可以帮助团队成员理解代码的功能和使用方法。通过 ChatGPT，我们可以输入相关的问题，比如如何使用某个 API 或者如何实现某个功能，然后它可以生成相应的文档和注释，减少手动编写的工作量，提 高开发效率。\n\n其次，ChatGPT 可以用于代码片段的自动生成。前端开发中经常会使用一些重复性的代码，比如创建表单、发送网络请求等。通过 ChatGPT，我们可以输入相应的问题，比如如何创建一个表单或者如何发送一个POST请求，然后它可以生成相应的代码片段，减少手动编写的工作量，提高开发效率。\n\n另外，ChatGPT 还可以用于解决开发中的问题和疑惑。在前端开发过程中，我们经常会遇到一些问题和疑惑，比如某个功能为什么不起作用、如何解决某个错误等。通过 ChatGPT，我们可以输入相关的问题，然后它可以给出相应的解答和建议，帮助我们解决问题和疑惑，提高开发效率。\n\n最后，ChatGPT 还可以用于快速查找和获取开发相关的信息。在前端开发中，我们经常需要查找一些开发文档、API 文档、技术文章等。通过 ChatGPT，我们可以输入相应的问题，比如如何使用某个 API 或者 如何实现某个功能，然后它可以给出相应的链接和摘要，帮助我们快速查找和获取开发相关的信息，提高开发效率。\n\n综上所述，ChatGPT 在前端开发中可以帮助自动生成文档和注释、生成代码片段、解决问题和疑惑，以及快速查找和获取开发相关的信息，从而提高前端开发的效率。'
          },
          {
            "role": "user",
            "content": `请用500字以内回复: ${content}，\n  返回文本格式，必要的时候添加代码解释和注释,但是不要有任何的信息帮助之类的词汇总结。代码也在总体的字数控制范围内`
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
          Authorization: `Bearer ${configEnv.chatgpt.OPENAI_API_KEY}`,
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
