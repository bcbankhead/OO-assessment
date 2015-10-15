var mongoose = require("mongoose");
mongoose.connect(process.env.MONGOLAB_URI);

module.exports.Users = require("./users");
module.exports.Artwork = require("./artwork");
