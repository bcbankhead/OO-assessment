var express = require('express');
var bcrypt = require('bcryptjs');
var router = express.Router();

var db = require("../models");
var functions = require('../lib/serverside.js');
/* GET home page. */

var checkUser = function (req, res, next) {
  if(req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};
/* GET home page. */
router.get('/', checkUser, function (req, res, next) {
  res.render('index', { page: 'all', title: 'Express' });
});

router.get('/new/:id', function (req, res, next) {
  var id = req.params.id
  res.render('new', { page: 'new', id: id });
});

router.post('/new/:id', function (req, res, next) {
  var id = req.params.id;
  functions.findProfile(id,db.Users)
  .then( function (dataset) {
    var artworkObj = {};
        artworkObj.artworkName = req.body.artworkName;
        artworkObj.artworkArtist = req.body.artworkArtist;
        artworkObj.artworkURL = req.body.artworkURL;
        artworkObj.artworkNote = req.body.artworkNote;
        artworkObj.artworkComments = [];
        artworkObj.likedby = [];
        artworkObj.uploadedBy = dataset.username;
    functions.addRecord(id,artworkObj,db.Users,db.Artwork)
    .then( function (result) {
      res.redirect('/profiles/'+ id);
    })
  })
});

router.get('/login', function (req, res, next) {
  res.render('login', { page: 'none', title: 'Express' });
});

router.post('/login', function (req, res, next) {
  var currentUser = functions.toProperCase(req.body.userName);
  req.session.user = currentUser;

  functions.findUser(currentUser,req.body.password,db.Users)
  .then( function (result) {
    if (result.status === 'not found') {
      res.render('login', {currentUser: currentUser, message: "No login found for user: " + currentUser})
    } else if (result.status === 'passed') {
        functions.findUser(currentUser,req.body.password,db.Users)
        .then( function (dataset) {
          var id = dataset.data._id;
          res.redirect('/profiles/'+ id);
        });
    } else if (result.status === 'failed') {
      res.render('login', {page: 'none', message: "Username or password incorrect."})
    }
  });
});

router.get('/logout', function (req, res, next) {
    req.session.user = null;
  res.render('login', { page: 'none', title: 'Express' });
});


//Signup
router.get('/signup', function (req, res, next) {
  res.render('signup', { page: 'none', title: 'Express' });
});

router.post('/signup', function (req, res, next) {
  var currentUser = functions.toProperCase(req.body.userName);
  var password = req.body.password;
  var confirm = req.body.confirm;

  functions.duplicates(currentUser,db.Users)
  .then( function (duplicate) {
      var errorList = functions.validate(currentUser, password, confirm, duplicate);
      if (errorList.errorStatus > 0) {
        var returnValues = {}
        returnValues.username = currentUser
        res.render('signup', { page: 'none', errors: errorList.errors, posted: returnValues });
      }

      if (errorList.errorStatus === 0) {
        functions.newUser(currentUser,password,db.Users)
        .then( function () {
          req.session.user = currentUser;
          functions.findUser(currentUser,password,db.Users)
          .then( function (dataset) {
            var id = dataset.data._id;
            res.redirect('/profiles/'+ id);
          });
        })
      }
  });
})

router.get('/profiles/:id', function (req, res, next) {
  var id = req.params.id
  functions.findProfile(id,db.Users).then( function (dataset) {
  res.render('profiles', { page: 'profile', id: id, data: dataset });
  })
})

router.get('/view/:id/:artId', function (req, res, next) {
  var id = req.params.id;
  var artId = req.params.artId;
  functions.findProfile(id,db.Users).then( function (dataset) {
    var liked = functions.isLiked(dataset.liked,artId)
    functions.findArtwork(artId,db.Artwork).then( function (artData) {
    res.render('view', { page: 'view', id: id, liked: liked, artData: artData });
    })
  })
});

router.get('/edit/:id/:artId', function (req, res, next) {
  var id = req.params.id;
  var artId = req.params.artId;
  functions.findProfile(id,db.Users).then( function (dataset) {
    var liked = functions.isLiked(dataset.liked,artId)
    functions.findArtwork(artId,db.Artwork).then( function (artData) {
    res.render('edit', { page: 'view', id: id, liked: liked, artData: artData });
    })
  })
});

router.post('/edit/:id/:artId', function (req, res, next) {
  var id = req.params.id;
  var artId = req.params.artId;
  functions.findProfile(id,db.Users)
  .then( function (dataset) {
    var artworkObj = {};
        artworkObj.artworkName = req.body.artworkName;
        artworkObj.artworkArtist = req.body.artworkArtist;
        artworkObj.artworkURL = req.body.artworkURL;
        artworkObj.artworkNote = req.body.artworkNote;
        artworkObj.artworkComments = [];
        artworkObj.likedby = [];
        artworkObj.uploadedBy = dataset.username;
    functions.updateArtwork(id,artId,artworkObj,db.Users,db.Artwork)
    .then( function (result) {
      res.redirect('/profiles/'+ id);
    })
  })
});

router.get('/delete/:id/:artId', function (req, res, next) {
  var id = req.params.id;
  var artId = req.params.artId;
  functions.removeArtwork(id,artId,db.Artwork,db.Users).then( function (artData) {
  res.redirect('/profiles/'+ id);
  })
});


router.post('/comment/:id/:artId', function (req, res, next) {
  var id = req.params.id;
  var artId = req.params.artId;
  var comment = req.body.comment
  functions.findProfile(id,db.Users).then( function (dataset) {
    var commenter = dataset.username;
    var liked = functions.isLiked(dataset.liked,artId);
    functions.writeComment(id,commenter,comment,artId,db.Artwork).then(function (result) {
      functions.findArtwork(artId,db.Artwork).then( function (artData) {
        res.redirect('/view/'+id+'/'+artId);
      })
    })
  })
});

router.get('/comment/:id/:artId/:cId/rmc', function (req, res, next) {
  var id = req.params.id;
  var artId = req.params.artId;
  var commentId = req.params.cId
  functions.findProfile(id,db.Users).then( function (dataset) {
    var commenter = dataset.username;
    var liked = functions.isLiked(dataset.liked,artId);
    functions.removeComment(id,commenter,commentId,artId,db.Artwork).then(function (result) {
      console.log("here2");
      functions.findArtwork(artId,db.Artwork).then( function (artData) {
        res.redirect('/view/'+id+'/'+artId);
      })
    })
  })
});


router.post('/like/:id/:artId', function (req, res, next) {
  var id = req.params.id;
  var artId = req.params.artId;
  console.log(id);
  console.log(artId);
  functions.findProfile(id,db.Users).then( function (dataset) {
    var user = dataset.username;
    functions.addLike(id,user,artId,db.Users,db.Artwork).then( function (result) {
      //res.redirect('/profiles/'+ id);
    })
  })
});

router.get('/gallery/:id', function (req, res, next) {
  var id = req.params.id
  functions.gallery(db.Artwork).then( function (dataset) {
    console.log(dataset);
  res.render('gallery', { page: 'all', id: id, data: dataset });
  })
})

module.exports = router;
