Small server used to retrieve Patreon pledges to visualize using Observable.

Authentication is done through Auth0, which if correct sets a cookie that's valid for 30 minutes for using CORS requests.

```
heroku create mybackend
heroku config:set AUTH0_X=X
...
heroku config:set PATREON_X=X
...
git push heroku master
```

You should now be able to go to http://mybackend.herokuapp.com/login, after that make requests to the end points.


### TODO
- Add YouTube auth and data fetch endpoint