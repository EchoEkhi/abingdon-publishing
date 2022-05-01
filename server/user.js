const app = require('express')()
const jwt = require('jsonwebtoken')
const db = require('./db')

app.post('/', async(req, res) => {
    try {
        const user = await db.user.findUnique({
            where: {
                name: req.body.name
            }
        })

        if (user.access_token === req.body.token) {
            res.status(200).send(jwt.sign({
                id: user.id,
                publisher: user.publisher,
                isAdmin: user.is_admin
            }, process.env.JWT_SECRET, {
                expiresIn: '6h'
            }))
        } else {
            res.status(401).send()
        }
    } catch {
        return res.status(401).send()
    }

})

module.exports = app