const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
      if (count) {
        // latest added service will show on homepage
        const cursor = serviceCollection.find(query).sort({ _id: -1 });
        const services = await cursor.limit(count).toArray();
        res.send(services);
      } else {
        const cursor = serviceCollection.find(query);
        const services = await cursor.toArray();
        res.send(services);
      }
    });

    // post new service
    app.post("/services", async (req, res) => {
      const service = req.body;
      // service.lastModified = new Date().getTime();
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });

    // get single service
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    // review APIs
    // get reviews of a specific service
    app.get("/reviews/:serviceId", async (req, res) => {
      const serviceId = req.params.serviceId;
      const query = { service_id: serviceId };
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
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
