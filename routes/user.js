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

// SIGN UP (post)
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

// LOGIN (post)
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

// FAVORITES (post/get/delete)
router.get("/user/favorites", async (req, res) => {
  let token = req.query.token;

  const user = await User.findOne({ token: token });

  const userFavorites = user.favorites;

  res.status(200).json(userFavorites);
});

// add game to user favorites
router.post("/user/favorites", isAuthenticated, async (req, res) => {
  try {
    // req.user : user from isAuthenticated
    const user = req.user;

    let { gameId, gameName, gameImage } = req.fields;

    // exist : game already in DB
    const exist = user.favorites.find((elem) => elem.id === gameId);
    // index : index of this item
    const index = user.favorites.indexOf(exist);

    if (!exist) {
      // add to user favorites
      user.favorites.push({
        id: gameId,
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

// remove game from user favorites
router.delete("/user/favorites", isAuthenticated, async (req, res) => {
  try {
    // req.user : user from isAuthenticated
    const user = req.user;

    const gameId = req.query.id;

    // exist : item already in DB
    const exist = user.favorites.find((elem) => elem.id === gameId);
    // index : index of this item in user.favorites array
    const index = user.favorites.indexOf(exist);

    // remove item from the favorites array
    user.favorites.splice(index, 1);
    await user.save();

    res.status(200).json(user.favorites);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

// REVIEWS (post/get/delete)
router.post("/reviews", isAuthenticated, async (req, res) => {
  try {
    // req.user : user from isAuthenticated
    const user = req.user;

    // exist : check if game already in user reviews
    const exist = user.reviews.find(
      (elem) => elem.gameId === req.fields.gameId
    );

    if (!exist) {
      const newReview = await new Review({
        title: req.fields.title,
        text: req.fields.text,
        gameId: req.fields.gameId,
        user: user._id,
        date: req.fields.date,
        likes: 0,
        dislikes: 0,
      });

      await newReview.save();

      user.reviews.push({
        title: req.fields.title,
        text: req.fields.text,
        gameId: req.fields.gameId,
        date: req.fields.date,
      });

      await user.save();

      res.status(200).json({
        message: `Review added to ${user.username} reviews`,
        review: newReview,
      });
    } else {
      res.status(200).json(`${user.username} already reviewed this game`);
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.get("/user/review", async (req, res) => {
  try {
    const token = req.query.token;
    const gameId = req.query.gameId;

    const user = await User.findOne({ token: token });

    const exist = user.reviews.find((elem) => elem.gameId === gameId);

    if (exist) {
      res.status(200).json({ bool: true, review: exist });
    } else {
      res.status(200).json({ bool: false });
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.delete("/user/review", async (req, res) => {
  try {
    const gameId = req.query.gameId;
    const token = req.query.token;

    const user = await User.findOne({ token: token });

    const exist = user.reviews.find((elem) => elem.gameId === gameId);
    const index = user.reviews.indexOf(exist);

    user.reviews.splice(index, 1);

    await Review.remove({ gameId: gameId, user: user._id });
    await user.save();

    res.status(200).json("Review deleted");
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;
