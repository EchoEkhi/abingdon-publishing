const db = require('./db')
const log = require('./logger')
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

    res.set('content-type', 'application/pdf')
    res.set('Access-Control-Allow-Origin', '*')

    res.status(200).send(Buffer.from(file.file))

    log.info(`[public/file] ${ req.params.path } accessed`)

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
            description_html: true,
            page: true,
            featured: true,
            file: {
                select: {
                    path: true
                }
            }
        },
        where: {
            showing: true,
            hidden: false
        },
        orderBy: {
            featured: 'desc'
        }
    })

    res.setHeader('Access-Control-Allow-Origin', '*')

    res.render('embed', { articles })

    log.info(`[public/embed] embed accessed`)

})

app.get('/publisher/:name', async (req, res) => {

    if (req.params.name === undefined) return res.status(400).send()

    const publisher = await db.user.findUnique({
        select: {
            id: true
        },
        where: {
            name: req.params.name
        }
    })

    if (publisher === null) return res.status(400).send()

    const file = await db.file.findMany({
        select: {
            path: true
        },
        where: {
            user_id: publisher.id
        },
        orderBy: {
            id: 'desc'
        },
        take: 1
    })

    if (file === null || file[0].path === null) return res.status(400).send()

    res.redirect(`/api/public/file/${ file[0].path }`)

    log.info(`[public/publisher] ${ req.params.name } accessed`)

})

module.exports = app