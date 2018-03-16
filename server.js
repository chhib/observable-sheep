const express = require('express')
require('dotenv').config();
const cors = require('cors')
const cookieParser = require('cookie-parser')
const jwt = require('express-jwt')
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');
const patreon = require('./src/patreon')
const authenticate = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://maximumsheep.eu.auth0.com/.well-known/jwks.json`
  }),
  // Have to comment out audience to make it work according to https://github.com/auth0-blog/nodejs-jwt-authentication-sample/issues/30
  // audience: 'https://maximumsheep.eu.auth0.com/api/v2/',
  issuer: `https://maximumsheep.eu.auth0.com/`,
  algorithms: ['RS256'],
  getToken: (req) => {
    if (req.cookies && req.cookies.auth0JWT) {
      return req.cookies.auth0JWT;
    }
    return null;
  }
});

const app = express()
app.use(cookieParser('secret123'))
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true)
  },
  credentials: true
}))

app.get('/login', (req, res) => res.sendFile(__dirname + '/login.html'))

app.get('/pledges', authenticate, function (req, res) {
  res.json([
    {name: 'david', pledge: {amount: 2, currency: 'USD'}}, 
    {name: 'mpj', pledge: {amount: 1, currency: 'SEK'}}
  ])
})

app.get('/patreon', authenticate, (req, res) => {
  if (!req.query.query) {
    res.status(401).send('Must provide a ?query')
    return;
  }
  patreon
    .fetch(req.query.query)
    .then(data => res.json(data))
    .catch(error => res.status(401).send(error.name))
})

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    // this error is what express-jwt throws 
    // when the request doesn't contain a correct header
    res.status(401).send('Request must contain a valid authorization header with a Bearer JWT token');
  } else {
    next(err)
  }
});

app.use(function(req, res, next) {
  res.status(404).send('Not Found');
});

const port = process.env.PORT || 8888
app.listen(port, () => {
  console.log(`Listening on port ${port}. /login to get authed for /pledges.`)
})