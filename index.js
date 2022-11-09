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

    // get the services
    app.get("/services", async (req, res) => {
      const count = parseInt(req.query.count);
      const query = {};
      const cursor = serviceCollection.find(query).sort({ _id: -1 });
      if (count) {
        const services = await cursor.limit(count).toArray();
        res.send(services);
      } else {
        const services = await cursor.toArray();
        res.send(services);
      }
    });

    // post new service
    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });
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
