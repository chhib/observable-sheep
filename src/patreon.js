const fetch = require('node-fetch')
const fs = require('fs')
require('dotenv').config();

const clientId = process.env.PATREON_CLIENT_ID
const clientSecret = process.env.PATREON_CLIENT_SECRET
let accessToken = process.env.PATREON_ACCESS_TOKEN
let refreshToken = process.env.PATREON_REFRESH_TOKEN
let expires = process.env.PATREON_EXPIRES

const getTokensExpiration = () => {
  return new Promise ((resolve, reject) => {
    if (!expires) {
      reject('No expires in environment variable')
      return;
    }
    if (expires < Date.now()) {
      reject('Time has expired')
      return;
    }
    resolve(expires)
  })
}

const refreshTokensAndGetExpiration = (error) => {
  (process.env.NODE_ENV !== 'production') && console.log(`Got error: ${error}. Attempting to refresh tokens.`)
  const url = `https://www.patreon.com/api/oauth2/token` +
    `?grant_type=refresh_token` + 
    `&refresh_token=${refreshToken}` +
    `&client_id=${clientId}` +
    `&clientSecret=${clientSecret}`
  return fetch(url, {method: 'POST'})
    .then(response => response.json())
    .then(body => {
      accessToken = body.access_token
      refreshToken = body.refresh_token
      expires = body.expires_in*1000 + Date.now()
      return new Promise((resolve, reject) => {
        if (process.env.NODE_ENV !== 'production') {
          const file = `PATREON_CLIENT_ID=${clientId}\n` +
            `PATREON_CLIENT_SECRET=${clientSecret}\n` +
            `PATREON_ACCESS_TOKEN=${accessToken}\n` +
            `PATREON_REFRESH_TOKEN=${refreshToken}\n` +
            `PATREON_EXPIRES=${expires}`
            
          fs.writeFile('.env', file, (err) => {
            if (err) reject(err);
            else resolve(expires);
          })
        } else {
          resolve(expires)
        }
      })})
}

this.fetch = async (url) => {
  if (url.indexOf('access_token=') < 0) {
    url = `${url}&access_token=${accessToken}`
  }
  (process.env.NODE_ENV !== 'production') && console.log(`Fetching: ${url}`)
  return getTokensExpiration()
    .catch(refreshTokensAndGetExpiration)
    .then(() => fetch(url))
    .then(response => response.json())
}