const path = require('node:path')
const { JsonDB } = require('node-json-db')
const { Config } = require('node-json-db/dist/lib/JsonDBConfig')

const db = new JsonDB(new Config(path.join(__dirname, '../data/data'), true, true, '/'))

function insertTo(dbKey, ...params) {
  return new Promise(async (r, j) => {
    try {
      await db.push(dbKey, ...params, false)
      await db.save()
      r()
    } catch (error) {
      console.log(error)
      r()
    }
  })
}

function dbGet(key, isArray = true) {
  return new Promise(async (r) => {
    try {
      const data = await db.getData(key)
      r(data)
    } catch (error) {
      r(isArray ? [] : null)
    }
  })
}
insertTo('/homepage', 'https://github.com/Wiederhoeft/juejin-helper')
module.exports = {
  db,
  insertTo,
  dbGet,
}
