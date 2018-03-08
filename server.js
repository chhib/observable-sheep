const express = require('express')
const cookieParser = require('cookie-parser')
require('dotenv').config();
const app = express()

const secretKey = process.env.OBSERVABLE_AUTHENTICATION_KEY

if (!secretKey) {
  console.log('Need secret set to environment variable OBSERVABLE_AUTHENTICATION_KEY.')
  return;
}

app.use(cookieParser())
app.get('/pledges', function (req, res) {
  // Need authentication cookie
  if (req.cookies['observable-authentication-cookie'] !== secretKey) {
    res.status(500).send('Need authentication.')
    return; 
  }
  // Here you go
  res.json(req.cookies)
})
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

const port = process.env.PORT || 8888
app.listen(port, () => {
  console.log(`Listening on port ${port}. Go /auth to set the cookie used for /pledges.`)
})