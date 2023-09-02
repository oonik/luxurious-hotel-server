const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

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

async function run() {
    try {
      const roomsCollection = client.db("luxuriousHotel").collection("rooms");

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