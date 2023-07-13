/*
 * @Author: h7ml <h7ml@qq.com>
 * @Date: 2022-11-28 14:01:34
 * @LastEditors: h7ml <h7ml@qq.com>
 * @LastEditTime: 2022-11-28 14:52:33
 * @FilePath: \juejin-helper\utils\weather.js
 * @Description: 
 * 
 * Copyright (c) 2022 by h7ml<h7ml@qq.com>, All Rights Reserved. 
 */
const axios = require('axios')

// https://tianqiapi.com/index/doc?version=v61
// 天气
const getWeather = async () => {
  return new Promise(async (r) => {
    const defaultWords = `最近大环境好像真的很差哎，以前简历找我的都是一大堆，现在寥寥无几`
    const res = await axios.get('https://v0.yiketianqi.com/api?unescape=1&version=v61&appid=36912373&appsecret=GUUQSxB1&city=%E6%9D%AD%E5%B7%9E').catch(error => {
      return r(defaultWords)
    })
    if (res.status == 200) {
      const data = res.data
      if (data && data) {
        return r(data)
      }
    }
    return r(defaultWords)
  })
}
module.exports = {
  getWeather
}