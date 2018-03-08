Small server used to retrieve Patreon pledges to visualize using Observable.

Authentication is done through a cookie which has to match a secret key set in an environment variable.


```
heroku create mybackend
heroku config:set OBSERVABLE_AUTHENTICATION_KEY=abc123
git push heroku master
```

You should now be able to go to http://mybackend.herokuapp.com/auth?key=abc123 and if your key matches the OBSERVABLE_AUTHENTICATION_KEY, it will set a cookie to validate your browser.


### TODO

- Set a unique generated session key for that browser session per user
- Return some fake data
- Set up Patreon auth and data fetchess