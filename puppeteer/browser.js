const puppeteer = require('puppeteer')

async function getBrowser(options) {
  if (!global._browser) {
    try {
      const browser = await puppeteer.launch(
        Object.assign({}, options, {
          headless: false,
          ignoreDefaultArgs: ['--disable-extensions'],
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--use-gl=egl',
            '--disable-web-security',
            // '--start-fullscreen',
            '--disable-features=IsolateOrigins,site-per-process',
          ],
          defaultViewport: { width: 2560 / 2, height: 1600 },
        }),
      )
      global._browser = browser
    } catch (error) {
      console.log(error.message || 'puppeteer启动失败')
    }
  }

  return global._browser || null
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
