const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SH256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const isAuthenticated = require("../middlewares/isAuthenticated");

// import User model
const User = require("../models/User");

// SIGN UP (post)
router.get("/signup", (req, res) => {
  res.status(200).json({ message: "Sign Up route !" });
});

// LOGIN (post)
router.get("/signin", (req, res) => {
  res.status(200).json({ message: "Sign In route !" });
});

// FAVORITES (post/get/delete)
router.get("/user/favorites", (req, res) => {
  res.status(200).json({ message: "Get user favorites !" });
});

// REVIEWS (post/get/delete)
router.get("/user/reviews", (req, res) => {
  res.status(200).json({ message: "Get user reviews !" });
});

module.exports = router;
