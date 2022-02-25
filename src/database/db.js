require('dotenv-safe').config()

const knex = require('knex')
const knexfile = require('../../knexfile')

const nodeEnv = process.env.NODE_ENV || 'development'
const dbconfig = knexfile[nodeEnv]
let db = null

function connect () {
  if (!db) {
    db = knex(dbconfig)
  }

  return db
}

async function disconnect () {
  const ret = true

  if (db) {
    await db.destroy()
    db = null
  }

  return ret
}

module.exports = {
  connect,
  disconnect
}
