const db = require('./db')
const log = require('./logger')

const app = require('express')()

app.post('/create', async (req, res) => {
    let article = req.body

    // check for required attributes
    if (article.title === undefined) return res.status(400).send()

    // commit to db
    article = await db.article.create({
        data: {
            title: article.title,
            author: article.author,
            publisher: article.publisher,
            description: article.description,
            file_id: article.file_id,
            page: article.page,
            user_id: req.user.id,
            published_date: new Date().toISOString()
        }
    })

    res.status(200).send(article)

    log.info(`[article/create] ${req.user.publisher} created ${article.title}`)

})

app.get('/read', async (req, res) => {
    let filter = {}
    if (!req.user.isAdmin) filter = { user_id: req.user.id }

    let articles = await db.article.findMany({
        where: {
            hidden: false,
            ...filter
        },
        orderBy: {
            published_date: 'desc'
        }
    })

    res.send(articles)

    log.info(`[article/read] ${req.user.publisher} read article list`)

})

app.post('/update/:id', async (req, res) => {
    let id = parseInt(req.params.id)

    if (typeof (id) !== 'number') {
        return res.status(400).send()
    }

    let article = await db.article.findUnique({
        where: {
            id
        }
    })

    if (article === null) return res.status(400).send()

    let new_article = req.body

    if (!req.user.isAdmin && article.user_id !== req.user.id) return res.status(400).send()

    await db.article.update({
        where: {
            id
        },
        data: {
            title: new_article.title,
            author: new_article.author,
            description: new_article.description,
            file_id: new_article.file_id,
            page: new_article.page
        }
    }).catch(() => res.status(400).send())

    res.status(200).send()

    log.info(`[article/update] ${req.user.publisher} updated ${new_article.title}`)

})

app.post('/hide', async (req, res) => {
    try {
        if (req.body.ids.length === 0) return res.status(400).send()

        let filter = {}
        if (!req.user.isAdmin) filter = { user_id: req.user.id }

        let hide_session = Math.random().toString().substring(2, 8)

        await db.article.updateMany({
            where: {
                id: {
                    in: req.body.ids
                },
                ...filter
            },
            data: {
                hidden: true,
                hide_session
            }
        })

        res.status(200).send()

        log.info(`[article/hide] ${req.user.publisher} hid ${req.body.ids} in session ${hide_session}`)

    } catch {
        res.status(400).send()
    }
})

app.get('/undo-hide/:session', async (req, res) => {
    try {
        await db.article.updateMany({
            where: {
                hide_session: req.params.session
            },
            data: {
                hidden: false,
                hide_session: ''
            }
        })

        res.status(200).send('Undo success.')

        log.info(`[article/undo_hide] ${req.user.publisher} undid hide session ${req.params.session}`)

    } catch {
        res.status(400).send('Undo failed.')
    }
})

module.exports = app