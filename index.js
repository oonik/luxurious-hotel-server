const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.BD_PASS}@cluster0.bwrtzwz.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

function verifyJWT(req, res, next){
  console.log('token inside verifyJwt', req.headers.authorization);
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return  res.status(401).send('unauthorized access')
  }

  const token = authHeader.split(' ')[1];
 jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
   if(err){
    return res.status(403).send({message: 'forbidden access'})
   }
   req.decoded = decoded;
   next();
 })
};

async function run() {
    try {
      const roomsCollection = client.db("luxuriousHotel").collection("rooms");
      const bookingCollection = client.db("luxuriousHotel").collection("bookings");
      const userCollection = client.db("luxuriousHotel").collection("users");
      const contactUsCollection = client.db("luxuriousHotel").collection("contactUs");

      app.get('/rooms', async (req, res)=>{
        const query = {};
        const rooms = await roomsCollection.find(query).toArray();
        res.send(rooms);
      });

      app.get('/room/:id', async(req, res)=>{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const room = await roomsCollection.findOne(filter);
        res.send(room);
      });

      app.get('/jwt', async(req, res)=>{
        const email = req.query.email;
        const query = {email: email};
        const user = await userCollection.findOne(query);
        if(user){
          const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN, {expiresIn:'2h'});
          return res.send({accessToken: token})
        }
        res.status(403).send({accessToken: ''});
      });

      app.get('/booking', verifyJWT, async(req, res)=>{
        const email = req.query.email;
        const decodeEmail = req.decoded.email
        if(email !== decodeEmail){
          return res.status(403).send({message: 'forbidden access'})
        }
        const query = {email: email};
        const result = await bookingCollection.find(query).toArray();
        res.send(result);
      });

      app.get('/user/admin/:email', async(req, res)=>{
        const email = req.params.email;
        const  query = {email: email};
        const user = await userCollection.findOne(query);
        res.send({isAdmin: user?.role === 'admin'});
      })

      app.get('/users', verifyJWT, async(req, res)=>{
        const query = {};
        const users = await userCollection.find(query).toArray();
        res.send(users);
      });

      app.get('/contact', verifyJWT, async(req, res)=>{
        const query = {};
        const result = await contactUsCollection.find(query).toArray();
        res.send(result);
      });

      app.delete('/booking/:id',verifyJWT, async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await bookingCollection.deleteOne(query);
        res.send(result);
      });

      app.post('/booking', async(req, res)=>{
        const booking = req.body;
        const result = await bookingCollection.insertOne(booking);
        res.send(result);
      });

      app.post('/users', async(req, res)=>{
        const user = req.body;
        const result = await userCollection.insertOne(user);
        res.send(result);
      });

      app.post('/contact', async(req, res)=>{
        const message = req.body;
        const result = await contactUsCollection.insertOne(message);
        res.send(result);
      });

    } finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Luxurious hotel server is running')
});

app.listen(port, () => {
    console.log(`luxurious hotel running on port: ${port}`)
})