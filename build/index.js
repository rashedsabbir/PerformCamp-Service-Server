"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId, } = require('mongodb');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const allowedOrigins = ['http://localhost:3000'];
const options = {
    origin: allowedOrigins
};
app.use((0, cors_1.default)(options)); /* NEW */
app.use(express_1.default.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0e6jqyu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield client.connect();
            console.log('database connected');
            const database = client.db("PerformCamp");
        }
        finally {
        }
    });
}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('Hello from PerformCamp Server');
});
app.get('/check', (req, res) => {
    res.send('Checking Server Routing, All ok!');
});
app.listen(port, () => {
    console.log(`Connected successfully on port ${port}`);
});
