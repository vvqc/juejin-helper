const _ = require('lodash')

async function getCoverImage() {
  const urlLists = [
    'https://api.likepoems.com/img/nature',
    'https://api.likepoems.com/img/pc',
    'https://api.thecatapi.com/v1/images/search',
    'https://dog.ceo/api/breeds/image/random',
  ]
  const defaultCoverImage = 'https://http.cat/111'

  return new Promise(async (resolve) => {
    try {
      const url = _.sample(urlLists)
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        resolve(data.message || data.url || data[0].url)
      } else {
        resolve(defaultCoverImage)
      }
    } catch (error) {
      console.log(error)
      resolve(defaultCoverImage)
    }
  })
}

module.exports = {
  getCoverImage,
}
