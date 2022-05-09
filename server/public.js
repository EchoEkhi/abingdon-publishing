const db = require('./db')
const app = require('express')()

app.get('/file/:path', async (req, res) => {

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

//setting view engine to ejs
app.set("view engine", "ejs")

app.get('/embed', async (req, res) => {

    const articles = await db.article.findMany({
        take: 3,
        select: {
            title: true,
            author: true,
            publisher: true,
            description: true,
            page: true,
            file: {
                select: {
                    path: true
                }
            }
        },
        where: {
            showing: true,
            hidden: false
        }
    })

    res.render('embed', { articles })
})

module.exports = app