# Node wrapper for Trello’s HTTP API.
[![Build Status](https://travis-ci.org/adunkman/node-trello.png?branch=master)](https://travis-ci.org/adunkman/node-trello)

[View Trello’s API documentation online][apidocs]. For information on Trello’s API development, visit [their Trello board][trellotrello], of course.

[apidocs]: https://trello.com/docs/
[trellotrello]: https://trello.com/board/trello-public-api/4ed7e27fe6abb2517a21383d

## Install
```
npm install node-trello
```

### Getting your key and token
* [Generate your developer key][devkey] and supply it as the first constructor parameter.
* To read a user’s private information, get a token by directing them to `https://trello.com/1/connect?key=<PUBLIC_KEY>&name=MyApp&response_type=token` replacing, of course, &lt;PUBLIC_KEY&gt; with the public key obtained in the first step.
* If you never want the token to expire, include `&expiration=never` in the url from the previous step.
* If you need write access as well as read, `&scope=read,write` to the request for your user token.

[devkey]: https://trello.com/1/appKey/generate

## Example Code
```javascript
var Trello = require("node-trello");
var t = new Trello("<your key>", "<token>");

t.get("/1/members/me", function(err, data) {
  if (err) throw err;
  console.log(data);
});

// URL arguments are passed in as an object.
t.get("/1/members/me", { cards: "open" }, function(err, data) {
  if (err) throw err;
  console.log(data);
});
```

## License

Released under [MIT](https://github.com/adunkman/node-trello/blob/master/LICENSE.md).
