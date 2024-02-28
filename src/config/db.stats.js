const mongoose = require('mongoose')
const { mongoConfig } = require('../../.env')

const mongoUrl = `mongodb://${mongoConfig.user}:${mongoConfig.password}@${mongoConfig.host}:${mongoConfig.port}/${mongoConfig.database}`

const bootStatsDb = app => {
    console.log(`> Conectando com o mongoose (db_stats) em ${mongoUrl}`)
    mongoose.connect(mongoUrl,
        {
            serverSelectionTimeoutMS: 1000,
            authSource: "admin",
        })
        .catch(err => {
            console.log(
                '\x1b[41m%s\x1b[37m', // liga fundo vermelho
                'Não foi possível conectar com o MongoDB!',
                '\x1b[0m' // desliga fundo vermelho
            )
            if (err.message) console.log(err.message)
        })

    app.db_stats = mongoose

}

module.exports = bootStatsDb