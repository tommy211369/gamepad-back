const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middlewares/isAuthenticated");

// import User model
const User = require("../models/User");
const Review = require("../models/Review");

// get all reviews of the game
router.get("/reviews", async (req, res) => {
  try {
    const id = req.query.gameId;

    const reviews = await Review.find({ gameId: id }).populate("user");

    res.status(200).json(reviews);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

// post a review
router.post("/reviews", isAuthenticated, async (req, res) => {
  try {
    // req.user : user from isAuthenticated
    const user = req.user;

    // exist : check if user already reviewed the game
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

// check if user reviewed the game
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

// delete a review
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

// post/delete a like or dislike
router.post("/user/note", async (req, res) => {
  try {
    const reviewId = req.query.reviewId;
    const gameId = req.query.gameId;
    const token = req.query.token;
    const note = req.query.note;

    const user = await User.findOne({ token: token });
    const review = await Review.findOne({ _id: reviewId });

    const existLike = user.likes.find(
      (elem) => elem.gameId === gameId && elem.reviewId === reviewId
    );
    const existDislike = user.dislikes.find(
      (elem) => elem.gameId === gameId && elem.reviewId === reviewId
    );
    const indexLike = user.likes.indexOf(existLike);
    const indexDislike = user.likes.indexOf(existDislike);

    if (note === "like" && !existDislike && !existLike) {
      // if user likes and did not disliked yet >
      user.likes.push({ gameId: gameId, reviewId: reviewId });
      review.likes += 1;
      await review.save();
      await user.save();
      res.status(200).json({ message: "Like added", review: review });
    } else if (note === "like" && existDislike && !existLike) {
      // if user likes but already disliked >

      // res.status(200).json({
      //   message: "You have already disliked this review",
      //   code: 1,
      //   user: user,
      // });

      // push user.likes / remove user.dislikes >
      user.likes.push({ gameId: gameId, reviewId: reviewId });
      user.dislikes.splice(indexDislike, 1);
      review.dislikes -= 1;
      review.likes += 1;

      await review.save();
      await user.save();
      res.status(200).json({ message: "Like added", code: 1, review: review });
    } else if (note === "dislike" && !existLike && !existDislike) {
      // if user dislikes and did not liked yet >
      user.dislikes.push({ gameId: gameId, reviewId: reviewId });
      review.dislikes += 1;
      await review.save();
      await user.save();
      res.status(200).json({ message: "Dislike added", review: review });
    } else if (note === "dislike" && existLike && !existDislike) {
      // if user dislikes but already liked >

      // res.status(200).json({
      //   message: "You have already liked this review",
      //   code: 2,
      //   user: user,
      // });

      // user.dislikes push / remove user.likes >
      user.dislikes.push({ gameId: gameId, reviewId: reviewId });
      user.likes.splice(indexLike, 1);
      review.likes -= 1;
      review.dislikes += 1;

      await review.save();
      await user.save();
      res.status(200).json({ message: "Dislike added", review: review });
    } else if (note === "like" && existLike && !existDislike) {
      // user has already liked this review >
      user.likes.splice(indexLike, 1);
      review.likes -= 1;
      await review.save();
      await user.save();
      res.status(200).json({ message: "Like deleted", review: review });
    } else if (note === "dislike" && existDislike && !existLike) {
      // user has already disliked this review >
      user.dislikes.splice(indexDislike, 1);
      review.dislikes -= 1;
      await review.save();
      await user.save();
      res.status(200).json({ message: "Dislike deleted", review: review });
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;
