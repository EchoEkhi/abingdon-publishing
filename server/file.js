const db = require('./db')
const fileUpload = require('express-fileupload')
const log = require('./logger')
const app = require('express')()

app.post('/create', async (req, res) => {
    let file = req.body

    // check for required attributes
    if (file.name === undefined) return res.status(400).send()

    file.path = file.name.replace(/[^a-z0-9_]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() + '.pdf'

    // commit to db
    try {
        file = await db.file.create({
            data: {
                name: file.name,
                path: file.path,
                user_id: req.user.id
            }
        })
    } catch (e) {
        return res.status(400).send()
    }

    res.status(200).send(file)

    log.info(`[file/create] ${req.user.publisher} created ${file.name}`)

})

app.get('/read', async (req, res) => {
    let filter = {}
    if (!req.user.isAdmin) filter = { user_id: req.user.id }

    let file = await db.file.findMany({
        select: {
            id: true,
            name: true,
            path: true
        },
        where: filter,
        orderBy: {
            id: 'desc'
        }
    })

    res.send(file)

    log.info(`[file/read] ${req.user.publisher} read file list`)

})

app.post('/update/:id', async (req, res) => {
    let id = parseInt(req.params.id)

    if (typeof (id) !== 'number') {
        return res.status(400).send()
    }

    let file = await db.file.findUnique({
        where: {
            id
        }
    })

    if (file === null) return res.status(400).send()

    let newFile = req.body

    newFile.path = newFile.name.replace(/[^a-z0-9_]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() + '.pdf'

    if (!req.user.isAdmin && file.user_id !== req.user.id) return res.status(400).send()

    await db.file.update({
        where: {
            id
        },
        data: {
            name: newFile.name,
            path: newFile.path
        }
    }).catch(err => res.status(400).send())

    res.status(200).send()

    log.info(`[file/update] ${req.user.publisher} updated ${file.name}`)

})

app.post('/upload/:id', fileUpload(), async (req, res) => {

    let id = parseInt(req.params.id)

    if (typeof (id) !== 'number') {
        return res.status(400).send()
    }

    await db.file.update({
        where: {
            id
        },
        data: {
            file: req.files.file.data
        }
    }).catch(err => res.status(400).send())

    res.status(200).send()

    log.info(`[file/upload] ${req.user.publisher} uploaded ${req.params.id}`)

})

module.exports = app