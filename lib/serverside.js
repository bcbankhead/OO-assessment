
var bcrypt = require('bcryptjs');
var ObjectID = require('mongodb').ObjectID;
var db = require("../models");
var dbFunctions = require('./dbFunctions.js');

module.exports = {

  new: function (id,artworkName,artworkArtist,artworkURL,artworkNote) {
    return dbFunctions.findProfile(id,db.Users)
    .then( function (dataset) {
      var artworkObj = {};
          artworkObj.artworkName = artworkName;
          artworkObj.artworkArtist = artworkArtist;
          artworkObj.artworkURL = artworkURL;
          artworkObj.artworkNote = artworkNote;
          artworkObj.artworkComments = [];
          artworkObj.likedby = [];
          artworkObj.uploadedBy = dataset.data.username;
      dbFunctions.addRecord(id,artworkObj,db.Users,db.Artwork).then(function (result) {
        return result
      })
  })
},

edit: function (id,artId,artworkName,artworkArtist,artworkURL,artworkNote) {
  return dbFunctions.findProfile(id,db.Users)
  .then( function (dataset) {
    var artworkObj = {};
        artworkObj.artworkName = artworkName;
        artworkObj.artworkArtist = artworkArtist;
        artworkObj.artworkURL = artworkURL;
        artworkObj.artworkNote = artworkNote;
        artworkObj.artworkComments = [];
        artworkObj.likedby = [];
        artworkObj.uploadedBy = dataset.data.username;
    dbFunctions.updateArtwork(id,artId,artworkObj,db.Users,db.Artwork).then(function (result) {
      console.log(result);
      return result;
    })
  })
},

isLiked: function(likesArray,artId){
  var liked = 0;
  likesArray.forEach(function (likedId) {
    if(likedId){
      if(likedId.toString() === artId.toString()){
        liked = 1;
      } else {
        liked += 0;
      }
    }
  })
  return liked;
},

removeComment: function (id,artId,commentId) {
  return dbFunctions.findProfile(id,db.Users).then(function (dataset) {
    var commenter = dataset.data.username;
    var liked = dbFunctions.isLiked(dataset.data.liked,artId);
    dbFunctions.removeComment(id,commenter,commentId,artId,db.Artwork).then(function (result) {
      console.log('here',result);
      dbFunctions.findArtwork(artId,db.Artwork).then(function (result) {
        return result;
      })
    })
  })
},

//moved
  updateArtwork: function (id,artId,artObj,Users,Artwork) {
    return Artwork.findByIdAndUpdate(
      { _id: artId },artObj)
  },

  removeArtwork: function (id,artId,Artwork,Users) {
    return Artwork.remove(
      { _id: artId }).then(function (result) {
        Users.findByIdAndUpdate(
        { _id: id },
        { $pull: { artworkId: { id: artId } } }).then(function (result2) {
        })
      })
  },

  findUser: function(currentUser,password,Users) {
    return Users.findOne({username: currentUser}).then(function(record){
      if (record === null){
        return {status:'not found'};
      } else {
        var passCompare = bcrypt.compareSync(password,record.password);
        if (passCompare === true){
          return {status: 'passed', data: record};
        } else {
          return {status: 'failed'};
        }
      }
    })
  },

  findProfile: function(id,Users) {
    return Users.findOne({_id: id}).then(function (result) {
      var artworkIds = [];
      var artworkURLs = [];
      result.artworkId.forEach(function (artwork) {
        var id = new ObjectID(artwork.id);
          artworkIds.push(id);
        })
      return {data:result, urls:artworkIds};
    })
  },

  profileArt: function (Artwork,ids) {
    var artworkURLs = [];
    return Artwork.find({_id: { $in: ids }}).then(function (artworks) {
      artworks.forEach(function (item) {
        artworkURLs.push({artId: item._id, url: item.artworkURL});
      })
      return artworkURLs;
    })
  },

  combiner: function (user,urls) {
    user.artworkId.forEach(function (item) {
      urls.forEach(function (url) {
          if (item.id.toString() === url.artId.toString()) {
            item.url = url.url
          }
      })
    })
    return user
  },

  findArtwork: function(id,Artwork) {
    return Artwork.findOne({_id: id})
  },

  gallery: function(Artwork) {
    return Artwork.find({}).sort({id: 1})
  },

  favorites: function(Artwork,liked,id) {
    var likedArt = [];
    return Artwork.find({}).then(function (results) {
      results.forEach(function (item) {
        item.likedby.forEach(function (user) {
          if(user.id.toString() === id.toString()){
            likedArt.push(item.id)
          }
        })
      })
      return likedArt;
    }).then(function (favorites) {
      return Artwork.find({_id: { $in:favorites } })
    })
  },

  addLike: function(id,username,artId,Users,Artwork) {
    return Users.findByIdAndUpdate(
      { _id: id },
      { $pull: { liked: artId  } },
      { upsert: true })
    .then(function (result1) {
      return Users.findByIdAndUpdate(
        { _id: id },
        { $push: { liked: artId  } },
        { upsert: true })
      .then(function (result2) {
        return Artwork.findByIdAndUpdate(
          { _id: artId },
          { $pull: { likedby: { id: id, username: username } } },
          { upsert: true })
        .then(function (result3) {
          return Artwork.findByIdAndUpdate(
            { _id: artId },
            { $push: { likedby: { id: id, username: username } } },
            { upsert: true})
        })
      })
    })
  },

removeLike: function(id,username,artId,Users,Artwork) {
  return Users.findByIdAndUpdate(
    { _id: id },
    { $pull: { liked: artId  } },
    { upsert: true })
  .then(function (result2) {
    return Artwork.findByIdAndUpdate(
      { _id: artId },
      { $pull: { likedby: { id: id, username: username } } },
      { upsert: true })
  })
},

  toProperCase: function(input){
  var errorObject = {}
  var errorCode = 0;

  if (input.length === 0){
    return "";
  } else {
    var firstChar = input[0].toUpperCase();
    input = input.substr(1,input.length);
    input = input.toLowerCase();
    input = firstChar + input;
    return input;
  }
},

validate: function(currentUser, password, confirm, duplicate){
  var errorObject = {}
  errorObject.name = '';
  errorObject.password = '';
  errorObject.confirm = '';

  var errorCode = 0;

  if (currentUser === ""){
    errorObject.name = "Username Cannot be Blank.";
    errorCode += 1;
  } else {
    errorCode += 0;
  }

  if (password.length === 0){
    errorObject.password = "Password Cannot be Blank. ";
    errorCode += 1;
  } else {
    errorCode += 0;
  }

  if (password.length < 3){
    errorObject.password += "Password Cannot be less than 3 characters.";
    errorCode += 1;
  } else {
    errorCode += 0;
  }

  if (password !== confirm){
    errorObject.confirm = "Passwords do not match.";
    errorCode += 1;
  } else {
    errorCode += 0;
  }

  if (duplicate >= 1){
    errorObject.name = "Account for this user name already exists.";
    errorCode += 1;
  } else {
    errorCode += 0;
  }
  return {errors: errorObject, errorStatus: errorCode};
},

  duplicates: function(currentUser,Users){
    return Users.findOne({username: currentUser}).then(function(result){
      var duplicate = 0;
          if (result === null){
            duplicate += 0
          } else {
            duplicate += 1;
          }
    return duplicate;
    })
  },

  newUser: function(currentUser,password,Users){
    var passwordBcrypt = bcrypt.hashSync(password, 8);
    return Users.create(
    {
      username: currentUser,
      password: passwordBcrypt,
      artworkId: [],
      liked: []
    });
  },

  writeComment: function(id,commenter,comment,artId,Artwork){
    var time = new Date();
    var now = "comment" + time.getDate() + time.getHours() + time.getMinutes() + time.getSeconds() + time.getMilliseconds() + time.getFullYear()
    return Artwork.findByIdAndUpdate(
      { _id: artId },
      {
        $push: {
          artworkComments: {
            $each: [ {commentId: now || 0, commenter_id: id, username: commenter, comment: comment } ],
            $sort: { commentId: -1 }
          },
        }
      },
      { upsert: true, new: true })
  },
}
