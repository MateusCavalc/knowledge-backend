module.exports = app => {
    const {
        existsOrError,
        notExistsOrError
    } = app.src.api.validation

    const save = async (req, res) => {
        console.log('[Create/Update category]')
        const category = {
            name: req.body.name,
            parentId: req.body.parentId,
        }

        // se for atualização da categoria
        if (req.params.id) {
            category.id = req.params.id
        }

        try {
            existsOrError(category.name, "Nome não informado.")
        } catch (error) {
            return res.status(400)
                .json({
                    status: 400,
                    msg: error,
                    data: {}
                })
        }

        // se tiver id, atualiza
        if (category.id) {
            app.db('categories')
                .update(category)
                .where({ id: category.id })
                .then(_ => res.status(200).json({
                    status: 200,
                    msg: "Categoria atualizada com sucesso!",
                    data: category
                }))
                .catch(err => res.status(500).json({
                    status: 500,
                    msg: err,
                    data: {}
                }))
        }

        app.db('categories')
            .insert(category)
            .then(_ => res.status(201).json({
                status: 201,
                msg: "Categoria criada com sucesso!",
                data: category
            }))
            .catch(err => res.status(500).json({
                status: 500,
                msg: err,
                data: {}
            }))
    }

    const remove = async (req, res) => {
        console.log('[Delete category]')

        const categoryId = req.params.id

        try {
            existsOrError(categoryId, "Código da categoria não informado.")

            const subCategories = await app.db('categories')
                .where({ parentId: categoryId })
            notExistsOrError(subCategories, "Categoria possui subcategorias.")


            const articles = await app.db('articles')
                .where({ categoryId: categoryId })
            notExistsOrError(articles, "Categoria possui artigos.")

            const deletedRows = await app.db('categories')
                .where({ id: categoryId }).del()
            existsOrError(deletedRows, "Categoria não encontrada.")

            res.status(204).json({
                status: 204,
                msg: "Categoria excluída com sucesso!",
                data: {}
            })
        } catch (error) {
            return res.status(400)
                .json({
                    status: 400,
                    msg: error,
                    data: {}
                })
        }
    }

    const withPath = categories => {
        const getParent = (categories, parentId) => {
            const parent = categories.filter(parent => parent.id === parentId)
            return parent.length ? parent[0] : null
        }

        const categoriesWithPath = categories.map(category => {
            let path = category.name
            let parent = getParent(categories, category.parentId)

            while (parent) {
                path = parent.name + ' > ' + path
                parent = getParent(categories, parent.parentId)
            }

            return {
                ...category,
                path
            }
        })

        // ordenando por ordem alfabética
        categoriesWithPath.sort((a, b) => {
            if (a.path < b.path) return -1
            if (a.path > b.path) return 1
            return 0
        })

        return categoriesWithPath
    }

    const get = (req, res) => {
        console.log('[Get categories]')

        app.db('categories')
            .then(categories => res.status(200).json({
                status: 200,
                msg: "",
                data: withPath(categories)
            }))
            .catch(err => res.status(500).json({
                status: 500,
                msg: err,
                data: {}
            }))
    }

    const getById = (req, res) => {
        console.log('[Get category by id]')

        const categoryId = req.params.id

        app.db('categories')
            .where({ id: categoryId })
            .first()
            .then(category => res.status(200).json({
                status: 200,
                msg: "",
                data: category
            }))
            .catch(err => res.status(500).json({
                status: 500,
                msg: err,
                data: {}
            }))
    }

    const toTree = (categories, tree = null) => {
        // se o nós iniciais não forem definidos
        if (!tree) {
            // define nós iniciais com categorias sem pai
            tree = categories.filter(c => !c.parentId)
        }

        tree = tree.map(rootNode => {
            const children = categories.filter(c => c.parentId === rootNode.id)

            return {
                id: rootNode.id,
                label: rootNode.name,
                // parentId: rootNode.parentId,
                // path: rootNode.path,
                nodes: toTree(categories, children)
            }
        })

        return tree
    }

    const getCategoriesTree = (req, res) => {
        app.db('categories')
            .then(categories => res.status(200).json({
                status: 200,
                msg: "",
                data: toTree(withPath(categories))
            }))
            .catch(err => res.status(500).json({
                status: 500,
                msg: err,
                data: {}
            }))
    }

    return { save, remove, get, getById, getCategoriesTree }

}