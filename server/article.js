const db = require('./db')

const app = require('express')()

app.post('/create', async(req, res) => {
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
            published_date: new Date().toISOString()
        }
    })

    res.status(200).send(article)
})

app.get('/read', async(req, res) => {
    let filter = {}
    if (!req.user.isAdmin) filter = { user_id: req.user.id }

    let articles = await db.article.findMany({
        where: filter,
        orderBy: {
            published_date: 'asc'
        }
    })

    return res.send(articles)
})

app.post('/update/:id', async(req, res) => {
    let id = parseInt(req.params.id)

    if (typeof(id) !== 'number') {
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
})

app.post('/hide', async(req, res) => {
    try {
        let filter = {}
        if (!req.user.isAdmin) filter = { user_id: req.user.id }

        await db.article.update({
            where: {
                id: req.body.ids,
                ...filter
            },
            data: {
                hidden: true
            }
        })

        res.status(200).send()
    } catch {
        res.status(400).send()
    }
})


module.exports = app