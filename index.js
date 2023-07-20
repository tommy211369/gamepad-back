// Librairies
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const formidable = require("express-formidable");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");

const app = express();
app.use(formidable());
app.use(cors());

// connect to mongoDB collection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// routes import
const userRoutes = require("./routes/user");
const gamesRoutes = require("./routes/games");
const reviewRoutes = require("./routes/review");
app.use(userRoutes);
app.use(gamesRoutes);
app.use(reviewRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome on GamePad API by Tommy Thongrasamy !" });
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "Error 404 : Page not found" });
});

app.listen(process.env.PORT, () => {
  console.log("Server has started on port : " + process.env.PORT);
});
