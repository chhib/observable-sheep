Small server used to retrieve Patreon pledges to visualize using Observable.

Authentication is done by providing a key, which if correct sets a cookie that's valid for 30 minutes.

```
heroku create mybackend
heroku config:set OBSERVABLE_AUTHENTICATION_KEY=abc123
git push heroku master
```

You should now be able to go to http://mybackend.herokuapp.com/auth?key=abc123 and if your key matches the OBSERVABLE_AUTHENTICATION_KEY, it will allow you to access **/pledges**.


### TODO
- Use a session cookie instead of the key as cookie value
- Add sign-in instead of key as GET parameter (Auth0?)
- Add Patreon auth and data fetches
- Add YouTube auth and data fetches