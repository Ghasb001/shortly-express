const models = require('../models');
const Promise = require('bluebird');
const mysql = require('mysql2');
const db = mysql.createConnection({
  user: 'root',
  password: '',
  database: 'shortly'
});



/*
write a createSession middleware function that accesses the parsed cookies on the request,
looks up the user data related to that session,
and assigns an object to a session property on the request that contains relevant user information.
(Ask yourself: what information about the user would you want to keep in this session object?)
*/

module.exports.createSession = (req, res, next) => {
  if (Object.values(req.cookies).length === 0) {
    return models.Sessions.create()
      .then((dataId) => {
        var currentId = dataId.insertId;
        return models.Sessions.get({id: currentId})
          .then((sessionId) => {
            req.session = sessionId;
            res.cookie('shortlyid', sessionId.hash);
            db.query('SELECT * FROM users', function (err, result) {
              if (err) {
                throw err;
              }
              // sessionId.userId = result.id;
              var here = JSON.stringify(result);
              here = JSON.parse(here);
              if (typeof here[0] === 'object' && here[0] !== null) {
                sessionId.userId = Object.values(here[0])[0];
              }
            });
            //set a variable equal to the query result of looking for the user in the users table
            //insert the sessionId into sessions table sessionId.id and .hash and .userId
            db.query('INSERT INTO sessions (hash) VALUES ("' + sessionId.hash + '")', function(err, result) {
              if (err) {
                throw err;
              } else {
                console.log('session inserted into table');
              }
            });
            //db.query(`INSERT INTO sessions (id, hash, userId) VALUES (${sessionId.id}, ${sessionId.hash}, ${sessionId.userId})`);

            next();
          });
      });
  } else {
    //console.log(req.cookies.shortlyid);
    return models.Sessions.get({hash: req.cookies.shortlyid})
      .then((cookieData) => {
        if (!cookieData) {
          return models.Sessions.create()
            .then((dataId) => {
              var currentId = dataId.insertId;
              return models.Sessions.get({ id: currentId })
                .then((sessionId) => {
                  req.session = sessionId;
                  res.cookie('shortlyid', sessionId.hash);
                  //db.query('INSERT INTO sessions (id, hash, userId) VALUES ("' + sessionId.id + '", "' + sessionId.hash + '"", "' + sessionId.userId + '")');
                  db.query('INSERT INTO sessions (hash) VALUES ("' + sessionId.hash + '")', function(err, result) {
                    if (err) {
                      throw err;
                    } else {
                      console.log('session inserted into table');
                    }
                  });
                  next();
                });
            });
        } else {
          req.session = cookieData;
          next();
        }
      });

  }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

