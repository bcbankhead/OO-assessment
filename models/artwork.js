var mongoose = require("mongoose");

var artworkSchema = new mongoose.Schema({
                    uploadedBy: String,
                    artworkName: String,
                    artworkArtist: String,
                    artworkURL: String,
                    artworkNote: String,
                    artworkComments: Array,
                    likedby: Array
                  });


var Artwork = mongoose.model("Artwork", artworkSchema);

module.exports = Artwork;
