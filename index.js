const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.get('/',(req,res)=> {
  res.send('Server is running');
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wwvmwag.mongodb.net/?retryWrites=true&w=majority`

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
    const database = client.db('carDoctor');
    const services = database.collection('services');
    const orders = database.collection('orders');

    app.get('/services',async(req,res)=> {
      const query = {};

      const cursor = services.find(query);
      const result = await cursor.toArray();
      res.send(result);
      
    })

    app.get('/services/:id',async(req,res)=> {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await services.findOne(query);
      res.send(result);
      //console.log(result);

    })

    app.post('/services/:id',async(req,res)=> {
      const data = req.body;
      const result = await orders.insertOne(data);

      res.send(result);
      //console.log(result);


    })

    app.get('/orders',async(req,res)=> {
      
      let query = {};
      if(req.query?.email) {
        query = {
          email : req.query.email
        }
      }
      const cursor = orders.find(query);
      const result = await cursor.toArray();
      res.send(result);

    })

    app.delete('/orders/:id',async(req,res)=> {
      const id = req.params.id;
      const query = {_id:new ObjectId(id)}
      const result = await orders.deleteOne(query);
      res.send(result);
      //console.log(result);
    })

    app.patch('/orders/:id',async(req,res)=> {
      const id =req.params.id;
      const query = {_id : new ObjectId(id)}
      const updateDoc = {
        $set: {
          status : 'Approved'
        }
      }

      const result = await orders.updateOne(query,updateDoc);
      res.send(result);


    })
   

  
  } finally {
   
  }
}
run().catch(console.dir);

app.listen(port,()=> {
  console.log(`Port is running on ${port}`);
})

