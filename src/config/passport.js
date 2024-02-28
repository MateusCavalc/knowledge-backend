const { authConfig } = require('../../.env')

const passport = require('passport')
const passportJwt = require('passport-jwt')
const { Strategy, ExtractJwt } = passportJwt

module.exports = app => {
    const strategyParams = {
        secretOrKey: authConfig.secret,
        // pega o jwt do header (authentication: bearer [token])
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    }

    const strategy = new Strategy(strategyParams, (payload, done) => {
        // só entra se for um token válido!
        app.db('users')
            .where({ id: payload.id })
            .first()
            .then(user => {
                // null -> sem erro
                // e retorna o usuário do payload
                done(null, user ?
                    {
                        id: payload.id,
                        email: payload.email,
                        admin: payload.admin,
                    } : false)
            })
            .catch(err => {
                done(err, false)
            })
    })

    passport.use(strategy)

    return {
        authenticate: (req, res, next) => {
            console.log('[Authenticate]')
            passport.authenticate('jwt', { session: false }, (err, user) => {
                if (err || !user) {
                    return res.status(401)
                        .json({
                            status: 401,
                            msg: "Acesso não autorizado.",
                            data: {}
                        })
                }

                req.user = user
                next()

            })(req, res, next)
        }
    }

}
