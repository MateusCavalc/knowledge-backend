module.exports = app => {
    // cria um modelo para os deocumentos referentes às estatísticas
    const stat = app.db_stats.model('stat', {
        users: Number,
        categories: Number,
        articles: Number,
        createdAt: Date
    })

    const get = (req, res) => {
        stat.findOne({}, {
            "_id": 0,
            users: 1,
            categories: 1,
            articles: 1
        }, { sort: { 'createdAt': -1 } })
            .then(stats => res.status(200).json({
                status: 200,
                msg: "",
                data: stats ?? {
                    users: 0,
                    categories: 0,
                    articles: 0,
                }
            }))
            .catch(err => res.status(500).json({
                status: 500,
                msg: err,
                data: {}
            }))
    }

    return { stat, get }
}