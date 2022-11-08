const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

// mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wo3xvdt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    const serviceCollection = client.db("foodFly").collection("services");
    const reviewCollection = client.db("foodFly").collection("reviews");
  } finally {
    // prettier-ignore
}
}

run().catch((err) => console.error(err));
// test api
app.get("/", (req, res) => {
  res.send("Food Fly Server Running");
});

app.listen(port, () => {
  console.log("Food Fly Server Running On Port", port);
});
