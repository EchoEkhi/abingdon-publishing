const db = require('./db')
const app = require('express')()

app.get('/file/:path', async(req, res) => {

    const file = await db.file.findUnique({
        select: {
            file: true
        },
        where: {
            path: req.params.path
        }
    }).catch(() => res.status(400).send())

    if (file === null) return res.status(400).send()

    res.status(200)
        .setHeader('content-type', 'application/pdf')
        .setHeader('Cache-Control', 'public, max-age=86400')
        .setHeader('Access-Control-Allow-Origin', '*')
        .send(Buffer.from(file.file))

})

module.exports = app