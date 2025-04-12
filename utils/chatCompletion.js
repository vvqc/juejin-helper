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
const fs = require('fs')
const path = require('path')

// 日志记录函数
function logError(errorDetails, content) {
  try {
    // 确保logs目录存在
    const logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // 生成日志文件名
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const logFileName = path.join(logsDir, `api-errors-${dateStr}.log`);

    // 创建详细的错误日志内容
    const logContent = `
===================== API ERROR LOG =====================
时间: ${now.toISOString()}
类型: ${errorDetails.type}
消息: ${errorDetails.message}
代码: ${errorDetails.code}
${errorDetails.statusCode ? `HTTP状态: ${errorDetails.statusCode} (${errorDetails.statusText})` : ''}
${errorDetails.suggestion ? `建议: ${errorDetails.suggestion}` : ''}

查询内容:
${content.substring(0, 200)}${content.length > 200 ? '...(截断)' : ''}

堆栈:
${errorDetails.stack}

${errorDetails.serverResponse ? `服务器响应:
${typeof errorDetails.serverResponse === 'object'
          ? JSON.stringify(errorDetails.serverResponse, null, 2)
          : errorDetails.serverResponse}` : '无服务器响应'}
=========================================================
`;

    // 追加写入日志文件
    fs.appendFileSync(logFileName, logContent);
    console.log(`错误详情已记录到: ${logFileName}`);
    return true;
  } catch (err) {
    console.error('记录错误日志时发生错误:', err.message);
    return false;
  }
}

// 辅助函数：格式化错误详情
function formatErrorDetails(error) {
  const details = {
    message: error.message,
    code: error.code || 'UNKNOWN',
    type: error.name,
    stack: error.stack || '未知',
    timestamp: new Date().toISOString()
  };

  // 超时错误的特殊处理
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    details.type = 'TIMEOUT_ERROR';
    details.suggestion = '可能是网络连接不稳定或API服务器响应过慢，建议检查网络连接或增加超时时间';
  }

  // 网络错误的特殊处理
  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    details.type = 'NETWORK_ERROR';
    details.suggestion = '可能是网络连接问题或API地址配置错误，建议检查网络连接和API地址配置';
  }

  // axios响应错误的特殊处理
  if (error.response) {
    details.statusCode = error.response.status;
    details.statusText = error.response.statusText;

    // 针对不同状态码给出具体建议
    switch (error.response.status) {
      case 401:
        details.suggestion = 'API密钥无效或已过期，请检查OPENAI_API_KEY配置';
        break;
      case 403:
        details.suggestion = '权限被拒绝，API密钥可能没有足够的权限或已被限制';
        break;
      case 429:
        details.suggestion = 'API请求次数超过限额，建议降低请求频率或升级API计划';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        details.suggestion = 'API服务器错误，建议稍后重试';
        break;
    }

    // 尝试提取响应数据中的错误信息
    if (error.response.data) {
      if (typeof error.response.data === 'string') {
        try {
          details.serverResponse = JSON.parse(error.response.data);
        } catch {
          details.serverResponse = error.response.data.substring(0, 500); // 限制长度
        }
      } else {
        details.serverResponse = error.response.data;
      }
    }
  }

  return details;
}

// 格式化控制台错误输出
function logErrorToConsole(errorDetails) {
  // 创建一个彩色边框的错误框
  const errorBox = [
    '\x1b[31m╔════════════════════ ChatGPT API 调用失败 ════════════════════╗\x1b[0m',
    `\x1b[31m║\x1b[0m 错误类型: \x1b[1m${errorDetails.type}\x1b[0m`,
    `\x1b[31m║\x1b[0m 错误消息: \x1b[1m${errorDetails.message}\x1b[0m`,
    `\x1b[31m║\x1b[0m 错误代码: \x1b[1m${errorDetails.code}\x1b[0m`
  ];

  if (errorDetails.statusCode) {
    errorBox.push(`\x1b[31m║\x1b[0m HTTP状态: \x1b[1m${errorDetails.statusCode} (${errorDetails.statusText})\x1b[0m`);
  }

  if (errorDetails.suggestion) {
    errorBox.push(`\x1b[31m║\x1b[0m`);
    errorBox.push(`\x1b[31m║\x1b[0m 可能原因和建议:`);
    errorBox.push(`\x1b[31m║\x1b[0m \x1b[33m${errorDetails.suggestion}\x1b[0m`);
  }

  errorBox.push(`\x1b[31m║\x1b[0m`);
  errorBox.push(`\x1b[31m║\x1b[0m 出错时间: ${errorDetails.timestamp}`);
  errorBox.push(`\x1b[31m╚══════════════════════════════════════════════════════════════╝\x1b[0m`);

  // 打印错误框
  console.error(errorBox.join('\n'));

  // 如果有服务器响应，单独打印
  if (errorDetails.serverResponse) {
    console.error('\x1b[33m服务器响应详情:\x1b[0m');
    console.error(typeof errorDetails.serverResponse === 'object'
      ? JSON.stringify(errorDetails.serverResponse, null, 2)
      : errorDetails.serverResponse);
  }
}

