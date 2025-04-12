const { signIn } = require('./sign')
const { growth } = require('./growth')
const { closeBrowser } = require('./puppeteer/index')

  ; (async () => {
    console.log('========== 掘金助手开始运行 ==========')
    console.log('开始执行签到任务...')
    // 执行签到并获取签到结果
    const signInfo = await signIn()

    // 执行成长任务
    if (!process.env.NOT_GROWTH) {
      console.log('\n开始执行成长任务...')
      await growth()
    } else {
      console.log('\n已跳过成长任务执行')

      // 如果跳过成长任务但签到信息尚未发送邮件，需要单独发送签到邮件
      if (signInfo && !signInfo.emailSent) {
        console.log('单独发送签到邮件...')
        // sign.js中会自行处理邮件发送
      }
    }

    // 关闭浏览器
    await closeBrowser()
    console.log('========== 掘金助手执行完毕 ==========')
  })()
