const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const Auth = require('./middleware/auth');
const models = require('./models');
//const cookieParser = require('./middleware/cookieParser.js');

const app = express();
const router = express.Router();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
// app.use(cookieParser);
// app.use(Auth.createSession);


app.get('/',
(req, res) => {
  res.render('index');
});

app.get('/create',
(req, res) => {
  res.render('index');
});

app.get('/links',
(req, res, next) => {
  models.Links.getAll()
    .then(links => {
      res.status(200).send(links);
    })
    .error(error => {
      res.status(500).send(error);
    });
});

app.post('/links',
(req, res, next) => {
  var url = req.body.url;
  if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
    return res.sendStatus(404);
  }

  return models.Links.get({ url })
    .then(link => {
      if (link) {
        throw link;
      }
      return models.Links.getUrlTitle(url);
    })
    .then(title => {
      return models.Links.create({
        url: url,
        title: title,
        baseUrl: req.headers.origin
      });
    })
    .then(results => {
      return models.Links.get({ id: results.insertId });
    })
    .then(link => {
      throw link;
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(link => {
      res.status(200).send(link);
    });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/


app.post('/signup', function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  return models.Users.get({username: req.body.username})
    .then(data => {
      if (data === undefined) {
        models.Users.create({ username, password });
        res.redirect('/');
      } else {
        res.redirect('/signup');
      }
    })
    .then(() => {
      res.end();
    });
});

app.post('/login', function (req, res, next) {
  // if the user exists, then we can log in. We will need to compare the user data
  // if not, redicrect to login
  var inputUsername = req.body.username;
  var inputPassword = req.body.password;
  return models.Users.get({username: inputUsername})
    .then(data => {
      if (data === undefined) {
        res.redirect('/login');
      } else if (models.Users.compare(inputPassword, data.password, data.salt)) {
        res.redirect('/');
      } else if (!models.Users.compare(inputPassword, data.password, data.salt)) {
        res.redirect('/login');
      }
    })
    .then(() => {
      res.end();
    });
});



/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
