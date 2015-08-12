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
            thisArtwork.id = result._id.toString();
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
    return Users.findOne({_id: id})
  },

  findArtwork: function(id,Artwork) {
    return Artwork.findOne({_id: id})
  },

  gallery: function(Artwork) {
    return Artwork.find({})
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

  addLike: function(id,username,artId,Users,Artwork) {
    Users.findByIdAndUpdate(
      { _id: id },
      { $pull: { liked: artId  } },
      { upsert: true })
    .then(function (result1) {
      Users.findByIdAndUpdate(
        { _id: id },
        { $push: { liked: artId  } },
        { upsert: true })
      .then(function (result2) {
        Artwork.findByIdAndUpdate(
          { _id: artId },
          { $pull: { likedby: { id: id, username: username } } },
          { upsert: true })
        .then(function (result3) {
          Artwork.findByIdAndUpdate(
            { _id: artId },
            { $push: { likedby: { id: id, username: username } } },
            { upsert: true })
          .then(function (result4) {
          })
        })
      })
    })
  },

removeLike: function(id,username,artId,Users,Artwork) {
  Users.findByIdAndUpdate(
    { _id: id },
    { $pull: { liked: artId  } },
    { upsert: true })
  .then(function (result2) {
    Artwork.findByIdAndUpdate(
      { _id: artId },
      { $pull: { likedby: { id: id, username: username } } },
      { upsert: true })
    .then(function (result4) {
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
    var time = new Date();
    var now = "comment" + time.getDate() + time.getHours() + time.getMinutes() + time.getSeconds() + time.getFullYear() + (Math.random()*500);
    var commentId = now;
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
