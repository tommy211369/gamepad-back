require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const formidable = require("express-formidable");
const cors = require("cors");

const app = express();
app.use(formidable());
app.use(cors());

// connect to mongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// routes import
const userRoutes = require("./routes/user");
app.use(userRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome on GamePad API !" });
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "Page not found" });
});

app.listen(process.env.PORT, () => {
  console.log("Server has started on port : " + process.env.PORT);
});
