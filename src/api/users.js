const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
    const {
        existsOrError,
        notExistsOrError,
        equalsOrError
    } = app.src.api.validation

    const encryptPassword = (password) => {
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(password, salt)
    }

    // criar ou atualizar usuário
    const save = async (req, res) => {
        console.log('[Create/Update user]')
        const user = { ...req.body }

        // se for atualização do usuário
        if (req.params.id) {
            user.id = req.params.id
        }

        // se o cadastro não é dado pela rota /users -> NÃO PODE SER ADMIN
        if (!req.originalUrl.startsWith('/users')) user.admin = false
        if (!req.user || !req.user.admin) user.admin = false

        try {
            existsOrError(user.name, "Nome não informado.")
            existsOrError(user.email, "E-mail não informado.")
            existsOrError(user.password, "Senha não informada.")
            existsOrError(user.passwordConfirm, "Confirmação de senha não informada.")
            equalsOrError(user.password, user.passwordConfirm, 'Senhas fornecidas não são equivalentes.')

            const dbUser = await app.db('users')
                .where({ email: user.email })
                .first()

            // se NÃO tiver id, verifica se já existe o usuário
            if (!user.id) notExistsOrError(dbUser, "Usuário já cadastrado.")

        } catch (error) {
            // para qualquer erro, envia a resposta
            return res.status(400)
                .json({
                    status: 400,
                    msg: error,
                    data: {}
                })
        }

        user.password = encryptPassword(user.password)

        delete user.passwordConfirm

        // se tiver id, atualiza
        if (user.id) {
            app.db('users')
                .update(user)
                .where({ id: user.id })
                .whereNull('deletedAt')
                .then(_ => res.status(200).json({
                    status: 200,
                    msg: "Usuário atualizado com sucesso!",
                    data: user
                }))
                .catch(err => res.status(500).json({
                    status: 500,
                    msg: err,
                    data: {}
                }))
        }

        app.db('users')
            .insert(user)
            .then(_ => res.status(201).json({
                status: 201,
                msg: "Usuário criado com sucesso!",
                data: user
            }))
            .catch(err => res.status(500).json({
                status: 500,
                msg: err,
                data: {}
            }))

    }

    const get = (req, res) => {
        console.log('[Get users]')

        app.db('users')
            .select('id', 'name', 'email', 'admin')
            .whereNull('deletedAt')
            .then(users => res.status(200).json({
                status: 200,
                msg: "",
                data: users
            }))
            .catch(err => res.status(500).json({
                status: 500,
                msg: err,
                data: {}
            }))
    }

    const getById = async (req, res) => {
        console.log('[Get user by id]')

        const userId = req.params.id

        const dbUser = await app.db('users')
            .select('id', 'name', 'email', 'admin')
            .where({ id: userId })
            .whereNull('deletedAt')
            .first()

        if (!dbUser) {
            res.status(404).json({
                status: 404,
                msg: "Usuário não encontrado.",
                data: {}
            })
        }

        res.status(200).json({
            status: 200,
            msg: "Usuário encontrado.",
            data: dbUser
        })

    }

    // soft delete
    const remove = async (req, res) => {
        console.log('[Remove user]')

        const userId = req.params.id

        try {
            existsOrError(userId, "Código do usuário não informado.")

            const articles = await app.db('articles')
                .where({ userId: userId })
            notExistsOrError(articles, "Usuário possui artigos.")

            const modifiedRows = await app.db('users')
                .update({ deletedAt: new Date() })
                .where({ id: userId })
                .whereNull('deletedAt')
            existsOrError(modifiedRows, "Usuário não encontrado.")

            res.status(204).json({
                status: 204,
                msg: "Usuário excluído com sucesso!",
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

    return { save, get, getById, remove }
}