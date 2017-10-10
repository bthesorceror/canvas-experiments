const path = require('path')
const express = require('express')

let port = process.env.PORT || 4000
let app = express()

app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.render('index')
})

app.use(
  '/public',
  express.static(path.join(__dirname, 'public'))
)

app.listen(port, () => {
  console.info(`Now listening on port ${port}`)
})
