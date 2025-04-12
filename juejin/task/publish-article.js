/*
 * @Author: h7ml <h7ml@qq.com>
 * @Date: 2023-07-12 22:45:29
 * @LastEditors: h7ml <h7ml@qq.com>
 * @LastEditTime: 2023-07-13 08:43:55
 * @FilePath: \juejin\task\publish-article.js
 * @Description:
 *
 * Copyright (c) 2023 by h7ml<h7ml@qq.com>, All Rights Reserved.
 */
const _ = require('lodash')
const { getCookie } = require('../cookie')
const configEnv = require('../../config')
const JuejinHttp = require('../api')
const { getInterview, types } = require('../../utils/interview')
const { chatCompletion } = require('../../utils/chatCompletion')
const { getBrowser } = require('../../puppeteer/browser')
const { getInterviewHot } = require('../../utils/interviewHot')
const { getCoverImage } = require('../../utils/coverImage')
const { getDailyInterviewQuestion } = require('../../utils/dailyInterviewQuestion')
const { sendEmail } = require('../../utils/email')

const setPageCookie = async (page, cookie) => {
  const cookies = cookie.split(';').map((pair) => {
    const name = pair.trim().slice(0, pair.trim().indexOf('='))
    const value = pair.trim().slice(pair.trim().indexOf('=') + 1)
    return { name, value, domain: '.juejin.cn' }
  })
  await page.setCookie(...cookies)
}

