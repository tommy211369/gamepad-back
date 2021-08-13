const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: String,
  username: String,
  favorites: Array,
  reviews: Array,
  token: String,
  hash: String,
  salt: String,
});

module.exports = User;