const chatCompletion = async (content) => {
  const defaultCompletion = {
    content: '前端开发是构建用户可见和可交互的网页部分的过程。它结合了HTML、CSS和JavaScript等技术，确保网站具有良好的外观和顺畅的用户体验。前端开发者需要关注性能优化、跨浏览器兼容性、响应式设计和无障碍访问。现代前端开发还涉及使用React、Vue或Angular等框架，以及Webpack等构建工具来提高开发效率。',
    isDefaultContent: true
  };

  try {
    console.log('开始获取AI生成内容...');
    // 读取系统和助手的文件内容
    const systemContent = await fs.promises.readFile(path.join(__dirname, 'system.md'), 'utf-8');
    const assistantContent = await fs.promises.readFile(path.join(__dirname, 'assistant.md'), 'utf-8');

    // 使用更简单的提示策略
    const messages = [
      {
        "role": "system",
        "content": systemContent
      },
      {
        "role": "user",
        "content": "两个相邻的inline-block元素为什么会出现间隔，如何解决？"
      },
      {
        "role": "assistant",
        "content": assistantContent
      },
      {
        "role": "user",
        "content": content
      }
    ];

    // 支持自定义模型配置
    const model = configEnv.chatgpt.MODEL || "gpt-3.5-turbo";
    console.log(`使用AI模型: ${model}`);

    // 构建请求数据
    const requestData = {
      "model": model,
      "messages": messages,
      "temperature": 0.7,
      "max_tokens": 1000
    };

    // deepseek模型设置为非流
    if (model.includes('deepseek')) {
      requestData.stream = false;
    }

    // 计算API请求数据大小
    const requestDataSize = Buffer.byteLength(JSON.stringify(requestData), 'utf8');
    const requestDataSizeKB = (requestDataSize / 1024).toFixed(2);

    // 确定超时时间
    // 对更大的请求增加超时时间
    let timeout = 60000; // 默认60秒
    if (requestDataSize > 10 * 1024) { // 如果请求大于10KB
      timeout = 120000; // 增加到120秒
    }

    const config = {
      method: 'post',
      url: configEnv.chatgpt.BASE_URL || 'https://api.openai.com/v1/chat/completions',
      headers: {
        Authorization: `Bearer ${configEnv.chatgpt.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(requestData),
      timeout: timeout
    };

    console.log(`开始请求AI模型，API URL: ${config.url.split('?')[0]}`);
    console.log(`请求大小: ${requestDataSizeKB}KB, 超时设置: ${timeout / 1000}秒`);

    const startTime = Date.now();
    const response = await axios(config);
    const requestTime = Date.now() - startTime;

    console.log(`AI响应成功，耗时: ${requestTime}ms`);

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      let completion = response.data.choices[0].message.content;
      console.log(`成功获取AI内容，长度: ${completion.length}字符`);

      // 处理 completion 内容，保留原文格式
      return {
        content: completion.trim(),
        isDefaultContent: false
      };
    } else {
      console.error('API返回数据格式异常:', JSON.stringify(response.data));
      return defaultCompletion;
    }
  } catch (error) {
    // 增强错误处理
    const errorDetails = formatErrorDetails(error);

    // 打印格式化的错误信息到控制台
    logErrorToConsole(errorDetails);

    // 记录详细错误信息到日志文件
    logError(errorDetails, content);

    // 创建一个包含错误信息的默认回复
    const errorMessage = `AI生成失败: ${errorDetails.message}${errorDetails.suggestion ? ' - ' + errorDetails.suggestion : ''}`;
    console.log(`返回默认内容代替AI回复，错误概要: ${errorMessage}`);

    // 返回默认内容
    return defaultCompletion;
  }
};

module.exports = {
  chatCompletion
};
