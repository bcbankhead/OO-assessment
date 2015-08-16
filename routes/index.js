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
  res.render('index', { page: 'gallery', title: 'Express' });
});

router.get('/new/:id', function (req, res, next) {
  var id = req.params.id
  res.render('new', { page: 'new', id: id });
});

router.post('/new/:id', function (req, res, next) {
  var id = req.params.id;
  functions.new(id,req.body.artworkName,req.body.artworkArtist,req.body.artworkURL,req.body.artworkNote)
  .then(function (result) {
    res.redirect('/profiles/'+ id);
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

 //refactor
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
    functions.profileArt(db.Artwork,dataset.urls).then(function (urls) {
      var result = functions.combiner(dataset.data,urls)
      res.render('profiles', { page: 'profile', id: id, data: result });
    })
  })
})



router.get('/view/:id/:artId', function (req, res, next) {
  var id = req.params.id;
  var artId = req.params.artId;
  functions.findProfile(id,db.Users).then( function (dataset) {
    var liked = functions.isLiked(dataset.data.liked,artId)
    functions.findArtwork(artId,db.Artwork).then( function (artData) {
    res.render('view', { page: 'view', user: req.session.user, id: id, liked: liked, artData: artData });
    })
  })
});

router.get('/edit/:id/:artId', function (req, res, next) {
  var id = req.params.id;
  var artId = req.params.artId;
  functions.findProfile(id,db.Users).then( function (dataset) {
    var liked = functions.isLiked(dataset.data.liked,artId)
    functions.findArtwork(artId,db.Artwork).then( function (artData) {
    res.render('edit', { page: 'view', id: id, liked: liked, artData: artData });
    })
  })
});

router.post('/edit/:id/:artId', function (req, res, next) {
  functions.edit(req.params.id,req.params.artId,req.body.artworkName,req.body.artworkArtist,req.body.artworkURL,req.body.artworkNote)
  .then(function (result) {
      res.redirect('/profiles/'+ req.params.id);
  })
});

router.get('/delete/:id/:artId', function (req, res, next) {
  var id = req.params.id;
  var artId = req.params.artId;
  functions.removeArtwork(id,artId,db.Artwork,db.Users).then( function (artData) {
  res.redirect('/profiles/'+ id);
  })
});

//Comment
router.post('/comment/:id/:artId', function (req, res, next) {
  var id = req.params.id;
  var artId = req.params.artId;
  var comment = req.body.comment;
  //refactor
  functions.findProfile(id,db.Users).then( function (dataset) {
    var commenter = dataset.data.username;
    var liked = functions.isLiked(dataset.data.liked,artId);
    functions.writeComment(id,commenter,comment,artId,db.Artwork).then(function (result) {
      console.log(result);
      var commentId = { commentId : result.artworkComments[0].commentId }
      res.json(commentId);
    })
  })
});

router.post('/comment/:id/:artId/:cId/rmc', function (req, res, next) {
  functions.removeComment(req.params.id,req.params.artId,req.params.cId).then(function (result) {
    res.json({})
  })
});

router.post('/:id/:artId/like/', function (req, res, next) {
  var id = req.params.id;
  var artId = req.params.artId;
  functions.findProfile(id,db.Users).then( function (dataset) {
    var user = dataset.data.username;
    functions.addLike(id,user,artId,db.Users,db.Artwork).then( function (result) {
      console.log("here1");
      console.log(result);
      res.json(result);
    })
  })
});

router.post('/:id/:artId/unlike/', function (req, res, next) {
  var id = req.params.id;
  var artId = req.params.artId;
  functions.findProfile(id,db.Users).then( function (dataset) {
    var user = dataset.data.username;
    functions.removeLike(id,user,artId,db.Users,db.Artwork).then( function (result) {
      console.log("here2");
      console.log(result);
      res.json(result);
    })
  })
});


router.get('/gallery/:id', function (req, res, next) {
  var id = req.params.id
  functions.gallery(db.Artwork).then( function (dataset) {
    res.render('gallery', { page: 'gallery', id: id, data: dataset });
  })
})

router.get('/favorites/:id', function (req, res, next) {
  var id = req.params.id
  functions.findProfile(id,db.Users).then( function (dataset) {
    functions.favorites(db.Artwork, dataset.data.liked,id).then( function (artData) {
      res.render('gallery', { page: 'favorites', id: id, data: artData });
    })
  })
})

module.exports = router;
