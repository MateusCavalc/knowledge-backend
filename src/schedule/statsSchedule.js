const schedule = require('node-schedule')
const { schedulerConfig } = require('../../.env')

module.exports = app => {
    schedule.scheduleJob(schedulerConfig.cron, async () => {
        try {
            const usersCount = await app.db('users').count('id').first()
            const categoriesCount = await app.db('categories').count('id').first()
            const articlesCount = await app.db('articles').count('id').first()

            const { stat } = app.src.api.stats

            const lastStats = await stat.findOne({}, {}, { sort: { 'createdAt': -1 } })

            const newStat = new stat({
                users: usersCount.count,
                categories: categoriesCount.count,
                articles: articlesCount.count,
                createdAt: new Date()
            })

            const mustChangeUsers = !lastStats || lastStats.users !== newStat.users
            const mustChangeCategories = !lastStats || lastStats.categories !== newStat.categories
            const mustChangeArticles = !lastStats || lastStats.articles !== newStat.articles

            if (mustChangeUsers || mustChangeCategories || mustChangeArticles) {
                newStat.save()
                    .then(() => console.log('[stats] Estatísticas foram atualizadas!'))
                    .catch((err) => {
                        console.log(
                            '\x1b[41m%s\x1b[37m', // liga fundo vermelho
                            '[stats] Erro durante a atualização de estatísticas',
                            '\x1b[0m' // desliga fundo vermelho)
                        )
                        if (err.message) console.log(err.message)
                    })
            }
        } catch (err) {
            console.log(
                '\x1b[41m%s\x1b[37m', // liga fundo vermelho
                '[stats] Erro durante a atualização de estatísticas',
                '\x1b[0m' // desliga fundo vermelho)
            )
            if (err.message) console.log(err.message)
        }

    })
}
