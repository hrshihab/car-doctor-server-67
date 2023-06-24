const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
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

function verifyJwt(req,res,next) {
  const authHeaders = req.headers.authorization;
  //console.log(authHeaders);

  if(!authHeaders){
    return res.status(401).send({message: 'unauthorize access'});
  }
  const token = authHeaders.split(' ')[1];
  //console.log(token);

  jwt.verify(token,process.env.ACCESS_SECRET_TOKEN,function(err,decoded){
    if(err) {
      return res.status(403).send({message: 'Forbidden access'});
    }
    req.decoded = decoded;
    next();
  })
}

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


    //console.log(process.env.ACCESS_SECRET_TOKEN);
    app.post('/jwt',(req,res)=> {
      const user = req.body;
      const token = jwt.sign(user,process.env.ACCESS_SECRET_TOKEN,{expiresIn:'1d'})
      res.send({token});
      //console.log(user);
    })

    app.get('/services/:id',async(req,res)=> {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await services.findOne(query);
      res.send(result);
      //console.log(result);

    })

    app.post('/services/:id',verifyJwt,async(req,res)=> {
      const data = req.body;
      const result = await orders.insertOne(data);

      res.send(result);
      //console.log(result);


    })

    app.get('/orders',verifyJwt,async(req,res)=> {
      
      //console.log('order inside' , req.headers);
      const decoded = req.decoded;
      //console.log(decoded);
      if(decoded.email !== req.query.email){
        res.status(403).send({message: 'unauthorized access'})
      }
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

    app.delete('/orders/:id',verifyJwt,async(req,res)=> {
      const id = req.params.id;
      const query = {_id:new ObjectId(id)}
      const result = await orders.deleteOne(query);
      res.send(result);
      //console.log(result);
    })

    app.patch('/orders/:id',verifyJwt,async(req,res)=> {
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

