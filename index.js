const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const cors = require("cors");
const jwt = require("jsonwebtoken")
const port = process.env.PORT || 5000;

function createToken(user) {
  const token = jwt.sign(
    { email: user.email },
    'secret',
    { expiresIn: '7d' }
  );
  return token;
}

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send("hello server")
})


const uri = "mongodb+srv://shakhawat2021hossain2021:gZAkVHSbmdJ0tL6e@cluster0.jnuic7t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const laptops = client.db("productsDB").collection("laptops");
    //products
    app.post('/laptops', async (req, res) => {
      const laptop = req.body;

      const result = await laptops.insertOne(laptop);
      res.send(result)
    })

    app.get('/laptops', async (req, res) => {
      const laptopsData = laptops.find()
      const result = await laptopsData.toArray()
      res.send(result)
    })

    app.get('/laptops/:id', async (req, res) => {
      const id = req.params.id
      // console.log(id);
      const data = await laptops.findOne({
        _id: new ObjectId(id)
      })
      res.send(data)
    })

    app.patch("/laptops/:id", async (req, res) => {
      const id = req.params.id
      const updatedData = req.body;
      const data = await laptops.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      )
      res.send(data)
      // console.log(data);

    })

    app.delete("/laptops/:id", async (req, res) => {
      const id = req.params.id;
      const data = await laptops.deleteOne(
        { _id: new ObjectId(id) }
      )
      res.send(data)
      console.log(data);
    })

    //users
    const users = client.db("usersDB").collection("users");
    app.post('/users', async (req, res) => {
      const user = req.body;
      const token = createToken(user);

      const isExist = await users.findOne({ email: user?.email })
      if (isExist?._id) {
        return res.send({
          status: "success",
          message: "login success",
          token
        });
      }
      await users.insertOne(user);
      res.send(token)
    })

    
    app.get('/users/get/:id', async (req, res) => {
      const id = req.params.id
      // console.log(id);
      const data = await users.findOne({ _id: new ObjectId(id) })
      res.send(data)
    })
    app.patch("/users/get/:id", async (req, res) => {
      const id = req.params.id
      const updatedData = req.body;
      const data = await users.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      )
      res.send(data)
      console.log(data);

    })

    app.get('/users/:email', async (req, res) => {
      const email = req.params.email
      // console.log(email);
      const data = await users.findOne({ email })
      res.send(data)
    })


    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`server is running at ${port}`);
})

