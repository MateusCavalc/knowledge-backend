const queries = require('../config/db.queries.js')

module.exports = app => {
    const {
        existsOrError
    } = app.src.api.validation

    const save = async (req, res) => {
        console.log('[Create/Update article]')
        const article = { ...req.body }

        // se for atualização do artigo
        if (req.params.id) {
            article.id = req.params.id
        }

        try {
            existsOrError(article.name, "Nome não informado.")
            existsOrError(article.description, "Descrição não informada.")
            existsOrError(article.categoryId, "Categoria não informada.")
            existsOrError(article.userId, "Autor não informado.")
            existsOrError(article.content, "Conteúdo não informado.")
        } catch (error) {
            return res.status(400)
                .json({
                    status: 400,
                    msg: error,
                    data: {}
                })
        }

        // se tiver id, atualiza
        if (article.id) {
            app.db('articles')
                .update(article)
                .where({ id: article.id })
                .then(_ => res.status(200).json({
                    status: 200,
                    msg: "Artigo atualizado com sucesso!",
                    data: article
                }))
                .catch(err => res.status(500).json({
                    status: 500,
                    msg: err,
                    data: {}
                }))
        } else {
            app.db('articles')
                .insert(article)
                .then(_ => res.status(201).json({
                    status: 201,
                    msg: "Artigo criado com sucesso!",
                    data: article
                }))
                .catch(err => res.status(500).json({
                    status: 500,
                    msg: err,
                    data: {}
                }))
        }

    }

    const remove = async (req, res) => {
        console.log('[Delete article]')

        const articleId = req.params.id

        try {
            existsOrError(articleId, "Código do artigo não informado.")

            const deletedRows = await app.db('articles')
                .where({ id: articleId }).del()
            existsOrError(deletedRows, "Artigo não encontrado.")

            res.status(204).json({
                status: 204,
                msg: "Artigo excluído com sucesso!",
                data: {}
            })
        } catch (error) {
            return res.status(500)
                .json({
                    status: 500,
                    msg: error,
                    data: {}
                })
        }
    }

    const perPage = 2 // paginação

    const get = async (req, res) => {
        console.log('[Get articles (paginated)]')

        const page = req.query.page || 1

        const count = parseInt((await app.db('articles').count('id').first()).count)

        app.db('articles')
            .select('id', 'name', 'description')
            // aplica paginação
            .limit(perPage)
            .offset(perPage * (page - 1))
            .then(paginated => res.status(200).json({
                status: 200,
                msg: "",
                data: {
                    articles: paginated,
                    page: page,
                    perPage: perPage,
                    total: count
                }
            }))
            .catch(err => res.status(500).json({
                status: 500,
                msg: err,
                data: {}
            }))
    }

    const getById = (req, res) => {
        console.log('[Get article by id]')

        const articleId = req.params.id

        app.db('articles')
            .where({ id: articleId })
            .first()
            .then(article => res.status(200).json({
                status: 200,
                msg: "",
                data: {
                    ...article,
                    content: article.content.toString()
                }
            }))
            .catch(err => res.status(500).json({
                status: 500,
                msg: err,
                data: {}
            }))
    }

    const getByCategory = async (req, res) => {
        console.log('[Get articles by category id]')

        const categoryId = req.params.id
        const page = req.query.page || 1

        try {
            // realiza uma raw query específica de um arquivo separado
            const categories = await app.db.raw(queries.categoryWithChildren, categoryId)

            // map para ids
            const ids = categories.rows.map(c => c.id)

            app.db({ a: 'articles', u: 'users' }) // alias
                .select('a.id', 'a.name', 'a.description', 'a.imageUrl', { author: 'u.name' })
                //pagination
                .limit(perPage)
                .offset(perPage * (page - 1))
                .whereRaw('?? = ??', ['u.id', 'a.userId'])
                .whereIn('categoryId', ids)
                .orderBy('a.id', 'desc')
                .then(articles => res.status(200).json({
                    status: 200,
                    msg: "",
                    data: articles
                }))
                .catch(err => res.status(500).json({
                    status: 500,
                    msg: "Ocorreu um erro durante a operação",
                    data: err
                }))

        } catch (error) {
            return res.status(500)
                .json({
                    status: 500,
                    msg: "Não foi possível recuperar os artigos pela categoria",
                    data: error
                })
        }

    }

    return { save, remove, get, getById, getByCategory }

}