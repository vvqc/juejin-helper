const axios = require('axios')
const _ = require('lodash')

const getCoverImage = async () => {
  const urlLists = ['https://api.likepoems.com/img/nature', 'https://api.likepoems.com/img/pc']
  const defaultCoverImage =
    'https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bbcbbd3c8e3b410b83553ea0488a54fe~tplv-k3u1fbpfcp-watermark.image?'

  return new Promise(async (resolve) => {
    try {
      const config = {
        method: 'get',
        url: _.sample(urlLists)
      }
      const response = await axios(config)
      resolve(response.request.res.responseUrl)
    } catch (error) {
      console.log(error)
      resolve(defaultCoverImage)
    }
  })
}

module.exports = {
  getCoverImage
}
