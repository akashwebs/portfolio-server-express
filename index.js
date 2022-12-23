const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
const { JsonWebTokenError } = require("jsonwebtoken");
const port = process.env.PORT || 5000;
require("dotenv").config();
app.use(cors());
app.use(express.json());
const jwt = require("jsonwebtoken");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cnaom2x.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
function verifyJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unathuraization error" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRATE, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    client.connect();
    // --------------------all collection----------------

    const projectCollection = client.db("portfolio").collection("project");

    const addEmployeesCollection = client
      .db("basic-hospital")
      .collection("employess");
    const postCollection = client
      .db("basic-hospital")
      .collection("health-tips");
    const bannerCollection = client.db("basic-hospital").collection("banner");
    const imageGallaryCollection = client
      .db("basic-hospital")
      .collection("image-gallary");

    // jwt user token send
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;

      if (!email) {
        return;
      }
      const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRATE, {
        expiresIn: "1h",
      });
      const filter = { email: email };
      const option = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, option);
      res.send({ result, token });
    });

    // -------------------------------------project api---------------------------------------
    app.post("/add-project", async (req, res) => {
      const body = req.body;
      const result = await projectCollection.insertOne(body);
      res.send(result);
    });
    app.put("/update-project/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      if (!id) {
        return;
      }
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };

      const updateDoc = {
        $set: body,
      };
      const result = await projectCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.delete("/delete-project/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { projectName: "Paint Basic | Full Stack" };
      const result = await projectCollection.deleteOne(filter);
      res.send(result);
    });

    app.get("/projects", async (req, res) => {
      const result = await projectCollection.find({}).reverse().toArray();
      res.send(result);
    });
    app.get("/projects/:id", async (req, res) => {
      const id = req.params.id;
      const result = await projectCollection.findOne({ _id: ObjectId(id) });
      res.send(result);
    });

    // ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------
  } finally {
  }
}

app.get("/", (req, res) => {
  res.send("my portfolio server is running");
});

app.listen(port, () => {
  console.log("successfully my portfolio", port);
});

run().catch(console.dir);
