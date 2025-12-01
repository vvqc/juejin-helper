const REPO_API = 'https://api.github.com/repos/haizlin/fe-interview'

const getGithubHeaders = () => {
  const headers = {
    'User-Agent': 'juejin-helper',
    'Accept': 'application/vnd.github.v3+json'
  }
  return headers
}

async function fetchLabels() {
  try {
    const response = await fetch(`${REPO_API}/labels?per_page=100`, {
      headers: getGithubHeaders(),
    })

    if (!response.ok) {
      throw new Error(`获取labels失败，状态码: ${response.status}`)
    }

    const data = await response.json()
    const labelNames = data.map((label) => label.name)
    return labelNames
  } catch (error) {
    console.error('获取热门面试题标签失败:', error)
    return []
  }
}

async function fetchIssues(label) {
  try {
    const response = await fetch(
      `${REPO_API}/issues?labels=${encodeURIComponent(label)}&state=open&per_page=20`,
      {
        headers: getGithubHeaders(),
      },
    )

    if (!response.ok) {
      throw new Error(`获取issues失败，状态码: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('获取热门面试题失败:', error)
    return []
  }
}

async function getInterviewHot() {
  const types = await fetchLabels()
  if (!types.length) return []

  const label = types[Math.floor(Math.random() * types.length)]
  const issues = await fetchIssues(label)
  return issues
}

module.exports = {
  getInterviewHot,
}
