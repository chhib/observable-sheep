const fetch = require('node-fetch')
let googleTokenJSON = JSON.parse(process.env.GOOGLE_TOKEN_JSON)
const { GoogleToken } = require('gtoken');
const gtoken = new GoogleToken({
  email: googleTokenJSON.client_email,
  key: googleTokenJSON.private_key,
  scope: ['https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
    'https://www.googleapis.com/auth/yt-analytics.readonly']
});

this.fetch = async (url) => {
  (process.env.NODE_ENV !== 'production') && console.log(`Fetching: ${url}`)
  return gtoken.getToken()
    .then(token => fetch(url, {headers: { Authorization: `Bearer ${token}` }}))
    .then(response => response.json())
}