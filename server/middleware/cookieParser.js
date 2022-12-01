const models = require('../models/model.js');

const parseCookies = (req, res, next) => {
  //write a middleware function that will access the cookies on an incoming request,
  //parse them into an object, and
  //assign this object to a cookies property on the request.

  // cookies: {},
  // headers: { cookie: 'shortlyid=8a864482005bcc8b968f2b18f8f7ea490e577b20' },
  //let parsed = JSON.parse(req.headers.cookie);

  //request with cookies
  //request without cookies
  //request with multiple cookies

  var reqCookies = req.headers.cookie;
  var parsedObject = {};

  if (reqCookies === undefined) {
    req.cookies = '';
  } else {
    var splitString = reqCookies.split('; ');
    for (var i = 0; i < splitString.length; i++) {
      var newSplit = splitString[i].split('=');
      parsedObject[newSplit[0]] = newSplit[1];
    }
  }
  req.cookies = parsedObject;
  next();
};

module.exports = parseCookies;