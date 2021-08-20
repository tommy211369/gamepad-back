const mongoose = require("mongoose");

const Review = mongoose.model("Review", {
  title: String,
  text: String,
  gameId: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = Review;
