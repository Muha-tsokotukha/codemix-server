const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => app.listen(5000))
  .catch((err) => console.log(err));

app.use(authRoutes);
