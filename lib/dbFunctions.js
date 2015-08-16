
var bcrypt = require('bcryptjs');
var ObjectID = require('mongodb').ObjectID;
var db = require("../models");

module.exports = {

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

  addRecord: function (id,artObj,Users,Artwork) {
    return Artwork.create(
      artObj)
      .then(function(result){
        console.log("***********",result);
        var thisArtwork = {};
            thisArtwork.id = result._id.toString();
            thisArtwork.name = result.artworkName;
            thisArtwork.note = result.artworkNote;
            thisArtwork.commentCt = 0;

        return Users.findByIdAndUpdate(
        { _id: id },
        { $push: { artworkId: thisArtwork } },
        { upsert: true })
      })
  },

  updateArtwork: function (id,artId,artObj,Users,Artwork) {
    return Artwork.findByIdAndUpdate(
      { _id: artId },artObj)
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

  removeComment: function(id,commenter,commentId,artId,Artwork){
    console.log("inremove",id,commenter,commentId);
    return Artwork.findByIdAndUpdate(
      { _id: artId },
      { $pull: { artworkComments: { commentId: parseInt(commentId,10) } } },
      { upsert: true })
    .then(function (result) {
      return result;
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
}
