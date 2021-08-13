const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SH256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

// import User model
const User = require("../models/User");

// Games (get) with filters
router.get("/games", (req, res) => {
  res.status(200).json({ message: "Games route !" });
});

module.exports = router;
