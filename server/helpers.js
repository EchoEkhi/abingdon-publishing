const db = require("./db")
const log = require('./logger')

async function newRecommendations() {

    // stop showing old articles
    await db.article.updateMany({
        where: {
            showing: true
        },
        data: {
            showing: false
        }
    })

    let ids = []

    // find 1 featured article that should be shown, show not exposed articles first, and randomly select
    ids = ids.concat(await db.$queryRaw`SELECT id FROM article WHERE hidden = false AND featured = true ORDER BY exposures ASC, random() LIMIT 1`)
    // find 2 non-featured articles that should be shown, show not exposed articles first, and randomly select
    ids = ids.concat(await db.$queryRaw`SELECT id FROM article WHERE hidden = false AND featured = false ORDER BY exposures ASC, random() LIMIT 2`)

    ids = ids.map(id => id.id)

    // show those articles
    await db.article.updateMany({
        where: {
            id: {
                in: ids
            }
        },
        data: {
            showing: true,
            exposures: {
                increment: 1
            }
        }
    })

    log.info('[helpers] new recommendations created.')

}

module.exports = { newRecommendations }