var express = require('express');
var bcrypt = require('bcryptjs');

var router = express.Router();
var functions = require('../lib/serverside.js');
/* GET home page. */

var checkUser = function(req, res, next) {
  if(req.session.user){
    next();
  } else {
    res.redirect('/login');
  }
};
/* GET home page. */
router.get('/', checkUser, function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/new/:id', function(req, res, next) {
  var id = req.params.id
  res.render('new', { user: id });
});

router.post('/new/:id', function(req, res, next) {
  var artworkObj = {};
      artworkObj.artworkName = req.body.artworkName;
      artworkObj.artworkArtist = req.body.artworkArtist;
      artworkObj.artworkURL = req.body.artworkURL;
      artworkObj.artworkComment = req.body.artworkComment;

  var id = req.params.id;
  console.log("*********",id);
  functions.writeNew(id,artworkObj).then(function () {
    res.redirect('/');
  })
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Express' });
});

router.post('/login', function(req, res, next){
  var currentUser = functions.toProperCase(req.body.userName);
  req.session.user = currentUser;

  functions.findUser(currentUser,req.body.password).then(function(result){
    if (result.status === 'not found'){
      res.render('login', {currentUser: currentUser, message: "No login found for user: " + currentUser})
    } else if (result.status === 'passed'){
        functions.findUser(currentUser,req.body.password).then(function(dataset){
          console.log(dataset);
          var id = dataset.data._id;
          res.redirect('/profiles/'+ id);
        });
    } else if (result.status === 'failed'){
      res.render('login', {message: "Username or password incorrect."})
    }
  });
});


//Signup
router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'Express' });
});

router.post('/signup', function(req, res, next){
  var currentUser = functions.toProperCase(req.body.userName);
  var password = req.body.password;
  var confirm = req.body.confirm;

  functions.duplicates(currentUser).then(function(duplicate){
      var errorList = functions.validate(currentUser, password, confirm, duplicate);
      if (errorList.errorStatus > 0){
        var returnValues = {}
        returnValues.username = currentUser
        res.render('signup', { errors: errorList.errors, posted: returnValues });
      }

      if (errorList.errorStatus === 0){
        functions.newUser(currentUser,password)
        req.session.user = currentUser;
        functions.findUser(currentUser,password).then(function(dataset){
          console.log(dataset);
          var id = dataset.data._id;
          res.redirect('/profiles/'+ id);
        });
      }
  });
})

router.get('/profiles/:id', function(req, res, next) {
  var userId = req.params.id
  functions.findProfile(userId).then(function(dataset){
    console.log(dataset);
  res.render('profiles', { title: 'Express', data: dataset });
  })

});


module.exports = router;
