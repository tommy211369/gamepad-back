// Librairies
const express = require("express");
const router = express.Router();
const axios = require("axios");

// import User model
const User = require("../models/User");
const Review = require("../models/Review");

// Games : get all games
// router.get("/allgames", async (req, res) => {
//   try {
//     const page = req.query.page;
//     const search = req.query.search;
//     const ordering = req.query.ordering;
//     const platform = req.query.platforms;
//     const genre = req.query.genres;

//     const response = await axios.get(
//       `https://api.rawg.io/api/games?page=${page}&search=${search}&search_precise=true&key=${process.env.API_KEY}`
//     );

//     res
//       .status(200)
//       .json({ count: response.data.count, results: response.data.results });
//   } catch (error) {
//     res.status(400).json("All Games error :", error.response.data);
//   }
// });

// Get games (with filters)
router.get("/games", async (req, res) => {
  try {
    const PAGE = req.query.page;
    let page = "";
    if (PAGE) {
      page = PAGE;
    } else {
      page = "";
    }

    const search = req.query.search;
    const ordering = req.query.ordering;
    const platform = req.query.platforms;
    const genre = req.query.genres;

    let queries = "";
    if (platform) {
      queries = queries + `&platforms=${platform}`;
    }
    if (genre) {
      queries = queries + `&genres=${genre}`;
    }

    const response = await axios.get(
      `https://api.rawg.io/api/games?page=${page}&search=${search}&search_precise=true&ordering=${ordering}&key=${process.env.API_KEY}${queries}`
    );

    res
      .status(200)
      .json({ count: response.data.count, results: response.data.results });
  } catch (error) {
    console.log("Games error :", error.response.data);
  }
});

// Get game details
router.get("/games/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const response = await axios.get(
      `https://api.rawg.io/api/games/${id}?key=${process.env.API_KEY}`
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.log("Games Details error :", error.response.data);
  }
});

// Get games associated with actual game
router.get("/games_like", async (req, res) => {
  try {
    const genres = req.query.genres;
    const developers = req.query.developers;

    const response = await axios.get(
      `https://api.rawg.io/api/games?genres=${genres}&developers=${developers}&key=${process.env.API_KEY}`
    );

    res.status(200).json(response.data.results);
  } catch (error) {
    console.log("Games Like error :", error.response.data);
  }
});

// Get platforms
router.get("/platforms", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.rawg.io/api/platforms?&key=${process.env.API_KEY}`
    );

    res.status(200).json({ results: response.data.results });
  } catch (error) {
    console.log("Platforms error :", error.message);
  }
});

// Get genres
router.get("/genres", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.rawg.io/api/genres?&key=${process.env.API_KEY}`
    );

    res.status(200).json({ results: response.data.results });
  } catch (error) {
    console.log("Genres error :", error.message);
  }
});

module.exports = router;
