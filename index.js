const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const app = express();
app.use(cors());
app.use(express.json());
require("dotenv").config();

const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v2wiu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("carDb");
    const cars = database.collection("carCollection");
    const reviews = database.collection("reviews");
    const orders = database.collection("ordersCollection");
    const usersCollection = database.collection("users");

    app.get("/car", async (req, res) => {
      const query = cars.find({});
      const result = await query.toArray();
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      const query = reviews.find({});
      const result = await query.toArray();
      res.send(result);
    });

    app.delete("/car/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await cars.deleteOne(query);
      res.json(result);
    });

    app.get("/car/:id", async (req, res) => {
      const carId = req.params.id;
      const query = { _id: ObjectId(carId) };
      const result = await cars.findOne(query);
      res.send(result);
    });

    app.post("/orders", async (req, res) => {
      const doc = req.body;

      const result = await orders.insertOne(doc);
      res.json(result);
    });
    app.post("/reviews", async (req, res) => {
      const doc = req.body;
      const result = await reviews.insertOne(doc);
      res.json(result);
    });

    app.get("/allorders", async (req, res) => {
      const query = orders.find({});
      const result = await query.toArray();
      res.send(result);
      res.json(result);
    });

    app.put("/allorders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          status: "shipped",
        },
      };
      const result = await orders.updateOne(query, updateDoc, option);
      res.json(result);
    });

    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = orders.find(query);
      const result = await cursor.toArray();
      res.json(result);
    });

    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orders.deleteOne(query);
      res.json(result);
    });

    app.post("/users", async (req, res) => {
      const doc = req.body;

      const result = await usersCollection.insertOne(doc);
      res.json(result);
    });

    app.put("/users", async (req, res) => {
      const doc = req.body;

      const query = { email: doc.email };
      const options = { upsert: true };
      const updateDoc = { $set: doc };
      const result = await usersCollection.updateOne(query, updateDoc, options);
      res.json(result);
    });

    app.put("/users/admin", async (req, res) => {
      const doc = req.body;
      const query = { email: doc.email };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(query, updateDoc);
      res.json(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);

      let isAdmin = false;
      if (result?.role === "admin") {
        isAdmin = true;
      }

      res.json({ admin: isAdmin });
    });

    app.post("/car", async (req, res) => {
      const doc = req.body;
      const result = await cars.insertOne(doc);
      res.json(result);
    });
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Allah is Almighty.");
});

app.listen(port, () => {
  console.log("listening from ", port);
});
