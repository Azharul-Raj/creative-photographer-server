const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require("cors");
require('dotenv').config()
const app = express();

app.use(cors());
app.use(express.json());
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`running at ${port}`);
})

app.get('/', (req, res) => {
    res.send('Server up and running')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dnsrj7s.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });   
const run = async () => {
    client.connect();
    console.log('db connected')
}
run();
const servicesCollection=client.db("creativephotography").collection("services")
const reviewsCollection=client.db("creativephotography").collection("reviews")


app.get('/services', async (req, res) => {
    const cursor = servicesCollection.find({});
    const result = await cursor.limit(3).toArray();
    res.send(result)
})
app.get('/allservices', async (req, res) => {
    const cursor = servicesCollection.find({});
    const result = await cursor.toArray();
    res.send(result)
})
app.get('/service/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await servicesCollection.findOne(query);
    res.send(result);
})

// review posting part here
app.post('/reviews', async (req, res) => {
    const comment = req.body;
    const result = await reviewsCollection.insertOne(comment);
    res.send(result)
})

app.get('/reviews/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    const query = { service_id: id };
    const cursor =reviewsCollection.find(query);
    const result = await cursor.toArray();
    res.send(result);
})