const {
  collectArticle,
  diggArticle,
  diggPin,
  commentArticle,
  commentPin,
  followAuthor,
  publishPin,
  readArticle,
  publishArticle,
} = require('./task/index')

async function handleTask(task) {
  const id = task.task_id
  if (id == 13) {
    return readArticle(task)
  }
  if (id == 9) {
    return diggArticle(task)
  }
  if (id == 12) {
    return collectArticle(task)
  }
  if (id == 11) {
    return followAuthor(task)
  }
  if (id == 7) {
    return commentArticle(task)
  }
  if (id == 8) {
    return commentPin(task)
  }
  if (id == 10) {
    return diggPin(task)
  }
  if (id == 6) {
    return publishPin(task)
  }
  if (id == 5) {
    return publishArticle(task)
  }
  return true
}

module.exports = {
  handleTask,
}
