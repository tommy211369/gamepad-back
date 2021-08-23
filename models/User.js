const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: String,
  username: String,
  favorites: Array,
  reviews: Array,
  likes: Array,
  dislikes: Array,
  token: String,
  hash: String,
  salt: String,
  picture: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

module.exports = User;
