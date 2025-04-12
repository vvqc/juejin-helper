const JuejinHttp = require('./juejin/api')
const config = require('./config/index')
const { getCookie } = require('./juejin/cookie')

const { sendEmail } = require(`./utils/email`)
async function signIn() {
  try {
    const cookie = await getCookie()
    if (!cookie) {
      throw new Error(`获取cookie失败`)
    }
    const API = new JuejinHttp(cookie)
    const isCheckIn = await API.queryTodayStatus()
    const userInfo = await API.queryUserProfile()
    let username = '未知用户'
    let userId = ''

    if (userInfo && userInfo.user_name) {
      const { user_name, user_id } = userInfo
      userId = user_id || ''
      username = user_name
      const userNameLength = user_name.length
      const startIndex = Math.floor(userNameLength / 3)
      const endIndex = Math.ceil((2 * userNameLength) / 3)
      const encryptedUserName =
        user_name.slice(0, startIndex) +
        '*'.repeat(endIndex - startIndex) +
        user_name.slice(endIndex)
      console.log('当前登录用户:', encryptedUserName)
    }

    // 记录成功和错误信息
    const successes = []
    const errors = []
    let totalPoint = 0
    let lotteryName = ''

    if (isCheckIn) {
      console.log(`今日已签到`)
      successes.push('今日已完成签到')
    } else {
      await API.handleCheckIn()
      console.log(`签到成功`)
      successes.push('签到成功')
    }

    try {
      // 添加错误处理，防止API返回undefined
      const lotteryConfig = await API.queryLotteryConfig()
      const free_count = lotteryConfig?.free_count || 0

      if (!free_count) {
        console.log(`今日已免费抽奖`)
        successes.push('今日已完成免费抽奖')
      } else {
        try {
          const { lotteries } = await API.queryLuckyList() || { lotteries: [] }
          const luckyId = lotteries && lotteries[0] ? lotteries[0].history_id : 0

          try {
            const dipResult = await API.handleDipLucky(luckyId) || {}
            const { has_dip, dip_action, total_value } = dipResult

            if (has_dip) {
              console.log(`今日已沾过喜气`)
              successes.push('今日已沾过喜气')
            }
            if (dip_action === 1) {
              console.log(`沾喜气成功`)
              successes.push('沾喜气成功')
            }
            if (total_value) {
              console.log(`当前喜气值：${total_value}`)
              successes.push(`当前喜气值：${total_value}`)
            }
          } catch (dipErr) {
            console.log('沾喜气失败:', dipErr.message)
            errors.push(`沾喜气失败: ${dipErr.message}`)
          }

          try {
            const lotteryResult = await API.handleLotteryDraw()
            if (lotteryResult && lotteryResult.lottery_name) {
              lotteryName = lotteryResult.lottery_name
              console.log(`抽奖成功：${lotteryName}`)
              successes.push(`抽奖成功：${lotteryName}`)
            }
          } catch (lotteryErr) {
            console.log('抽奖失败:', lotteryErr.message)
            errors.push(`抽奖失败: ${lotteryErr.message}`)
          }
        } catch (luckyErr) {
          console.log('获取幸运列表失败:', luckyErr.message)
          errors.push(`获取幸运列表失败: ${luckyErr.message}`)
        }
      }
    } catch (configErr) {
      console.log('获取抽奖配置失败:', configErr.message)
      errors.push(`获取抽奖配置失败: ${configErr.message}`)
    }

    try {
      totalPoint = await API.queryTotalPoint()
      console.log(`当前矿石：${totalPoint}`)
      successes.push(`当前矿石数量：${totalPoint}`)
    } catch (pointErr) {
      console.log('获取矿石数量失败:', pointErr.message)
      errors.push(`获取矿石数量失败: ${pointErr.message}`)
    }

    console.log(`签到流程完成`)

    // 在全局对象上设置签到信息，便于其他模块使用
    global._signInfo = {
      username,
      userId,
      totalPoint,
      successes,
      errors,
      emailSent: false
    };

    // 如果不存在growth.js任务（单独运行sign.js时），则发送邮件
    if (!process.env.SKIP_SIGN_EMAIL) {
      await sendEmail({
        to: config.user.email,
        subject: '【掘金】签到' + (errors.length > 0 ? '部分成功' : '成功'),
        data: {
          title: '掘金签到通知',
          content: '您的掘金签到任务已' + (errors.length > 0 ? '部分' : '') + '完成',
          successes,
          errors,
          accountInfo: {
            username,
            userId,
            points: totalPoint
          }
        }
      });
      global._signInfo.emailSent = true;
    }

    return global._signInfo;
  } catch (err) {
    console.log(`签到失败`)
    console.log(err)

    const signInfo = {
      username: '未知用户',
      errors: [err.message],
      emailSent: false
    };

    global._signInfo = signInfo;

    // 如果不存在growth.js任务（单独运行sign.js时），则发送邮件
    if (!process.env.SKIP_SIGN_EMAIL) {
      await sendEmail({
        to: config.user.email,
        subject: '【掘金】签到失败',
        data: {
          title: '掘金签到失败',
          content: '签到过程中发生错误',
          errors: [err.message],
          accountInfo: {
            username: signInfo.username
          }
        }
      });
      global._signInfo.emailSent = true;
    }

    return signInfo;
  }
}

module.exports = {
  signIn,
}
