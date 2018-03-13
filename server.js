const express = require('express')
require('dotenv').config();
const app = express()
const cors = require('cors')
const uuidv1 = require('uuid/v1')
const cookieParser = require('cookie-parser')

const secretKey = process.env.OBSERVABLE_AUTHENTICATION_KEY

if (!secretKey) {
  console.log('Need secret set to environment variable OBSERVABLE_AUTHENTICATION_KEY.')
  return;
}

let sessions = []
const isAllowed = (id) => {
  return sessions.some(session => (session.expiresAt >= Date.now() && session.id === id)) 
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
    res.status(403).send('Authenticate with /auth?key=THEKEY')
    return;
  }
  if (req.query['key'] === secretKey) {
    const sessionId = uuidv1()
    const timeout = 30*60*1000
    sessions.push({id: sessionId, expiresAt: Date.now() + timeout})
    res.cookie('observable-authentication-cookie', 
      sessionId, { 
        maxAge: timeout,
        httpOnly: true
      }
    )
    res.status(200).send('Set a cookie valid for 30 minutes, thanks.')
    return;
  }
  res.status(200).send('Got it, thanks.')
})

app.get('/pledges', function (req, res) {
  // Need authentication cookie
  if (!req.cookies['observable-authentication-cookie'] ||
      !isAllowed(req.cookies['observable-authentication-cookie'])) {
    res.status(403).send('Not Allowed')
    return; 
  }
  // Here you go
  res.json([
    {name: 'david', pledge: {amount: 2, currency: 'USD'}}, 
    {name: 'mpj', pledge: {amount: 1, currency: 'SEK'}}
  ])
})

app.use(function(req, res, next) {
  res.status(404).send('Not Found');
});

const port = process.env.PORT || 8888
app.listen(port, () => {
  console.log(`Listening on port ${port}. Go /auth to set the cookie used for /pledges.`)
})