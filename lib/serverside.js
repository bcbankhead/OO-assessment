
var bcrypt = require('bcryptjs');
var ObjectID = require('mongodb').ObjectID;
var db = require("./models");
var dbFunctions = require('./dbFunctions.js');

module.exports = {

  new: function (id,artworkName,artworkArtist,artworkURL,artworkNote) {
    return dbFunctions.findProfile(id)
    .then( function (dataset) {
      var artworkObj = {};
          artworkObj.artworkName = artworkName;
          artworkObj.artworkArtist = artworkArtist;
          artworkObj.artworkURL = artworkURL;
          artworkObj.artworkNote = artworkNote;
          artworkObj.artworkComments = [];
          artworkObj.likedby = [];
          artworkObj.uploadedBy = dataset.data.username;
      return dbFunctions.addRecord(id,artworkObj)
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
      return result;
    })
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

  addLike: function(id,username,artId) {
    return db.Users.findByIdAndUpdate(
      { _id: id },
      { $pull: { liked: artId  } },
      { upsert: true })
    .then(function (result1) {
      return db.Users.findByIdAndUpdate(
        { _id: id },
        { $push: { liked: artId  } },
        { upsert: true })
      .then(function (result2) {
        return db.Artwork.findByIdAndUpdate(
          { _id: artId },
          { $pull: { likedby: { id: id, username: username } } },
          { upsert: true })
        .then(function (result3) {
          return db.Artwork.findByIdAndUpdate(
            { _id: artId },
            { $push: { likedby: { id: id, username: username } } },
            { upsert: true})
        })
      })
    })
  },

removeLike: function(id,username,artId,Users,Artwork) {
  return db.Users.findByIdAndUpdate(
    { _id: id },
    { $pull: { liked: artId  } },
    { upsert: true })
  .then(function (result2) {
    return db.Artwork.findByIdAndUpdate(
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
    return db.Users.findOne({username: currentUser}).then(function(result){
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
    return db.Users.create(
    {
      username: currentUser,
      password: passwordBcrypt,
      artworkId: [],
      liked: []
    });
  },

}
