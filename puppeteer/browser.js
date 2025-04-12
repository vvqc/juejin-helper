const puppeteer = require('puppeteer')

async function getBrowser(options) {
  if (!global._browser) {
    try {
      console.log('正在启动浏览器...')
      const browser = await puppeteer.launch(
        Object.assign({}, options, {
          headless: true,
          ignoreDefaultArgs: ['--disable-extensions'],
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
          ],
          defaultViewport: { width: 1280, height: 800 },
        }),
      )
      global._browser = browser
      console.log('浏览器启动成功')
    } catch (error) {
      console.error('浏览器启动失败:', error.message)
      // 尝试使用系统浏览器
      try {
        console.log('尝试使用系统Chrome浏览器...')
        const browser = await puppeteer.launch({
          headless: true,
          executablePath: process.platform === 'darwin'
            ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
            : process.platform === 'win32'
              ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
              : '/usr/bin/google-chrome',
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          defaultViewport: { width: 1280, height: 800 },
        })
        global._browser = browser
        console.log('系统浏览器启动成功')
      } catch (secondError) {
        console.error('系统浏览器启动也失败:', secondError.message)
        throw new Error('无法启动任何浏览器，请确保系统安装了Chrome或Chromium')
      }
    }
  }

  if (!global._browser) {
    throw new Error('浏览器初始化失败，请检查Puppeteer安装')
  }

  return global._browser
}

async function closeBrowser() {
  if (global._browser) {
    await global._browser.close()
    global._browser = null
  }
}
module.exports = {
  getBrowser,
  closeBrowser,
}
