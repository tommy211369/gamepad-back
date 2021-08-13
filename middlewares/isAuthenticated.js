const mongoose = require("mongoose");

const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    // get the token from the post request
    const token = await mongoose.req.headers.authorization.replace(
      "Bearer ",
      ""
    );

    // looking for a user with this token in the DB
    const user = await User.findOne({ token: token });

    if (user) {
      req.user = user; // stored user data in req.user
      next();
    } else {
      res.status(401).json({ AuthentificationMessage: "Unauthorized" });
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
};

module.exports = isAuthenticated;
