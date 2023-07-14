const config = require('../config/index')
const { getBrowser, closeBrowser } = require('../puppeteer/index')
const calcGapPosition = require('../puppeteer/gap')

async function getCookie() {
  if (global._cookie) return global._cookie
  try {
    const cookieStr = config.user.juejinCookie
    global._cookie = cookieStr
    return cookieStr
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  getCookie,
}
