const express = require('express')
const app = express()
const router = express.Router()
const aggregator = require('./src/aggregator');
const port = 3000

app.use(express.json())
app.use('/', router)

router.get('/v1/aggregator', aggregator.validate(), aggregator.compute);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
