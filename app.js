var express = require('express');
var configurations = module.exports;
var app = express();
var server = require('http').createServer(app);
var nconf = require('nconf');
var settings = require('./settings')(app, configurations, express);
var Parallax = require('meatspace-parallax');
var parallax = {};

nconf.argv().env().file({ file: 'local.json' });

// Filters for routes
var isLoggedIn = function(req, res, next) {
  if (req.session.email) {
    if (!parallax[req.session.email]) {
      parallax[req.session.email] = new Parallax(req.session.user, {
        db: nconf.get('db') + '/users/' + req.session.email
      });
    }

    next();
  } else {
    res.status(400);
    next(new Error('Not logged in'));
  }
};

require('express-persona')(app, {
  audience: nconf.get('domain') + ':' + nconf.get('authPort')
});

// routes
require('./routes')(app, nconf, parallax, isLoggedIn);

app.listen(process.env.PORT || nconf.get('port'));
