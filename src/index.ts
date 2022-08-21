import express, {Express, NextFunction, Request, Response} from "express";

import cors  from "cors"


declare namespace Express {
    interface Request {
        customProperties: string[];
    }
}

declare namespace NodeJS {  export interface ProcessEnv {    HOST: string;    DB_URL: string;    DB_NAME?: string;  }}


const app: Express= express();
const port =process.env.PORT || 5000;
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId, } = require('mongodb');
const jwt = require('jsonwebtoken');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const allowedOrigins = ['http://localhost:3000'];

const options: cors.CorsOptions = {
  origin: allowedOrigins
};

app.use(cors(options)); /* NEW */
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0e6jqyu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1
});




  async function run() {
    try {
      await client.connect()
      console.log('database connected')
      const database = client.db("PerformCamp");
      
      
     


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