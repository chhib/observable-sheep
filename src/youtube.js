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


gtoken.getToken()
  .then(token => {
    console.log(token)
    return fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=UCO1cgjhGzsSYb1rsB4bFe4Q`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  })
  .then(response => response.json())
  .then(body => {
    console.log('fick jag nåt?')
    console.log(body.items.map(itm => itm.contentDetails))
  })
  .catch(e => console.error);

this.printToken = () => {
  console.log(googleToken)
}