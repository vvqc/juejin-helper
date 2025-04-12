const { getCookie } = require('../cookie')
const JuejinHttp = require('../api')
const { getInterview, types } = require('../../utils/interview')
const { chatCompletion } = require('../../utils/chatCompletion')
const configEnv = require('../../config')
const { getInterviewHot } = require('../../utils/interviewHot')
const _ = require('lodash')

// 发布沸点
async function pinPublish(task) {
  try {
    const cookie = await getCookie()
    if (!cookie) {
      throw new Error(`获取cookie失败`)
    }
    const API = new JuejinHttp(cookie)
    const interview = await getInterview().catch(() => getInterviewHot())
    if (!interview || !interview.length) {
      console.log(`获取面试题失败，跳过发沸点任务`)
      return
    }
    const times = task.limit - task.done // 需要执行的次数
    console.log(`需要发布${times}篇沸点`)
    if (!configEnv.chatgpt.OPENAI_API_KEY) {
      console.log(`未配置OPENAI_API_KEY,跳过沸点发布`)
      return
    }
    for (let i = 0; i < times; i++) {
      const result = await chatCompletion('请用500字以内回复:' + '\n' + `${interview}`)
      const isDefaultContent = result.isDefaultContent || false;
      const completion = result.content || result; // 兼容旧版返回格式

      // 检查是否使用默认内容，如果是则跳过发布
      if (isDefaultContent) {
        console.warn(`沸点内容使用了默认内容，跳过发布`);
        continue;
      }

      let words = `${interview}` + '\n' + ` ${completion} `
      let remainingWords = ''
      if (words.length > 1000) {
        console.log(`沸点内容超过1000字，截取前1000字`)
        remainingWords = words.slice(1000)
        words = words.slice(0, 1000)
      }
      console.log(`发布沸点：${words}`)
      const pinRes = await API.pinPublish(words)
      if (remainingWords) {
        console.log(`沸点文字超过1000字，将截取的部分发布到沸点：${remainingWords}`)
        await API.articleCommentAdd(pinRes.msg_id, remainingWords, 4)
      }
      // 删除刚发布的沸点
      // if (config.user.privacy) await API.pinRemove(pinRes['msg_id']);
      console.log(`发布沸点 done`)
    }
  } catch (error) {
    console.log('发沸点失败')
    console.log(error)
  }
  console.log(`发布沸点 done`)
}

module.exports = pinPublish
