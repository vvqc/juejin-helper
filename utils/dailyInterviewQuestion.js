const fetch = require('node-fetch')
const _ = require('lodash')

async function getDailyInterviewQuestion() {
  const page = _.random(1, 143)
  const response = await fetch(
    `https://api.github.com/repos/Advanced-Frontend/Daily-Interview-Question/issues?page=${page}&per_page=4`,
  )
  const data = await response.json()
  // data.forEach((datum) => {
  //   datum.title = datum.replace(regex, '')
  // })

  return data
}

module.exports = {
  getDailyInterviewQuestion,
}
