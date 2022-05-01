require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors')
const db = require('./db')

const app = express()

db.$connect()

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

app.listen(process.env.PORT, () => console.log('Server running'))