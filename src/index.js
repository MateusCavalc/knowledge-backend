const express = require('express')
const consign = require('consign')
const dbConfig = require('./config/db.data')
const bootStatsDb = require('./config/db.stats')

const PORT = 4000
const app = express()

app.db = dbConfig

bootStatsDb(app)

consign()
    .include('./src/config/passport.js')
    .then('./src/config/middlewares.js')
    .then('./src/api/validation.js')
    .then('./src/api')
    .then('./src/schedule')
    .then('./src/config/routes.js')
    .into(app)

app.listen(PORT, () => {
    console.log(`\n< Backend running on port ${PORT} >\n`)
})