const admin = require('../config/admin')

module.exports = app => {
    app.route('/signup')
        .post(app.src.api.users.save)

    app.route('/signin')
        .post(app.src.api.auth.login)

    app.route('/token/validate')
        .post(app.src.api.auth.validadeToken)

    app.route('/users')
        .all(app.src.config.passport.authenticate)
        .post(admin(app.src.api.users.save))
        .get(admin(app.src.api.users.get))

    app.route('/users/:id')
        .all(app.src.config.passport.authenticate)
        .get(admin(app.src.api.users.getById))
        .put(admin(app.src.api.users.save))
        .delete(admin(app.src.api.users.remove))

    app.route('/categories')
        .all(app.src.config.passport.authenticate)
        .post(admin(app.src.api.categories.save))
        .get(admin(app.src.api.categories.get))

    app.route('/categories/tree')
        .all(app.src.config.passport.authenticate)
        .get(app.src.api.categories.getCategoriesTree)

    app.route('/categories/:id')
        .all(app.src.config.passport.authenticate)
        .get(app.src.api.categories.getById)
        .put(admin(app.src.api.categories.save))
        .delete(admin(app.src.api.categories.remove))

    app.route('/categories/:id/articles')
        .all(app.src.config.passport.authenticate)
        .get(app.src.api.articles.getByCategory)

    app.route('/articles')
        .all(app.src.config.passport.authenticate)
        .post(admin(app.src.api.articles.save))
        .get(admin(app.src.api.articles.get))

    app.route('/articles/:id')
        .all(app.src.config.passport.authenticate)
        .get(app.src.api.articles.getById)
        .put(admin(app.src.api.articles.save))
        .delete(admin(app.src.api.articles.remove))

    app.route('/stats')
        .all(app.src.config.passport.authenticate)
        .get(app.src.api.stats.get)
}