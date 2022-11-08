const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

// test api
app.get("/", (req, res) => {
  res.send("Food Fly Server Running");
});

app.listen(port, () => {
  console.log("Food Fly Server Running On Port", port);
});
