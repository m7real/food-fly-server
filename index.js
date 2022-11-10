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

// verify JWT Token
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const serviceCollection = client.db("foodFly").collection("services");
    const reviewCollection = client.db("foodFly").collection("reviews");
    const blogCollection = client.db("foodFly").collection("blogs");
    const faqCollection = client.db("foodFly").collection("faqs");

    // provides JWT Token
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
      res.send({ token });
    });

    // get the services
    app.get("/services", async (req, res) => {
      const count = parseInt(req.query.count);
      const query = {};
      if (count) {
        // sorting services in a descending order based on inserting time
        const cursor = serviceCollection.find(query).sort({ last_modified: -1 });
        const services = await cursor.limit(count).toArray();
        res.send(services);
      } else {
        const cursor = serviceCollection.find(query);
        const services = await cursor.toArray();
        res.send(services);
      }
    });

    // post new service
    app.post("/services", verifyJWT, async (req, res) => {
      const service = req.body;
      service.last_modified = new Date().getTime();
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
    // get reviews
    app.get("/reviews", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.query.email) {
        res.status(403).send({ message: "Forbidden access" });
      }

      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      // sorting reviews in a descending order based on inserting time
      const cursor = reviewCollection.find(query).sort({ last_modified: -1 });
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    // post new review
    app.post("/reviews", verifyJWT, async (req, res) => {
      const review = req.body;
      review.last_modified = new Date().getTime();
      const result = await reviewCollection.insertOne(review);
      res.send({ result, review });
    });

    // update review
    app.patch("/reviews/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const reviewText = req.body.reviewText;
      const query = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          review_text: reviewText,
          last_modified: new Date().getTime(),
        },
      };
      const result = await reviewCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    // get single review
    app.get("/reviewById/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const review = await reviewCollection.findOne(query);
      res.send(review);
    });

    // delete review
    app.delete("/reviews/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });

    // get reviews of a specific service
    app.get("/reviews/:serviceId", async (req, res) => {
      const serviceId = req.params.serviceId;
      const query = { service_id: serviceId };

      // sorting reviews in a descending order based on inserting time
      const cursor = reviewCollection.find(query).sort({ last_modified: -1 });
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    // get blog
    app.get("/blog", async (req, res) => {
      const query = {};
      const cursor = blogCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    // get faq
    app.get("/faq", async (req, res) => {
      const query = {};
      const cursor = faqCollection.find(query);
      const result = await cursor.toArray();
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
