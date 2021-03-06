var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session')
var bodyParser = require('body-parser');
require('dotenv').load();
var routes = require('./routes/index');
var users = require('./routes/users');


var key1 = (process.env.KEY1);
var key2 = (process.env.KEY2);
var key3 = (process.env.KEY3);

var app = express();


//cookie setup
app.enable('trust proxy')
app.set('trust proxy', 1) // trust first proxy
app.use(cookieSession({
  name: 'session',
  keys: [key1, key2, key3]
}))


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var setUserNameLocal = function (req, res, next) {
  res.locals.currentUser = req.session.user
  next()
}
app.use(setUserNameLocal)
app.use('/', routes);
app.use('/users', users);

app.use(function(req, res, next){
  console.log("*********",req.session.user);
  if(req.session.user || req.session.user === undefined) {
    next();
  } else {
    res.redirect('/login');
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

if (app.get('env') === 'production') {
  app.listen(3000);
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
