const models = require('../models/model.js');

const parseCookies = (req, res, next) => {
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