const articlePublish = async (task) => {
  let errorMessages = [] // 用于收集错误信息
  try {
    const randomElement = _.sample(types)
    let todayInterview = []
    let dailyInterviewQuestion = []
    let hotInterview = []
    let errorMessage = ""

    try {
      todayInterview = await getInterview(randomElement, true)
    } catch (err) {
      errorMessage = `获取今日面试题失败: ${err.message}`
      errorMessages.push(errorMessage)
      console.error(errorMessage)
    }

    try {
      dailyInterviewQuestion = await getDailyInterviewQuestion()
    } catch (err) {
      errorMessage = `获取每日面试问题失败: ${err.message}`
      errorMessages.push(errorMessage)
      console.error(errorMessage)
    }

    try {
      hotInterview = await getInterviewHot()
    } catch (err) {
      errorMessage = `获取热门面试题失败: ${err.message}`
      errorMessages.push(errorMessage)
      console.error(errorMessage)
    }

    const randomNumbers = hotInterview.length > 1 ? _.sampleSize(_.range(hotInterview.length), Math.min(2, hotInterview.length)) : [0];
    const randomNumbersItem = randomNumbers.map(index => hotInterview[index] || { title: '前端性能优化技巧', body: '探讨前端性能优化的各种策略和技巧' });

    // 使用默认面试题作为备选
    const defaultInterviews = [
      { title: '如何优化前端应用的性能？', body: '讨论前端性能优化技巧' },
      { title: 'React Hooks的使用场景和优势', body: '探讨React Hooks的优势' },
      { title: '浏览器渲染原理与优化', body: '深入探讨浏览器渲染机制' },
      { title: '前端工程化实践', body: '讨论前端工程化的最佳实践' }
    ];

    let interview = todayInterview.length ? todayInterview :
      dailyInterviewQuestion.length ? dailyInterviewQuestion :
        hotInterview.length ? randomNumbersItem : defaultInterviews;

    if (!_.isArray(interview)) {
      interview = defaultInterviews;
      errorMessage = "所有面试题获取渠道均失败，使用默认面试题";
      errorMessages.push(errorMessage);
      console.warn(errorMessage);
    }

    // 准备文章封面、cookie和API
    let coverImage = '';
    try {
      coverImage = configEnv.juejin.coverImage || await getCoverImage();
    } catch (err) {
      errorMessage = `获取封面图片失败: ${err.message}`;
      errorMessages.push(errorMessage);
      console.error(errorMessage);
      // 使用默认封面
      coverImage = "https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a2e3c0b9db944b44a3a87361ddc64c26~tplv-k3u1fbpfcp-no-mark:480:480:0:0.awebp";
    }

    const cookie = await getCookie();
    const API = new JuejinHttp(cookie);

    // 获取分类ID
    let category_id;
    try {
      category_id = configEnv.juejin.category_id ||
        await API.getCategorys()
          .then((data) => {
            return _.sample(data).category_id || '6809637767543259144';
          });
    } catch (err) {
      errorMessage = `获取分类失败: ${err.message}`;
      errorMessages.push(errorMessage);
      console.error(errorMessage);
      category_id = '6809637767543259144'; // 使用默认分类ID
    }

    // 获取主题ID
    let theme_ids;
    try {
      theme_ids = configEnv.juejin.theme_ids ||
        await API.getListHot()
          .then((data) => {
            const numPositions = _.random(0, 9);
            return (themeIds = _.sampleSize(data, numPositions).map((obj) => {
              return obj?.theme?.theme_id;
            }) || ['7210002980895916043']);
          });
    } catch (err) {
      errorMessage = `获取主题失败: ${err.message}`;
      errorMessages.push(errorMessage);
      console.error(errorMessage);
      theme_ids = ['7244474054189514808']; // 使用默认主题ID
    }

    // 获取标签ID
    let tag_ids;
    try {
      tag_ids = configEnv.juejin.tag_ids ||
        await API.getTags()
          .then((data) => {
            const numPositions = _.random(1, 10);
            return (themeIds = _.sampleSize(data, numPositions).map((obj) => {
              return obj?.tag_id;
            }) || ['6809640407484334093']);
          });
    } catch (err) {
      errorMessage = `获取标签失败: ${err.message}`;
      errorMessages.push(errorMessage);
      console.error(errorMessage);
      tag_ids = ['6809640408797167623']; // 使用默认标签ID
    }

    const times = task.limit - task.done; // 需要执行的次数
    console.log(`需要发布${times}篇文章`);
    if (!configEnv.chatgpt.OPENAI_API_KEY) {
      errorMessage = `未配置OPENAI_API_KEY,跳过文章发表`;
      errorMessages.push(errorMessage);
      console.log(errorMessage);

      // 发送失败邮件
      await sendEmail({
        to: configEnv.user.email,
        subject: '【掘金】文章发布失败',
        text: `文章发布失败: 未配置OPENAI_API_KEY`,
      }).catch(err => console.error('发送邮件失败:', err.message));

      return;
    }

    let articles = [];
    for (let i = 0; i < times; i++) {
      try {
        const interviewInfo = interview[i % interview.length]; // 使用取余确保不会越界
        if (!interviewInfo || !interviewInfo.title) {
          errorMessage = `第${i + 1}篇文章的面试题信息不完整，跳过`;
          errorMessages.push(errorMessage);
          console.error(errorMessage);
          continue;
        }

        const title = interviewInfo.title;
        console.log('当前文章标题:', title);

        const query = interviewInfo.body
          ? '请写一篇一千字的markdown格式文章  核心内容是关于:\n' + title + '\n请将内容过滤标题和问题,只保留答案'
          : '请写一篇一千字markdown格式的文章  标题是:\n' + title;

        const result = await chatCompletion(query);
        const isDefaultContent = result.isDefaultContent || false;
        const content = result.content || result; // 兼容旧版返回格式

        console.log(
          `当前正在生成第${i + 1}篇文章\n 标题:${title}\n 文章长度:${content.length}\n  内容:${content.split('\n').slice(0, 10).join('\n')}`,
        );

        if (!content || !content.length) {
          errorMessage = `第${i + 1}篇文章内容为空，跳过`;
          errorMessages.push(errorMessage);
          console.error(errorMessage);
          continue;
        }

        // 检查是否使用默认内容，如果是则跳过发布
        if (isDefaultContent) {
          errorMessage = `第${i + 1}篇文章《${title}》使用了默认内容，跳过发布`;
          errorMessages.push(errorMessage);
          console.warn(errorMessage);
          continue;
        }

        let brief_content = content.substr(0, 50) + '...';
        while (brief_content.length < 50) {
          brief_content += brief_content;
        }

        articles.push({
          title,
          content,
          brief_content,
        });
      } catch (err) {
        errorMessage = `生成第${i + 1}篇文章时出错: ${err.message}`;
        errorMessages.push(errorMessage);
        console.error(errorMessage);
      }
    }

    if (articles.length === 0) {
      errorMessage = `没有成功生成任何文章，无法继续发布`;
      errorMessages.push(errorMessage);
      console.error(errorMessage);

      // 发送失败邮件
      await sendEmail({
        to: configEnv.user.email,
        subject: '【掘金】文章发布失败',
        text: `文章发布失败: 没有成功生成任何文章\n\n错误详情:\n${errorMessages.join('\n')}`,
      }).catch(err => console.error('发送邮件失败:', err.message));

      return;
    }

    // 尝试使用浏览器方式发布
    let browserPublishSuccess = false;
    try {
      const browser = await getBrowser();
      if (!browser) {
        throw new Error('浏览器实例创建失败');
      }

      const page = await browser.newPage();
      await setPageCookie(page, cookie);
      // 获取全屏窗口的大小
      const dimensions = await page.evaluate(() => {
        return {
          width: window.screen.width / 2,
          height: window.screen.height,
        };
      });
      // 设置视口大小
      await page.setViewport(dimensions);
      await page.goto("https://juejin.cn/user/center/growth");

      for (let i = 0; i < articles.length; i++) {
        try {
          let currentArticle = articles[i];
          let { title, brief_content, content } = currentArticle;

          const articleInfo = await API.createArticle(title, brief_content, content, coverImage, category_id)
            .catch((err) => {
              const errMsg = `创建文章失败: ${err.message}`;
              errorMessages.push(errMsg);
              console.error(errMsg);
              return null;
            });

          if (!articleInfo || !articleInfo['id']) {
            errorMessage = `创建文章《${title}》失败，跳过`;
            errorMessages.push(errorMessage);
            console.error(errorMessage);
            continue;
          }

          const article_id = articleInfo['id'];
          await API.updateArticle(
            article_id,
            title,
            brief_content,
            content,
            coverImage,
            category_id,
            theme_ids,
            tag_ids,
          ).catch((err) => {
            const errMsg = `更新文章失败: ${err.message}`;
            errorMessages.push(errMsg);
            console.error(errMsg);
          });

          // 去草稿箱点击模拟发布文章
          try {
            await page.goto(`https://juejin.cn/editor/drafts/${article_id}`);
            await page.waitForSelector('.xitu-btn', { timeout: 10000 });
            await page.click('.publish-popup');
            await page.waitForTimeout(2000);
            await page.click('.panel .footer .btn-container button:last-of-type');

            // 监听发布成功
            const publishRes = await page.waitForResponse((response) =>
              response.url().includes(`https://api.juejin.cn/content_api/v1/article/publish`),
              { timeout: 15000 }
            );
            const publishResJson = await publishRes.json();

            if (publishResJson.err_no == 0) {
              console.log(`第${i + 1}篇文章《${title}》发布成功`);
              browserPublishSuccess = true;
            } else {
              errorMessage = `第${i + 1}篇文章发布失败: ${JSON.stringify(publishResJson)}`;
              errorMessages.push(errorMessage);
              console.error(errorMessage);
            }
          } catch (err) {
            errorMessage = `浏览器发布第${i + 1}篇文章失败: ${err.message}`;
            errorMessages.push(errorMessage);
            console.error(errorMessage);
          }
        } catch (err) {
          errorMessage = `处理第${i + 1}篇文章时出错: ${err.message}`;
          errorMessages.push(errorMessage);
          console.error(errorMessage);
        }
      }

      await page.close();
      console.log(`浏览器方式发布文章完成`);
    } catch (error) {
      errorMessage = `浏览器方式发布文章失败: ${error.message}`;
      errorMessages.push(errorMessage);
      console.error(errorMessage);

      // 如果浏览器方式失败，尝试API方式
      console.log('尝试使用API方式发布文章...');
      let apiPublishSuccess = false;

      for (let i = 0; i < articles.length; i++) {
        try {
          let currentArticle = articles[i];
          let { title, brief_content, content } = currentArticle;

          const articleInfo = await API.createArticle(title, brief_content, content, coverImage, category_id);
          if (!articleInfo || !articleInfo['id']) {
            errorMessage = `API方式创建文章《${title}》失败`;
            errorMessages.push(errorMessage);
            console.error(errorMessage);
            continue;
          }

          const article_id = articleInfo['id'];
          await API.updateArticle(
            article_id,
            title,
            brief_content,
            content,
            coverImage,
            category_id,
            theme_ids,
            tag_ids,
          );

          console.log(`第${i + 1}篇文章《${title}》API方式发布成功，文章ID: ${article_id}`);
          apiPublishSuccess = true;
        } catch (err) {
          errorMessage = `第${i + 1}篇文章API方式发布失败: ${err.message}`;
          errorMessages.push(errorMessage);
          console.error(errorMessage);
        }
      }

      // 如果API方式也失败了，发送失败邮件
      if (!apiPublishSuccess && !browserPublishSuccess) {
        await sendEmail({
          to: configEnv.user.email,
          subject: '【掘金】文章发布失败',
          text: `浏览器方式和API方式均无法发布文章\n\n错误详情:\n${errorMessages.join('\n')}`,
        }).catch(err => console.error('发送邮件失败:', err.message));
      }
    }

    console.log(`发布文章任务完成`);

  } catch (error) {
    const errorMessage = `发布文章任务整体失败: ${error.message}`;
    errorMessages.push(errorMessage);
    console.error(errorMessage);

    // 发送失败邮件
    await sendEmail({
      to: configEnv.user.email,
      subject: '【掘金】文章发布任务失败',
      text: `文章发布任务失败\n\n错误详情:\n${errorMessages.join('\n')}`,
    }).catch(err => console.error('发送邮件失败:', err.message));
  }
}

module.exports = articlePublish
