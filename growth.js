const JuejinHttp = require('./juejin/api')
const { getCookie } = require('./juejin/cookie')
const { handleTask } = require('./juejin/task')

const { sendEmail } = require(`./utils/email`)
const config = require('./config/index')

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function growth() {
  let errorMessages = []
  let successMessages = []
  let taskCompletedCount = 0
  let totalTaskCount = 0

  // 获取签到信息（如果已经执行过签到）
  const signInfo = global._signInfo || {};
  if (signInfo.errors && signInfo.errors.length) {
    errorMessages = errorMessages.concat(signInfo.errors.map(err => `[签到] ${err}`));
  }
  if (signInfo.successes && signInfo.successes.length) {
    successMessages = successMessages.concat(signInfo.successes.map(msg => `[签到] ${msg}`));
  }

  // 告诉sign.js不要单独发邮件
  process.env.SKIP_SIGN_EMAIL = 'true';

  try {
    const cookie = await getCookie()
    const API = new JuejinHttp(cookie)
    await sleep(3000)

    let taskList = {}
    try {
      taskList = await API.getTaskList()
    } catch (err) {
      const errorMessage = `获取任务列表失败: ${err.message}`
      errorMessages.push(errorMessage)
      console.error(errorMessage)

      // 发送合并的邮件
      await sendCombinedEmail(
        '【掘金】日常任务失败',
        '无法获取任务列表',
        successMessages,
        errorMessages,
        signInfo.username || '未知用户',
        signInfo.userId || '',
        signInfo.totalPoint || 0
      );

      return
    }

    const { today_jscore = 0, growth_tasks = {} } = taskList
    const data = Object.values(growth_tasks)

    // 计算总任务数
    for (const items of data) {
      for (const task of items) {
        if (task.limit > 0 && task.done < task.limit && ![4, 15, 16].includes(task.task_id)) {
          totalTaskCount++
        }
      }
    }

    if (totalTaskCount === 0) {
      console.log('没有需要执行的任务')

      // 如果没有任务但有签到信息，仍然发送邮件
      if (successMessages.length > 0 || errorMessages.length > 0) {
        await sendCombinedEmail(
          '【掘金】日常任务完成',
          '今日无需执行任务',
          successMessages,
          errorMessages,
          signInfo.username || '未知用户',
          signInfo.userId || '',
          signInfo.totalPoint || 0
        );
      }

      return
    }

    const taskSuccesses = []
    const taskErrors = []

    for (const items of data) {
      for (const task of items) {
        if (task.limit > 0 && task.done < task.limit && ![4, 15, 16].includes(task.task_id)) {
          console.log(`---开始任务：<${task.title}> ---`)
          try {
            await handleTask(task)
            taskCompletedCount++
            const taskSuccess = `任务《${task.title}》完成`;
            taskSuccesses.push(taskSuccess);
            successMessages.push(taskSuccess);
            console.log(`---任务：<${task.title}> 完成 (${taskCompletedCount}/${totalTaskCount})---`)
          } catch (err) {
            const errorMessage = `任务《${task.title}》执行失败: ${err.message}`
            taskErrors.push(errorMessage);
            errorMessages.push(errorMessage)
            console.error(errorMessage)
          }
        }
      }
    }

    // 获取最新的任务状态
    let finalTaskStatus = {}
    try {
      finalTaskStatus = await API.getTaskList()
    } catch (err) {
      console.error(`获取最终任务状态失败: ${err.message}`)
    }

    const jscoreMessage = `成长任务已完成${taskCompletedCount}/${totalTaskCount}, 今日掘友分+${finalTaskStatus.today_jscore || today_jscore}`;
    console.log(jscoreMessage)
    successMessages.push(jscoreMessage);

    // 更新矿石数量（如果签到信息没有提供）
    let totalPoint = signInfo.totalPoint;
    if (!totalPoint) {
      try {
        totalPoint = await API.queryTotalPoint();
      } catch (err) {
        console.error(`获取矿石数量失败: ${err.message}`);
      }
    }

    // 获取用户信息（如果签到信息没有提供）
    let username = signInfo.username;
    let userId = signInfo.userId;
    if (!username) {
      try {
        const userInfo = await API.queryUserProfile();
        if (userInfo && userInfo.user_name) {
          username = userInfo.user_name;
          userId = userInfo.user_id || '';
        }
      } catch (err) {
        console.error(`获取用户信息失败: ${err.message}`);
      }
    }

    // 发送合并邮件报告
    const hasErrors = errorMessages.length > 0;
    const emailSubject = hasErrors
      ? `【掘金】日常任务部分成功 (${taskCompletedCount}/${totalTaskCount})`
      : `【掘金】日常任务全部完成`;

    const statusMessage = hasErrors
      ? `日常任务部分完成，完成${taskCompletedCount}/${totalTaskCount}个任务`
      : `日常任务全部完成`;

    await sendCombinedEmail(
      emailSubject,
      statusMessage,
      successMessages,
      errorMessages,
      username || '未知用户',
      userId || '',
      totalPoint || 0
    );
  } catch (err) {
    const errorMessage = `成长任务整体执行失败: ${err.message}`
    errorMessages.push(errorMessage)
    console.error(errorMessage)

    await sendCombinedEmail(
      '【掘金】日常任务失败',
      '任务执行过程中发生错误',
      successMessages,
      errorMessages,
      signInfo.username || '未知用户',
      signInfo.userId || '',
      signInfo.totalPoint || 0
    );
  }
}

// 发送合并的邮件
async function sendCombinedEmail(subject, content, successes, errors, username, userId, points) {
  try {
    await sendEmail({
      to: config.user.email,
      subject: subject,
      data: {
        title: subject,
        content: content,
        successes: successes,
        errors: errors,
        accountInfo: {
          username: username,
          userId: userId,
          points: points
        }
      }
    });
    console.log(`发送合并邮件成功：${subject}`);
  } catch (err) {
    console.error('发送邮件失败:', err.message);
  }
}

// growth()

module.exports = {
  growth,
}
