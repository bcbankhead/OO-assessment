var mongoose = require("mongoose");

var usersSchema = new mongoose.Schema({
                   username: String,
                   password: String,
                   artworkId: Array,
                   liked: Array
                  });

var Users = mongoose.model("Users", usersSchema);

module.exports = Users;
