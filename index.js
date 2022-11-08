const express = require("express");
const { MongoClient, ServerApiVersion } = require('mongodb');
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


app.post('/services', async (req, res) => {
    const info = req.body;
    const result = servicesCollection.insertOne(info);
    res.send(result)
})