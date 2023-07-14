async function getDailyInterviewQuestion() {
  const issues = []
  let page = 1
  let hasNextPage = true

  while (hasNextPage) {
    const response = await fetch(
      `https://api.github.com/repos/Advanced-Frontend/Daily-Interview-Question/issues?page=${page}&per_page=100`,
    )
    const data = await response.json()

    if (data.length === 0) {
      // 当返回的数据为空时，表示已经获取完所有的问题，退出循环
      hasNextPage = false
    } else {
      issues.push(...data)
      page++
    }
  }

  const formattedIssues = _.map(issues, (issue) => ({
    title: issue.title,
    url: issue.html_url,
    number: issue.number,
    body: issue.title.split('题：')[1],
  }))
  return formattedIssues
}

module.exports = {
  getDailyInterviewQuestion,
}
