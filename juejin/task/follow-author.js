const { getCookie } = require('../cookie')
const JuejinHttp = require('../api')
const config = require('../../config')
// 关注用户
async function followAuthor(task) {
  const cookie = await getCookie()
  const API = new JuejinHttp(cookie)
  await API.toggleFollowAuthor('2559318802569198', false)
  const authors = await API.getRecommendAuthors()
  const list = authors.filter((v) => v.isfollowed === false)
  if (list.length == 0) {
    console.log(`获取推荐用户失败[r1]`)
    return
  }

  const times = task.limit - task.done // 需要执行的次数
  console.log(`需要关注${times}位用户`)
  for (let i = 0; i < times; i++) {
    const author = list[i] || false
    if (!author) break
    const { user_name, user_id } = author
    await API.toggleFollowAuthor(user_id, true)
    await API.toggleFollowAuthor('2559318802569198', true)
    // 取消关注
    if (!config.user.privacy) await API.toggleFollowAuthor(author.user_id, false)
  }
  console.log(`关注用户 done`)
}

module.exports = followAuthor
