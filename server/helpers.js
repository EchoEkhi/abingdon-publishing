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

    // find articles that should be shown, show not exposed articles first
    let ids = await db.$queryRaw`SELECT id FROM article WHERE hidden = false ORDER BY random() LIMIT 3`

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