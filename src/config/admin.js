module.exports = middleware => {
    return (req, res, next) => {
        if (req.user.admin) {
            middleware(req, res, next)
        } else {
            return res.status(403)
                .json({
                    status: 403,
                    msg: "Acesso exclusivo para admin.",
                    data: {}
                })
        }
    }
}