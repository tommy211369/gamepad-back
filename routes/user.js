// Librairies
const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const cloudinary = require("cloudinary").v2;
const encBase64 = require("crypto-js/enc-base64");
const isAuthenticated = require("../middlewares/isAuthenticated");

// import User model
const User = require("../models/User");
const Review = require("../models/Review");

// Sign Up
router.post("/signup", async (req, res) => {
  try {
    const emailExist = await User.findOne({ email: req.fields.email });
    if (emailExist) {
      res.status(409).json({ message: "User already exists" });
    } else if (req.fields.username === "" || req.fields.email === "") {
      res.status(400).json({ message: "Username/Email is required" });
    } else if (req.fields.password !== req.fields.confirm) {
      res.status(401).json({ message: "Enter same password and confirmation" });
    } else {
      const password = req.fields.password;
      const userSalt = uid2(16);
      const userHash = SHA256(password + userSalt).toString(encBase64);
      const userToken = uid2(64);

      if (req.files.picture) {
        const userPicture = await cloudinary.uploader.upload(
          req.files.picture.path,
          {
            folder: `/gamepad/users/${req.fields.email}`,
          }
        );

        const newUser = await new User({
          email: req.fields.email,
          username: req.fields.username,
          favorites: [],
          reviews: [],
          likes: [],
          dislikes: [],
          token: userToken,
          hash: userHash,
          salt: userSalt,
          picture: userPicture,
        });

        await newUser.save();

        const resNewUser = {
          id: newUser._id,
          token: newUser.token,
          username: newUser.username,
          picture: newUser.picture,
        };

        res.status(200).json({ message: "Signed up successfully", resNewUser });
      } else {
        const newUser = await new User({
          email: req.fields.email,
          username: req.fields.username,
          favorites: [],
          reviews: [],
          likes: [],
          dislikes: [],
          token: userToken,
          hash: userHash,
          salt: userSalt,
        });

        await newUser.save();

        const resNewUser = {
          id: newUser._id,
          token: newUser.token,
          username: newUser.username,
        };

        res.status(200).json({ message: "Signed up successfully", resNewUser });
      }
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.fields.email });

    if (user) {
      const password = req.fields.password;
      const newHash = SHA256(password + user.salt).toString(encBase64);

      if (newHash === user.hash) {
        const resUser = {
          id: user._id,
          token: user.token,
          username: user.username,
          picture: user.picture,
        };

        // console.log({ message: "Logged in !", resUser: resUser });
        res.status(200).json({ message: "Logged in !", resUser: resUser });
      } else {
        // console.log({ message: "Wrong password" });
        res.status(400).json({ message: "Wrong password" });
      }
    } else {
      // console.log({ message: "Unauthorized : user not recognized" });
      res.status(401).json({ message: "Unauthorized : user not recognized" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json(error.message);
  }
});

// FAVORITES
// Get all user favorite games
router.get("/user/favorites", async (req, res) => {
  try {
    let token = req.query.token;

    const user = await User.findOne({ token: token });

    const userFavorites = user.favorites;

    res.status(200).json(userFavorites);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

// Add game to user favorite games
router.post("/user/favorites", isAuthenticated, async (req, res) => {
  try {
    // req.user : user from isAuthenticated
    const user = req.user;

    let { gameId, gameName, gameImage } = req.fields;

    // exist : game already in DB
    const exist = user.favorites.find((elem) => elem.gameId === gameId);
    // index : index of this item
    const index = user.favorites.indexOf(exist);

    if (!exist) {
      // add to user favorites
      user.favorites.push({
        gameId: gameId,
        name: gameName,
        image: gameImage,
      });

      await user.save();

      res.status(200).json(user.favorites);
    } else {
      // remove from favorites
      user.favorites.splice(index, 1);
      await user.save();

      res.status(200).json(user.favorites);
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

// Remove game from user favorite games
router.delete("/user/favorites", isAuthenticated, async (req, res) => {
  try {
    // req.user : user from isAuthenticated
    const user = req.user;
    // console.log("user > ", user);

    // game id
    const ID = parseInt(req.query.id);
    // console.log("id du jeu ", ID);

    // exist : item already in DB
    const exist = user.favorites.find((elem) => elem.gameId === ID);
    // index : index of this item in user.favorites array
    const index = user.favorites.indexOf(exist);
    // console.log("Index 1 >> ", index);

    // remove item from the favorites array
    user.favorites.splice(index, 1);

    await user.save();

    res.status(200).json(user.favorites);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;
