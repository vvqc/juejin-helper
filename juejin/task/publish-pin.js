const { getCookie } = require('../cookie')
const JuejinHttp = require('../api')
// const { getRandomSentence } = require('../../utils/jinrish
const { getInterview, types } = require('../../utils/interview')
const { chatCompletion } = require('../../utils/chatCompletion')
const configEnv = require('../../config')
// 发布沸点
async function pinPublish(task) {
  const cookie = await getCookie()
  const API = new JuejinHttp(cookie)
  const times = task.limit - task.done // 需要执行的次数
  console.log(`需要发布${times}篇沸点`)
  if (!configEnv.chatgpt.OPENAI_API_KEY) {
    console.log(`未配置OPENAI_API_KEY,跳过沸点发布`)
    return
  }
  try {
    for (let i = 0; i < times; i++) {
      const interviewType = types[i]
      const interview = await getInterview(interviewType)
      const completion = await chatCompletion('请用500字以内回复:' + '\n' + `${interview}`)
      console.log(
        '%c [ interview ]-19',
        'font-size:13px; background:pink; color:#bf2c9f;',
        interview,
      )
      if (interview && completion) {
        const words = `${interview}` + '\n' + ` ${completion} `
        console.log(`发布沸点：${words}`)
        const pinRes = await API.pinPublish(words)
        // 删除刚发布的沸点
        // if (config.user.privacy) await API.pinRemove(pinRes['msg_id']);
        console.log(`发布沸点 done`)
      } else console.log(`发布沸点失败`)
    }
  } catch (error) {
    console.log(error)
  }
  console.log(`发布沸点 done`)
}
module.exports = pinPublish
