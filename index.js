const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require("cors");
require('dotenv').config()
const app = express();
var jwt = require('jsonwebtoken');

app.use(cors());
app.use(express.json());
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`running at ${port}`);
})

app.get('/', (req, res) => {
    res.send('Server up and running')
})

const verifyJWT = (req,res,next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('Unauthorized User')
    }
    const token = req.headers.authorization.split(' ')[1]
    jwt.verify(token, process.env.SECRET_KEY, (err,decoded) => {
        if (err) {
            console.log(err);
            return res.status(401).send('Invalid Token')
        }
        req.decoded = decoded;
        next();
    })
}


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
app.post('/services',verifyJWT, async (req, res) => {
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
app.get('/reviews',verifyJWT, async (req, res) => {
    const decoded = req.decoded;
    if (decoded.email !== req.query.email) {
        return res.status(403).send('Unauthorize Access');
    }
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
app.delete('/reviews/:id',verifyJWT, async (req, res) => {
    const { id } = req.params;
    const query = { _id: ObjectId(id) };
    const result = await reviewsCollection.deleteOne(query);
    res.send(result);
})
// update method here
app.patch('/reviews/:id',verifyJWT, async (req, res) => {
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
// jet added 
app.post('/jwt', (req, res) => {
    const info = req.body;
    const token = jwt.sign(info, process.env.SECRET_KEY, { expiresIn: '1h' });
    res.send({token})
})