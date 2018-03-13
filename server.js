const express = require('express')
require('dotenv').config();
const app = express()
const moment = require('moment')
const cors = require('cors')

const secretKey = process.env.OBSERVABLE_AUTHENTICATION_KEY

if (!secretKey) {
  console.log('Need secret set to environment variable OBSERVABLE_AUTHENTICATION_KEY.')
  return;
}

app.use(cookieParser('secret123'))
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true)
  },
  credentials: true
}))

app.get('/auth', function (req, res) {
  if (!req.query['key']) {
    res.status(500).send('Authenticate with /auth?key=THEKEY')
    return;
  }
  res.cookie('observable-authentication-cookie', 
    req.query['key'], { 
      expires: new Date(Date.now() + 30*60*1000), 
      httpOnly: true
    }
  )
  res.status(200).send('Got it, thanks.')
})

app.get('/pledges', function (req, res) {
  // Need authentication cookie
  if (req.cookies['observable-authentication-cookie'] !== secretKey) {
    res.status(500).send('Need authentication.')
    return; 
  }
  // Here you go
  res.json([
    {name: 'david', pledge: {amount: 2, currency: 'USD'}}, 
    {name: 'mpj', pledge: {amount: 1, currency: 'SEK'}}
  ])
})

const port = process.env.PORT || 8888
app.listen(port, () => {
  console.log(`Listening on port ${port}. Go /auth to set the cookie used for /pledges.`)
})