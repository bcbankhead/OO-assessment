
var bcrypt = require('bcryptjs');
var ObjectID = require('mongodb').ObjectID;
var db = require("./models");

module.exports = {

  findUser: function(currentUser,password) {
    return db.Users.findOne({username: currentUser}).then(function(record){
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

  addRecord: function (id,artObj) {
    return db.Artwork.create(
      artObj)
      .then(function(result){
        var thisArtwork = {};
            thisArtwork.id = result._id.toString();
            thisArtwork.name = result.artworkName;
            thisArtwork.note = result.artworkNote;
            thisArtwork.commentCt = 0;

        return db.Users.findByIdAndUpdate(
        { _id: id },
        { $push: { artworkId: thisArtwork } },
        { upsert: true })
      })
  },

  updateArtwork: function (id,artId,artObj,Users,Artwork) {
    return Artwork.findByIdAndUpdate(
      { _id: artId },artObj)
  },

  removeArtwork: function (id,artId) {
    console.log(id, artId);
    return db.Artwork.remove(
      { _id: artId }).then(function (result) {
        return db.Users.findByIdAndUpdate(
        { _id: id },
        { $pull: { artworkId: { id: artId } } })
      })
  },


  findProfile: function(id) {
    return db.Users.findOne({_id: id}).then(function (result) {
      var artworkIds = [];
      var artworkURLs = [];
      result.artworkId.forEach(function (artwork) {
        var id = new ObjectID(artwork.id);
          artworkIds.push(id);
        })
      return {data:result, urls:artworkIds};
    })
  },

  profileArt: function (ids) {
    var artworkURLs = [];
    return db.Artwork.find({_id: { $in: ids }}).then(function (artworks) {
      artworks.forEach(function (item) {
        artworkURLs.push({artId: item._id, url: item.artworkURL});
      })
      return artworkURLs;
    })
  },

  findArtwork: function(id) {
    return db.Artwork.findOne({_id: id})
  },

  gallery: function() {
    return db.Artwork.find({}).sort({id: 1})
  },

  writeComment: function(id,commenter,comment,artId){
    return db.Artwork.findOne({_id: artId}).then(function (result) {
      var now = result.artworkComments.length;
      var max = result.commentCt || 0;

      if(now < max){
        now = max;
      }
      max++
      return db.Artwork.findByIdAndUpdate(
        { _id: artId },
        { commentCt: max,
          $push: {
            artworkComments: {
              $each: [ { commentId: now || 0, commenter_id: id, username: commenter, comment: comment } ],
              $sort: { commentId: -1 }
            },
          }
        },
        { upsert: true, new: true })
    })
  },

  removeComment: function(id,artId,commentId){
    return db.Artwork.findByIdAndUpdate(
      { _id: artId },
      { $pull: { artworkComments: { commentId: parseInt(commentId,10) } } },
      { upsert: true })
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

  favorites: function(liked,id) {
    var likedArt = [];
    return db.Artwork.find({}).then(function (results) {
      results.forEach(function (item) {
        item.likedby.forEach(function (user) {
          if(user.id.toString() === id.toString()){
            likedArt.push(item.id)
          }
        })
      })
      return likedArt;
    }).then(function (favorites) {
      return db.Artwork.find({_id: { $in:favorites } })
    })
  },

}
