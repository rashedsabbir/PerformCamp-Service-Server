import express, {Express, NextFunction, Request, Response} from "express";

import cors  from "cors"


declare namespace Express {
    interface Request {
        customProperties: string[];
    }
}

declare namespace NodeJS {  export interface ProcessEnv {    HOST: string;    DB_URL: string;    DB_NAME?: string;  }}

//require
const app: Express= express();
const port =process.env.PORT || 5000;
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId, } = require('mongodb');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

//cors policy allowedOrigins
const allowedOrigins = ['http://localhost:3000'];

const options: cors.CorsOptions = {
  origin: allowedOrigins
};

app.use(cors(options)); /* NEW */
app.use(express.json());

//mongodb connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0e6jqyu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1
});

//JWT verify
function verifyJWT(req:Request | any, res:Response, next:NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized Access' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err:Error, decoded:DecodeSuccessCallback) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden Access' });
    }
    req.decoded = decoded;
    next();
  });
}

//database collections
  async function run() {
    try {
      await client.connect()
      console.log('database connected')
      const database = client.db("PerformCamp");
      const customerReviews = database.collection("customerReviews");
      const userCollection = database.collection('users');
      const taskCollection = database.collection('tasks');

      // const verifyManager = async (req:Request | any, res:Response, next:NextFunction) => {
      //   const requester = req.decoded.email;
      //   const requesterAccount = await userCollection.findOne({ email: requester });
      //   if (requesterAccount.role === 'Manager') {
      //     next();
      //   }
      //   else {
      //     return res.status(403).send({ message: 'Forbidden Access' });
      //   }
      // }

    //get all reviews from database
    app.get("/customerReviews", async (req:Request | any, res:Response) => {
      const result = await customerReviews.find({}).toArray()
      res.json(result)
    })

    //post reviews
    app.post("/customerReviews", async (req:Request | any, res:Response) => {
      const item = req.body
      const result = await customerReviews.insertOne(item)
      res.json(result)
    })

    //get manager
    app.get('/manager/:email', async (req:Request | any, res:Response) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isManager = user.role === 'Manager';
      res.send({ manager: isManager });
    })

    //get task
    app.get("/task", async (req:Request | any, res:Response) => {
      const q = req.query;
      const cursor = taskCollection.find(q);
      const result = await cursor.toArray();
      res.send(result);
    });

    //Update task
    app.put('/task/:id', async (req:Request | any, res:Response) => {
      const id = req.params.id;
      const updatedTask = req.body;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: updatedTask,
      };
      const result = await taskCollection.updateOne(filter, updateDoc);
      res.send(result);

    })

    //get all Users
    app.get("/user", async (req:Request | any, res:Response) => {
      const result = await userCollection.find().toArray()
      res.send(result)
    })

    }
    finally { 

    }
  
  }
  
  run().catch(console.dir);

app.get('/', (req: Request, res: Response)=>{
    res.send('Hello from PerformCamp Server');
});

app.get('/check', (req: Request, res: Response)=>{
    res.send('Checking Server Routing, All ok!');
});

app.listen(port, ()=> {
    console.log(`Connected successfully on port ${port}`);
    
});