var db = require('monk')(process.env.MONGOLAB_URI);
var bcrypt = require('bcryptjs');
var users = db.get('type_users');
var artwork = db.get('type_artwork');

module.exports = {

  writeNew: function (id,username,artObj) {
    return artwork.insert(
      {
      uploadedBy: username,
      artworkName: artObj.artworkName,
      artworkArtist: artObj.artworkArtist,
      artworkURL: artObj.artworkURL,
      artworkNote: artObj.artworkNote,
      artworkComments: [],
      likedby: []
      }
    ).then(function(result){
      var thisArtwork = {};
          thisArtwork.id = result._id;
          thisArtwork.name = result.artworkName;
          thisArtwork.note = result.artworkNote;

      users.update(
      { _id: id },
      { $push: { artworkId: thisArtwork } },
      { upsert: true });
    })
  },

  findUser: function(currentUser,password) {
    return users.findOne({username: currentUser}).then(function(record){
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

  findProfile: function(id) {
    return users.findOne({_id: id})
  },

  findArtwork: function(id) {
    return artwork.findOne({_id: id})
  },

  gallery: function() {
    return artwork.find({})
  },

  isLiked: function(likesArray,artId){
    var liked = 0;
    for (var i = 0; i < likesArray.length; i++) {
      if(likesArray[i] !== null){
        if(likesArray[i].toString() === artId.toString()){
          liked = 1;
        } else {
          console.log(likesArray[i]);
          liked += 0;
        }
      }
    }
    return liked;
  },

  addLike: function(id,username,artId) {
    console.log(username);
    users.update(
      { _id: id },
      { $pull: { liked: artId  } },
      { upsert: true })
    .then(function () {
    users.update(
      { _id: id },
      { $push: { liked: artId  } },
      { upsert: true })
    }).then(function () {
      artwork.update(
        { _id: artId },
        { $pull: { likedby: { id: id, username: username } } },
        { upsert: true })
    }).then(function () {
      artwork.update(
        { _id: artId },
        { $push: { likedby: { id: id, username: username } } },
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

  duplicates: function(currentUser){
    return users.find({username: currentUser}).then(function(result){
      var duplicate = 0;
          if (result.length === 0){
            duplicate += 0
          } else {
            duplicate += 1;
          }
    return duplicate;
    })
  },

  newUser: function(currentUser,password){
  var passwordBcrypt = bcrypt.hashSync(password, 8);
    return users.insert({
      username: currentUser,
      password: passwordBcrypt,
      artworkId: [],
      liked: []
    });
  }
}
