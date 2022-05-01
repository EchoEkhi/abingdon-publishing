const express = require('express')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')

const app = express()

function checkAuth(req, res, next) {
    cookieParser()(req, res, () => null)
    if (!req.cookies || !req.cookies.auth) return res.status(401).send()

    jwt.verify(req.cookies.auth, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send()
        } else {
            req.user = {
                id: decoded.id,
                publisher: decoded.publisher,
                isAdmin: decoded.isAdmin
            }
            return next()
        }
    })
}

app.use('/login', require('./user'))

app.use('/article', checkAuth, require('./article'))
app.use('/file', checkAuth, require('./file'))
app.use('/public', require('./public'))


module.exports = app