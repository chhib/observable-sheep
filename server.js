const express = require('express')
require('dotenv').config();
const app = express()
const iputil = require('ip')
const ipfilter = require('express-ipfilter').IpFilter
const moment = require('moment')
const IpDeniedError = require('express-ipfilter').IpDeniedError
const cors = require('cors')

const secretKey = process.env.OBSERVABLE_AUTHENTICATION_KEY
let allowedIPs = []

if (!secretKey) {
  console.log('Need secret set to environment variable OBSERVABLE_AUTHENTICATION_KEY.')
  return;
}

const ips = () => {
  let uniqueAllowedIPs = [...(new Set(allowedIPs.filter(connection => connection.expiresAt >= Date.now()).map(({ ip }) => ip)))]
  return uniqueAllowedIPs
}

// Validate provided key and add IP to list if it it matches server key
const validateAuthenticationKey = (req) => {
  if (req.query['key'] !== secretKey) {
    return `Got it, thanks.`
  }

  const formatIp = (req) => {
    let ipAddress = req.connection.remoteAddress
    if (iputil.isV6Format(ipAddress) && ~ipAddress.indexOf('::ffff')) {
      ipAddress = ipAddress.split('::ffff:')[1];
    }
    if (iputil.isV4Format(ipAddress) && ~ipAddress.indexOf(':')) {
      ipAddress = ipAddress.split(':')[0];
    }
    return ipAddress
  }
  const allowedConnection = {ip: formatIp(req), expiresAt: Date.now() + 30*60*1000}
  allowedIPs.push(allowedConnection)
  let message = `Got it, thanks. ${allowedConnection.ip} is allowed ` +
    `until ${moment(new Date(allowedConnection.expiresAt)).format('YYYY-MM-DD HH:mm')}.`
  return message
}

// If proper key is provided, add IP to list of allowed IPs
app.get('/auth', function (req, res) {
  if (!req.query['key']) {
    res.status(403).send('Authenticate with /auth?key=THEKEY')
    return;
  }
  let message = validateAuthenticationKey(req)
  res.status(200).send(message)
})

// Only allow access to endpoint if in list of allowed IPs
app.use('/pledges', cors())
app.get('/pledges', ipfilter(ips, {mode: 'allow', logLevel: 'all'}), function (req, res) {
  // Here you go
  res.json([
    {name: 'david', pledge: {amount: 2, currency: 'USD'}}, 
    {name: 'mpj', pledge: {amount: 1, currency: 'SEK'}}
  ])
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
app.use(function(err, req, res, _next) {
  console.log(err.status, err.message);
  res.status(err.status || 500);
  res.send(err.message);
});

// allow other services to fetch data


const port = process.env.PORT || 8888
app.listen(port, () => {
  console.log(`Listening on port ${port}. Go /auth to set the cookie used for /pledges.`)
})
