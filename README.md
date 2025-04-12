# juejin-helper 项目介绍

## 项目简介

juejin-helper 是一个用于掘金网站的辅助工具，通过使用用户的 Cookie 和 GitHub Actions 实现自动签到和处理日常任务的功能。该项目是从 [chinjiaqing/juejin-helper](https://github.com/chinjiaqing/juejin-helper) 进行 Fork 的，并在此基础上进行了改进和优化。

## 项目地址

[juejin-helper](https://github.com/Wiederhoeft/juejin-helper)

## 功能特点

- **自动签到**：利用用户的掘金网站 Cookie 实现自动签到，省去手动操作的繁琐过程。
- **日常任务处理**：通过 GitHub Actions 实现自动化处理掘金网站的日常任务，提高效率和节省时间。
- **使用 OpenAI API**：通过提供的 OpenAI API 实现更智能化的功能，例如自动发布文章、沸点和评论。
- **环境变量配置**：项目使用环境变量来存储敏感信息，包括用户的掘金网站 Cookie、OpenAI 密钥以及 OpenAI 接口地址等，保证数据安全性。
- **集成邮件通知**：任务执行结果会通过精美的邮件模板发送通知，提供完整的执行报告。
- **可扩展性**：项目提供了基础的功能，用户可以根据自己的需求进行二次开发和定制化。

## 最新特性

- **现代化邮件模板**：采用 Apple+小米风格设计的邮件通知，提供更好的视觉体验
- **智能内容检测**：自动检测生成内容质量，避免发布低质量或默认内容
- **集成通知系统**：所有任务（签到、沸点、评论、文章）状态统一整合到一封邮件中
- **完善的错误处理**：详细记录每个任务的执行状态，即使部分任务失败也能继续执行
- **用户信息保护**：在通知和日志中对用户名进行部分加密处理，保护隐私

## 使用说明

1. Fork 该仓库到你自己的 GitHub 账号下。

2. 在仓库的 `Settings->Secrets->Actions` 中添加如下几个环境变量：

   - `USER_COOKIE`：掘金网站的 Cookie，用于用户登录和接口请求。
   - `OPENAI_API_KEY`：OpenAI 密钥，你在 OpenAI 账户页面申请的 API Key。
   - `BASE_URL`：OpenAI 的接口地址，默认为 `https://api.openai.com/v1/chat/completions`，也可以使用代理进行配置。
   - `EMAIL_USER`：发送邮件的邮箱账号。
   - `EMAIL_PASS`：发送邮件的授权码。
   - `USER_EMAIL`：接收通知的邮箱账号。
   - `MODEL`：(可选) 指定使用的AI模型，默认为 `deepseek-v3`，也可以设置为 `gpt-3.5-turbo` 或 `gpt-4` 等。

3. 在 `Settings->Actions` 确保 Actions 功能处于开启状态。

4. 关于发送邮件通知：
   - 默认使用 SMTP 服务器进行邮件发送
   - 如需使用其他邮件服务商，可在 `config.js` 中的 `email.provider.host` 选项修改配置
   - 通过环境变量 `EMAIL_HOST` 可以指定邮件服务器地址
   - 现在所有执行结果会整合到一封邮件中，避免多次接收通知

5. 执行时间：
   - 每天的北京时间 `06:15` 和 `07:30` 左右，GitHub Actions 将自动执行任务
   - 您也可以通过手动点击仓库上方的 `Star` 按钮触发立即执行

6. 最小配置要求：
   - 只设置 `USER_COOKIE` 可完成基础的签到功能
   - 要使用发布文章、沸点和评论功能，需要额外设置 `OPENAI_API_KEY`
   - 要接收邮件通知，需要设置邮件相关的三个环境变量

## 自定义配置

您可以在 `.env` 文件中自定义更多配置，或通过 GitHub Secrets 添加对应的环境变量：

```
# 基础配置
USER_COOKIE=您的掘金Cookie
OPENAI_API_KEY=您的OpenAI密钥

# 邮件配置
EMAIL_USER=发送邮件的邮箱
EMAIL_PASS=邮箱授权码
USER_EMAIL=接收通知的邮箱
EMAIL_HOST=邮件服务器地址（可选）

# AI模型配置
MODEL=deepseek-v3
BASE_URL=https://api.openai.com/v1/chat/completions

# 文章发布配置
category_id=分类ID（可选）
theme_ids=主题ID（可选）
tag_ids=标签ID（可选）
coverImage=封面图片URL（可选）
```

## 本地运行

如果您想在本地运行项目，请按照以下步骤操作：

1. 克隆仓库到本地
```bash
git clone https://github.com/您的用户名/juejin-helper.git
cd juejin-helper
```

2. 安装依赖
```bash
npm install
```

3. 创建 `.env` 文件并配置环境变量

4. 运行程序
```bash
node index.js
```

## 注意事项

- Cookie 有效期通常为一个月，过期后需要重新获取并更新
- 为保护账号安全，建议定期更新 Cookie
- 如遇任务执行错误，可查看 Actions 日志或邮件通知了解详情
- 项目仅供学习交流使用，请遵守相关网站的使用条款和规定

## 许可证

本项目遵循 MIT 许可证
