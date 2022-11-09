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
// service post part
// review posting part here
app.post('/services', async (req, res) => {
    const service = req.body;
    const result = await servicesCollection.insertOne(service);
    res.send(result)
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
    const cursor =reviewsCollection.find(query).sort({"time":-1});
    const result = await cursor.toArray();
    res.send(result);
})
// get data by email
app.get('/reviews', async (req, res) => {
    let query = {}
    if (req.query.email) {
        query = {            
            email: req.query.email
        }
    }
    const cursor = reviewsCollection.find(query).sort({"time":-1})
    const result = await cursor.toArray();
    res.send(result);
})
// delete method here
app.delete('/reviews/:id', async (req, res) => {
    const { id } = req.params;
    const query = { _id: ObjectId(id) };
    const result = await reviewsCollection.deleteOne(query);
    res.send(result);
})
// update method here
app.patch('/reviews/:id', async (req, res) => {
    try {
        const { id } = req.params;
    const query = { _id: ObjectId(id) };
    const comment = req.body;
    const updatedComment = {
        $set:{comment:comment}
    }
    const result = await reviewsCollection.updateOne(query, updatedComment);
    res.send(result);
    }
    catch (err) {
        console.log(err)
    }
})