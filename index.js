const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
require('dotenv').config()
const cors = require("cors");
const jwt = require("jsonwebtoken")
var cookieParser = require('cookie-parser')

const port = process.env.PORT || 5000;


app.use(cors())
app.use(express.json())


function createToken(user) {
  const token = jwt.sign({ email: user.email }, 'secret', { expiresIn: '7d' })
  return token;
}

function verifyToken(req, res, next){
  const authToken = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(authToken, 'secret')
  console.log(verify);
  if(!verify?.email){
    return res.send("you are not authorized");
  }
  next()
}




app.get('/', (req, res) => {
  res.send("hello server")
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jnuic7t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const dbConnect = async () => {
  try {
    client.connect();
    console.log("Database Connected Successfully✅");

  } catch (error) {
    console.log(error.name, error.message);
  }
}
dbConnect()

const users = client.db('usersDB').collection('users')
const laptops = client.db('productsDB').collection('laptops')



//products
app.post('/laptops', verifyToken, async (req, res) => {
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

app.patch("/laptops/:id", verifyToken, async (req, res) => {
  const id = req.params.id
  const updatedData = req.body;
  const data = await laptops.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedData }
  )
  res.send(data)
  // console.log(data);

})

app.delete("/laptops/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  const data = await laptops.deleteOne(
    { _id: new ObjectId(id) }
  )
  res.send(data)
  console.log(data);
})

//users
app.post('/users', async (req, res) => {
  const user = req.body;
  const token = createToken(user)
  console.log(token);
  const isExist = await users.findOne({ email: user?.email })
  if (isExist?._id) {
    return res.send({
      status: "success",
      message: "Login Successful",
      token
    });
  }
  await users.insertOne(user);
  res.send({ token })
})


app.get('/users', async (req, res) => {
  const usersData = users.find()
  const result = await usersData.toArray()
  res.send(result)
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
app.get('/users/get/:id', async (req, res) => {
  const id = req.params.id
  // console.log(id);
  const data = await users.findOne({ _id: new ObjectId(id) })
  res.send(data)
})
app.get('/users/:email', async (req, res) => {
  const email = req.params.email
  // console.log(email);
  const data = await users.findOne({ email })
  res.send(data)
})


console.log("Pinged your deployment. You successfully connected to MongoDB!");


app.listen(port, () => {
  console.log(`server is running at ${port}`);
})

