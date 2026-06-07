// 沸点点赞
const { getCookie } = require('../cookie')
const JuejinHttp = require('../api')
const { saveComments } = require('../common')
const config = require('../../config')

function normalizePinList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

function getPinInfo(item) {
  return item?.msg_info || item?.msg_Info || item?.item_info?.msg_info || item?.item_info?.msg_Info || {}
}

async function pinDigg(task) {
  const cookie = await getCookie()
  const API = new JuejinHttp(cookie)
  const articles = normalizePinList(await API.getRecommendPins())
  const list = articles.filter((v) => v.user_interact && v.user_interact.is_digg === false)
  if (list.length == 0) {
    console.log(`获取沸点列表失败[f2]`)
    return false
  }
  const times = task.limit - task.done // 需要执行的次数
  console.log(`需要点赞${times}篇沸点`)
  let diggCount = 0
  for (let i = 0; i < times; i++) {
    const article = list[i] || list[0]
    const pinInfo = getPinInfo(article)
    const msg_id = article.msg_id || pinInfo.msg_id
    if (!msg_id) {
      console.log(`沸点信息缺少msg_id，跳过点赞`)
      continue
    }
    await saveComments(msg_id, 4)
    await API.diggSave(msg_id, 4)
    // 取消点赞
    if (!config.user.privacy) await API.diggCancel(msg_id, 4)
    diggCount++
  }
  console.log(`点赞沸点 done`)
  return diggCount > 0
}

module.exports = pinDigg
