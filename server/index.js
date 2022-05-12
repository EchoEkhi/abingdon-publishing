require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors')
const cron = require('cron')
const db = require('./db')
const log = require('./logger')

// run every weekday at 20 seconds past midnight
new cron.CronJob('20 0 0 * * 1-5', require('./helpers').newRecommendations, null, true)

const app = express()

db.$connect()

app.use('/assets', express.static('assets'))

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.use('/api', require('./routes'))

if (process.env.MODE === 'production') {

    const history = require('connect-history-api-fallback')

    const staticFileMiddleware = express.static('public')

    app.use(staticFileMiddleware)
    app.use(history({
        disableDotRule: true
    }))
    app.use(staticFileMiddleware)

}

app.listen(process.env.PORT, () => log.warn('Server running'))