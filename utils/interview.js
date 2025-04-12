/*
 * @Author: h7ml <h7ml@qq.com>
 * @Date: 2023-07-12 20:08:33
 * @LastEditors: h7ml <h7ml@qq.com>
 * @LastEditTime: 2023-07-13 01:55:47
 * @FilePath: \utils\interview.js
 * @Description:
 *
 * Copyright (c) 2023 by h7ml<h7ml@qq.com>, All Rights Reserved.
 */
const _ = require('lodash')

const types = ['one', 'two', 'today', 'beforetoday', 'yestoday', 'week']
// 存储GitHub Issues数量的缓存，避免频繁请求
let issuesCountCache = {
  count: 0,
  timestamp: 0
};

// 获取GitHub仓库open issues总数
async function getGitHubIssuesCount() {
  // 缓存1小时有效
  const CACHE_DURATION = 60 * 60 * 1000;

  // 如果缓存还有效，直接返回缓存值
  if (issuesCountCache.count > 0 && (Date.now() - issuesCountCache.timestamp) < CACHE_DURATION) {
    console.log(`使用缓存的GitHub Issues数量: ${issuesCountCache.count}`);
    return issuesCountCache.count;
  }

  try {
    console.log('正在获取GitHub Issues总数...');
    const response = await fetch(
      'https://api.github.com/repos/haizlin/fe-interview/issues?state=open&per_page=1',
      {
        headers: {
          'User-Agent': 'juejin-helper',
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`获取Issues总数失败: ${response.status}`);
    }

    // 从Link header获取总页数信息
    const linkHeader = response.headers.get('Link');
    let totalCount = 0;

    if (linkHeader) {
      // 解析Link header获取最后一页的页码
      const matches = linkHeader.match(/page=(\d+)>; rel="last"/);
      if (matches && matches[1]) {
        totalCount = parseInt(matches[1]) * 5; // 每页5条，总页数乘以5
      }
    }

    // 尝试从X-Total-Count头获取
    if (!totalCount) {
      const totalCountHeader = response.headers.get('X-Total-Count');
      if (totalCountHeader) {
        totalCount = parseInt(totalCountHeader);
      }
    }

    // 如果仍然获取不到，从响应体中获取
    if (!totalCount) {
      const data = await response.json();
      // 如果response包含total_count字段
      if (data.total_count) {
        totalCount = data.total_count;
      } else {
        // 默认值：当前已知仓库有大约6000+个issues
        totalCount = 6000;
      }
    }

    // 更新缓存
    issuesCountCache = {
      count: totalCount,
      timestamp: Date.now()
    };

    console.log(`获取到GitHub Issues总数: ${totalCount}`);
    return totalCount;
  } catch (error) {
    console.error('获取GitHub Issues总数失败:', error.message);
    // 如果有缓存值，返回缓存值
    if (issuesCountCache.count > 0) {
      return issuesCountCache.count;
    }
    // 默认返回6000，避免程序崩溃
    return 6000;
  }
}

async function getInterview(type = 'beforetoday', all = false) {
  // 获取GitHub Issues总数并计算最大页码
  const totalIssues = await getGitHubIssuesCount();
  const maxPage = Math.ceil(totalIssues / 5); // 每页5条数据

  // 生成1到maxPage之间的随机页码
  const page = _.random(1, maxPage);
  console.log(`随机获取第${page}页面试题(总共${maxPage}页)`);

  const regex = /第\d+天/g

  // 增加重试次数和超时时间
  const maxRetries = 3
  const timeout = 30000 // 增加到30秒

  let retries = 0
  let lastError = null

  while (retries < maxRetries) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(
        // 使用不同的API端点，避免422错误
        // 尝试使用GitHub的Issues API，每个仓库的限制不同
        `https://api.github.com/repos/haizlin/fe-interview/issues?state=open&per_page=5&page=${page}`,
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'juejin-helper',
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      )

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log(`成功获取面试题，页码: ${page}/${maxPage}`)

      if (!data || data.length === 0) {
        throw new Error('获取面试题数据为空')
      }

      data.forEach((datum) => {
        datum.body = datum.body ? datum.body.split('[3+1官网]')[0].replace(regex, '') : ''
        datum.title = datum.title ? _.tail(_.split(datum.title.replace(regex, ''), '] ')).join('') : '前端面试题'
      })

      return all ? data : _.sample(data).title
    } catch (error) {
      lastError = error
      retries++
      console.log(`获取面试题失败，正在进行第 ${retries} 次重试...`)
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  console.error('获取面试题失败，已达到最大重试次数', lastError)
  // 返回一个默认面试题作为备选
  return all ? [
    { title: '如何提高前端应用的性能？', body: '讨论前端性能优化的各种方法' },
    { title: 'React Hooks 的优势和使用场景', body: '探讨React Hooks的各种使用场景和最佳实践' }
  ] : '如何提高前端应用的性能？'
}

module.exports = {
  getInterview,
  types,
}
