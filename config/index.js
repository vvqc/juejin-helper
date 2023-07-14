require('dotenv').config()

module.exports = {
  // 这里的邮箱配置以网易邮箱为例，qq邮箱端口和host等均会有差异 具体可以留言提问或百度
  email: {
    provider: {
      auth: {
        user: process.env.EMAIL_USER, // 你的网易邮箱账号
        pass: process.env.EMAIL_PASS, // 你的网易邮箱 smpt 授权码
      },
      host: 'smtp.163.com',
      secure: true,
      port: 465,
      secureConnection: true,
    },
  },
  juejin: {
    login: 'https://juejin.cn/login',
    loginApi: '/passport/web/user/login',
    verifyApi: 'verify.snssdk.com/captcha/verify',
    category_id: '6809637767543259144',
    theme_ids: ['7243698841848348730'],
    tag_ids: ['6809640407484334093', '6809640398105870343', '6809640404791590919'],
    coverImage:
      'https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bbcbbd3c8e3b410b83553ea0488a54fe~tplv-k3u1fbpfcp-watermark.image?',
  },
  user: {
    mobile: process.env.USER_MOBILE, //你的掘金登录手机号
    password: process.env.USER_PASSWORD, // 你的掘金登录密码
    email: process.env.USER_EMAIL, // 你的接收通知的邮箱
    privacy: process.env.USER_PRIVACY || true, // 是否开启隐私模式,默认开启
    juejinCookie: process.env.USER_COOKIE, //你的掘金登录手机号
  },
  chatgpt: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY, // OpanAI 密钥，你在 openai 账户页面申请的 api key。
    BASE_URL: process.env.BASE_URL ?? 'https://api.openai.com/v1/chat/completions',
  },
}
