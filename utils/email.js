const nodemailer = require('nodemailer')
const config = require('../config')

/**
 * 格式化邮件内容，支持HTML格式化
 * @param {Object} data 邮件数据
 * @returns {String} HTML格式的邮件内容
 */
function formatHTMLEmail(data) {
  const { title, content, errors, successes, accountInfo } = data;

  // 账号信息处理
  const accountBlock = accountInfo ? `
    <div style="margin-bottom: 20px; padding: 16px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <h3 style="margin-top: 0; color: #333333; font-weight: 500; font-size: 16px;">账号信息</h3>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; align-items: center;">
          <span style="min-width: 70px; color: #666666; font-size: 14px;">用户名</span>
          <span style="font-weight: 500; color: #333333; font-size: 14px;">${accountInfo.username || '未知'}</span>
        </div>
        <div style="display: flex; align-items: center;">
          <span style="min-width: 70px; color: #666666; font-size: 14px;">ID</span>
          <span style="font-weight: 500; color: #333333; font-size: 14px;">${accountInfo.userId || '未知'}</span>
        </div>
        ${accountInfo.level ? `
        <div style="display: flex; align-items: center;">
          <span style="min-width: 70px; color: #666666; font-size: 14px;">等级</span>
          <span style="font-weight: 500; color: #333333; font-size: 14px;">${accountInfo.level}</span>
        </div>` : ''}
        ${accountInfo.points ? `
        <div style="display: flex; align-items: center;">
          <span style="min-width: 70px; color: #666666; font-size: 14px;">矿石</span>
          <span style="font-weight: 500; color: #333333; font-size: 14px;">${accountInfo.points}</span>
        </div>` : ''}
      </div>
    </div>
  ` : '';

  // 成功信息处理
  const successBlock = successes && successes.length ? `
    <div style="margin-bottom: 20px; padding: 16px; background-color: #f0f9eb; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <h3 style="margin-top: 0; color: #67c23a; font-weight: 500; font-size: 16px;">成功信息</h3>
      <ul style="margin: 12px 0 0; padding-left: 16px; color: #606266; font-size: 14px;">
        ${successes.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  // 错误信息处理
  const errorBlock = errors && errors.length ? `
    <div style="margin-bottom: 20px; padding: 16px; background-color: #fef0f0; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <h3 style="margin-top: 0; color: #f56c6c; font-weight: 500; font-size: 16px;">错误信息</h3>
      <ul style="margin: 12px 0 0; padding-left: 16px; color: #606266; font-size: 14px;">
        ${errors.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  // 主体内容处理
  const contentBlock = content ? `
    <div style="margin-bottom: 20px; padding: 16px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">${content}</p>
    </div>
  ` : '';

  // 组装HTML
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title || '掘金助手通知'}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f7f8fa; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- 标题区域 -->
        <div style="text-align: center; margin-bottom: 24px; padding: 24px 0; background: linear-gradient(120deg, #FF9800, #FF5722); border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <h2 style="color: #ffffff; margin: 0; font-weight: 500; font-size: 22px;">${title || '掘金助手通知'}</h2>
          <p style="color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 14px;">
            ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <!-- 内容区域 -->
        <div style="background-color: #f7f8fa; border-radius: 12px; overflow: hidden;">
          ${accountBlock}
          ${successBlock}
          ${errorBlock}
          ${contentBlock}
        </div>

        <!-- 页脚区域 -->
        <div style="margin-top: 24px; padding: 16px; border-top: 1px solid #e8e8e8; text-align: center;">
          <p style="color: #999999; font-size: 13px; margin: 0 0 8px 0;">此邮件由掘金助手自动发送，无需回复</p>
          <p style="color: #999999; font-size: 12px; margin: 0;">祝您学习进步，天天开心 ❤️</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
}

/**
 * 发送邮件
 * @param {Object} params 邮件参数
 * @returns {Promise}
 */
async function sendEmail(params) {
  if (!config.email.provider.auth.user || !config.email.provider) {
    console.log(`未配置邮箱信息`)
    return
  }

  if (!params || typeof params !== 'object' || !params.to || !params.subject) {
    console.log(`邮箱配置参数错误`)
    return
  }

  try {
    const transporter = nodemailer.createTransport(config.email.provider)

    // 处理内容格式化
    let messageParams = {
      ...params,
      from: config.email.provider.auth.user,
    };

    // 如果提供了格式化数据，生成HTML邮件
    if (params.data) {
      const htmlContent = formatHTMLEmail({
        title: params.subject,
        ...params.data
      });

      messageParams.html = htmlContent;

      // 同时提供纯文本版本防止兼容性问题
      if (!messageParams.text) {
        let textContent = params.data.content || '';

        if (params.data.accountInfo) {
          textContent += `\n\n账号信息:\n用户: ${params.data.accountInfo.username || '未知'}\n`;
        }

        if (params.data.successes && params.data.successes.length) {
          textContent += `\n\n成功信息:\n${params.data.successes.join('\n')}\n`;
        }

        if (params.data.errors && params.data.errors.length) {
          textContent += `\n\n错误信息:\n${params.data.errors.join('\n')}\n`;
        }

        messageParams.text = textContent;
      }
    }

    // 发送邮件
    const info = await transporter.sendMail(messageParams)
    console.log(`邮件发送成功: ${params.subject}, messageId: ${info.messageId}`)
    return true
  } catch (err) {
    console.error(`邮件发送失败:`, err.message)
    if (err.response) {
      console.error(`邮件服务器响应: ${err.response}`)
    }
    return false
  }
}

module.exports = {
  sendEmail,
  formatHTMLEmail
}
