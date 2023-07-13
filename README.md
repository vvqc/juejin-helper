# juejin-helper 项目介绍

## 项目简介

juejin-helper 是一个用于掘金网站的辅助工具，通过使用用户的 Cookie 和 GitHub Actions 实现自动签到和处理日常任务的功能。该项目是从 [chinjiaqing/juejin-helper](https://github.com/chinjiaqing/juejin-helper) 进行 Fork 的，并在此基础上进行了改进和优化。

## 项目地址

[juejin-helper](https://github.com/Wiederhoeft/juejin-helper)

## 功能特点

- 自动签到：利用用户的掘金网站 Cookie 实现自动签到，省去手动操作的繁琐过程。
- 日常任务处理：通过 GitHub Actions 实现自动化处理掘金网站的日常任务，提高效率和节省时间。
- 使用 OpenAI API：通过提供的 OpenAI API 实现更智能化的功能，例如聊天、自动回答问题等。
- 环境变量配置：项目使用环境变量来存储敏感信息，包括用户的掘金网站 Cookie、OpenAI 密钥以及 OpenAI 接口地址等，保证数据安全性。
- 可扩展性：项目提供了基础的功能，用户可以根据自己的需求进行二次开发和定制化。

## 使用说明

1. Fork 该仓库到你自己的 GitHub 账号下。

2. 在仓库的 `Settings->Secrets->Actions` 中添加如下几个环境变量：

   - `USER_COOKIE`：掘金网站的 Cookie，用于用户登录和接口请求。
   - `OPENAI_API_KEY`：OpenAI 密钥，你在 OpenAI 账户页面申请的 API Key。
   - `BASE_URL`：OpenAI 的接口地址，默认为 [https://api.openai.com/v1/chat/completions](https://api.openai.com/v1/chat/completions)，也可以使用代理进行配置。
   - `EMAIL_USER`：发送邮件的邮箱账号。
   - `EMAIL_PASS`：发送邮件的授权码。
   - `USER_EMAIL`：接收通知的邮箱账号。

3. 在 `Settings->Actions` 确保 Actions 功能处于开启状态。

4. 关于发送邮件通知，本项目通知使用的是网易 163 邮箱。如果你想使用其他邮件服务商进行推送，请在 `config.js` 文件的 `email.provider` 选项中进行配置修改。

5. 将提供的基础 YAML 配置文件复制到你的仓库的 `.github/workflows` 目录下，命名为 `juejin-helper.yml`。

6. 每天的北京时间 8:00 左右，GitHub Actions 将自动执行任务。

基础 [juejin-auto-sign.yml](.github/workflows/juejin-auto-sign.yml) 配置文件内容如下：

```yaml
name: juejin-auto-sign
permissions:
  contents: write
on:
  schedule:
    # 执行两次，避免偶尔执行失败的情况出现
    - cron: '15 22 * * *'
    - cron: '30 23 * * *'
  push:
    branches:
      - main
      - master

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16.x]

    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js 16.x
        uses: actions/setup-node@v3
        with:
          node-version: '16.x'
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 7
          run_install: false
      - name: Install dependencies
        run: pnpm install
      - name: Run script
        env:
          USER_COOKIE: ${{ secrets.USER_COOKIE }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          EMAIL_USER: ${{ secrets.EMAIL_USER }}
          EMAIL_PASS: ${{ secrets.EMAIL_PASS }}
          USER_EMAIL: ${{ secrets.USER_EMAIL }}
        run: |
          pnpm run start
```

以上是 juejin-helper 项目的介绍和使用说明。通过配置好环境变量和基础 YAML 文件，你可以实现自动化的掘金网站签到和日常任务处理。
