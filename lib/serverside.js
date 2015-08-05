// var db = require('monk')(process.env.MONGOLAB_URI);
var bcrypt = require('bcryptjs');
// var users = db.get('type_users');
// var artwork = db.get('type_artwork');

module.exports = {

  addRecord: function (id,artObj,Users,Artwork) {
    return Artwork.create(
      artObj)
      .then(function(result){
        var thisArtwork = {};
            thisArtwork.id = result._id;
            thisArtwork.name = result.artworkName;
            thisArtwork.note = result.artworkNote;

        Users.findByIdAndUpdate(
        { _id: id },
        { $push: { artworkId: thisArtwork } },
        { upsert: true })
        .then(function (result) {
          //why do I need to add this final .then in mongoose but not with plain ole monk?
        });
      })
  },

  updateArtwork: function (id,artId,artObj,Users,Artwork) {
    console.log(artId);
    return Artwork.findByIdAndUpdate(
      { _id: artId },artObj)
  },

  removeArtwork: function (id,artId,Artwork,Users) {
    console.log(id,"^^^^^^^^^^^^^^^^");
    return Artwork.remove(
      { _id: artId }).then(function (result) {
        Users.findByIdAndUpdate(
        { _id: id },
        { $pull: { artworkId: { id: artId } } },
        { multi: true }).then(function (result2) {
          console.log("herererere");

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
    return Users.findOne({_id: id})
  },

  findArtwork: function(id,Artwork) {
    return Artwork.findOne({_id: id})
  },

  gallery: function(Artwork) {
    return Artwork.find({})
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

  addLike: function(id,username,artId,Users,Artwork) {
    console.log(username);
    Users.findByIdAndUpdate(
      { _id: id },
      { $pull: { liked: artId  } },
      { upsert: true })
    .then(function (result1) {
        console.log("1", result1);
      Users.findByIdAndUpdate(
        { _id: id },
        { $push: { liked: artId  } },
        { upsert: true })
      .then(function (result2) {
        console.log("1", result2);
        Artwork.findByIdAndUpdate(
          { _id: artId },
          { $pull: { likedby: { id: id, username: username } } },
          { upsert: true })
        .then(function (result3) {
        console.log("1", result3);
          Artwork.findByIdAndUpdate(
            { _id: artId },
            { $push: { likedby: { id: id, username: username } } },
            { upsert: true })
          .then(function (result4) {
            console.log("1", result4);
          })
        })
      })
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
    console.log(id);
    var time = new Date();
    var now = "comment" + time.getDate() + time.getHours() + time.getSeconds() + time.getYear() + time.getMinutes() + time.getFullYear() + (Math.random()*5000);
    console.log(now);
    var commentId = now;
    return Artwork.findByIdAndUpdate(
      { _id: artId },
      { $push: { artworkComments: { commentId: now, commenter_id: id, username: commenter, comment: comment } } },
      { upsert: true })
    .then(function (result) {
      return result;
    })
  },

  removeComment: function(id,commenter,commentId,artId,Artwork){
    console.log("inremove",id,commenter,commentId);
    return Artwork.findByIdAndUpdate(
      { _id: artId },
      { $pull: { artworkComments: { commentId: commentId } } },
      { upsert: true })
    .then(function (result) {
      return result;
    })
  }

}
