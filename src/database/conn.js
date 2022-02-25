const db = require('./db')
const Sql = require('./sql')

module.exports = new Sql(db.connect())
