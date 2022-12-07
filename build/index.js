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
//require
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId, } = require('mongodb');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
//cors policy allowedOrigins
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'https://performcamp-8967f.web.app', 'https://performcamp-home.web.app'];
const options = {
    origin: allowedOrigins
};
app.use((0, cors_1.default)(options)); /* NEW */
app.use(express_1.default.json());
//mongodb connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0e6jqyu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});
//JWT verify
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized Access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' });
        }
        req.decoded = decoded;
        next();
    });
}
//database collections
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield client.connect();
            console.log('database connected');
            const database = client.db("PerformCamp");
            const customerReviews = database.collection("customerReviews");
            const userCollection = database.collection('users');
            const taskCollection = database.collection('tasks');
            const bookingsCollection = database.collection("bookings");
            const paymentsCollection = database.collection('payments');
            const pendingReviewCollection = database.collection('pendingReview');
            const employeeReviewCollection = database.collection('userReview');
            const employeeCollection = database.collection('employee');
            const feedbackCollection = database.collection('feedbacks');
            const leaderBoardCollection = database.collection('leaderboard');
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
            app.get("/customerReviews", (req, res) => __awaiter(this, void 0, void 0, function* () {
                const result = yield customerReviews.find({}).toArray();
                res.json(result);
            }));
            //post reviews
            app.post("/customerReviews", (req, res) => __awaiter(this, void 0, void 0, function* () {
                const item = req.body;
                const result = yield customerReviews.insertOne(item);
                res.json(result);
            }));
            //get manager
            app.get('/manager/:email', (req, res) => __awaiter(this, void 0, void 0, function* () {
                const email = req.params.email;
                const user = yield userCollection.findOne({ email: email });
                const isManager = user.role === 'Manager';
                res.send({ manager: isManager });
            }));
            //get all Users
            app.get("/user", (req, res) => __awaiter(this, void 0, void 0, function* () {
                const result = yield userCollection.find().toArray();
                res.send(result);
            }));
            //post users with email
            app.put('/user/:email', (req, res) => __awaiter(this, void 0, void 0, function* () {
                const user = req.body;
                const email = req.params.email;
                const filter = {
                    email: email
                };
                const options = {
                    upsert: true
                };
                const updateDoc = {
                    $set: user,
                };
                const result = yield userCollection.updateOne(filter, updateDoc, options);
                const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: '1d'
                });
                res.send({
                    result,
                    token
                });
            }));
            //delete user by email
            app.delete('/user/:email', (req, res) => __awaiter(this, void 0, void 0, function* () {
                const email = req.params.email;
                const filter = { email: email };
                const result = yield userCollection.deleteOne(filter);
                res.send(result);
            }));
            // post services
            app.post('/bookings', (req, res) => {
                console.log(req.body);
                const bookings = req.body;
                const result = bookingsCollection.insertOne(bookings);
                res.send(result);
            });
            //get bookings by id
            app.get('/bookings/:id', (req, res) => __awaiter(this, void 0, void 0, function* () {
                const id = req.params.id;
                const query = { _id: ObjectId(id) };
                const booking = yield bookingsCollection.findOne(query);
                res.send(booking);
            }));
            //delete booking by id
            app.delete('/bookings/:id', (req, res) => __awaiter(this, void 0, void 0, function* () {
                const id = req.params.id;
                console.log(id);
                const filter = { _id: ObjectId(id) };
                const result = yield bookingsCollection.deleteOne(filter);
                res.send(result);
            }));
            //get all bookings 
            app.get("/bookings", (req, res) => __awaiter(this, void 0, void 0, function* () {
                const bookings = yield bookingsCollection.find().toArray();
                res.send(bookings);
            }));
            //Post payment
            app.post("/create-payment-intent", (req, res) => __awaiter(this, void 0, void 0, function* () {
                const service = req.body;
                const price = service.price;
                const amount = price * 100;
                const paymentIntent = yield stripe.paymentIntents.create({
                    amount: amount,
                    currency: "usd",
                    payment_method_types: ["card"],
                });
                res.send({ clientSecret: paymentIntent.client_secret });
            }));
            //Patch booking by id
            app.patch('/bookings/:id', (req, res) => __awaiter(this, void 0, void 0, function* () {
                const id = req.params.id;
                const payment = req.body;
                const filter = { _id: ObjectId(id) };
                const updateDoc = {
                    $set: {
                        paid: true,
                        transaction: payment.transaction
                    }
                };
                const result = yield paymentsCollection.insertOne(payment);
                const updateOrder = yield bookingsCollection.updateOne(filter, updateDoc);
                res.send(updateDoc);
            }));
            //Set role to manager
            app.put('/user_admin/:email', (req, res) => __awaiter(this, void 0, void 0, function* () {
                const email = req.params.email;
                const filter = { email: email };
                const updateDoc = {
                    $set: { role: 'Manager' },
                };
                const result = yield userCollection.updateOne(filter, updateDoc);
                res.send(result);
            }));
            //get all tasks
            app.get("/task", (req, res) => __awaiter(this, void 0, void 0, function* () {
                const q = req.query;
                const cursor = taskCollection.find(q);
                const result = yield cursor.toArray();
                res.send(result);
            }));
            //Get task by assign email
            app.get('/task/:email', verifyJWT, (req, res) => __awaiter(this, void 0, void 0, function* () {
                const email = req.params.email;
                const decodedEmail = req.decoded.email;
                if (email === decodedEmail) {
                    const query = { email: email };
                    const cursor = taskCollection.find(query);
                    const tasks = yield cursor.toArray();
                    return res.send(tasks);
                }
                else {
                    return res.status(403).send({ message: 'Forbidden Access' });
                }
            }));
            //post task
            app.post('/task', (req, res) => __awaiter(this, void 0, void 0, function* () {
                const task = req.body;
                const result = yield taskCollection.insertOne(task);
                res.send(result);
            }));
            //Update task
            app.put('/task/:id', (req, res) => __awaiter(this, void 0, void 0, function* () {
                const id = req.params.id;
                const updatedTask = req.body;
                const filter = { _id: ObjectId(id) };
                const updateDoc = {
                    $set: updatedTask,
                };
                const result = yield taskCollection.updateOne(filter, updateDoc);
                res.send(result);
            }));
            //delete task by id
            app.delete('/task/:id', verifyJWT, (req, res) => __awaiter(this, void 0, void 0, function* () {
                const id = req.params.id;
                const filter = { _id: ObjectId(id) };
                const result = yield taskCollection.deleteOne(filter);
                res.send(result);
            }));
            //get pending review task;
            app.get('/pendingReview/:email', verifyJWT, (req, res) => __awaiter(this, void 0, void 0, function* () {
                const appointee = req.params.email;
                const decodedEmail = req.decoded.email;
                if (appointee === decodedEmail) {
                    const query = { appointee: appointee };
                    const cursor = pendingReviewCollection.find(query);
                    const tasks = yield cursor.toArray();
                    return res.send(tasks);
                }
                else {
                    return res.status(403).send({ message: 'Forbidden Access' });
                }
            }));
            //post pending review task
            app.post('/pendingReview', (req, res) => __awaiter(this, void 0, void 0, function* () {
                const task = req.body;
                const result = yield pendingReviewCollection.insertOne(task);
                res.send(result);
            }));
            //delete pending review by id
            app.delete('/pendingReview/:id', (req, res) => __awaiter(this, void 0, void 0, function* () {
                const id = req.params.id;
                const filter = { _id: ObjectId(id) };
                const result = yield pendingReviewCollection.deleteOne(filter);
                res.send(result);
            }));
            //get employee review given by manager
            app.get('/employeeReviews/:email', verifyJWT, (req, res) => __awaiter(this, void 0, void 0, function* () {
                const email = req.params.email;
                const decodedEmail = req.decoded.email;
                if (email === decodedEmail) {
                    const query = { email: email };
                    const cursor = employeeReviewCollection.find(query);
                    const reviews = yield cursor.toArray();
                    return res.send(reviews);
                }
            }));
            //get employee review
            app.get('/employeeReviews', verifyJWT, (req, res) => __awaiter(this, void 0, void 0, function* () {
                const reviews = yield employeeReviewCollection.find().toArray();
                res.send(reviews);
            }));
            //post employee review
            app.post('/employeeReviews', (req, res) => __awaiter(this, void 0, void 0, function* () {
                const review = req.body;
                const result = yield employeeReviewCollection.insertOne(review);
                res.send(result);
            }));
            //Add Employee
            app.post('/employee', (req, res) => __awaiter(this, void 0, void 0, function* () {
                const employee = req.body;
                const result = yield employeeCollection.insertOne(employee);
                res.send(result);
            }));
            //get feedback
            app.get('/feedback/:email', verifyJWT, (req, res) => __awaiter(this, void 0, void 0, function* () {
                const email = req.params.email;
                const decodedEmail = req.decoded.email;
                if (email === decodedEmail) {
                    const query = { email: email };
                    const cursor = feedbackCollection.find(query);
                    const feedbacks = yield cursor.toArray();
                    return res.send(feedbacks);
                }
                else {
                    return res.status(403).send({ message: 'Forbidden Access' });
                }
            }));
            //post feedback task
            app.post('/feedback', (req, res) => __awaiter(this, void 0, void 0, function* () {
                const feedback = req.body;
                const result = yield feedbackCollection.insertOne(feedback);
                res.send(result);
            }));
            //delete feedback task by id
            app.delete('/feedback/:id', verifyJWT, (req, res) => __awaiter(this, void 0, void 0, function* () {
                const id = req.params.id;
                const filter = { _id: ObjectId(id) };
                const result = yield feedbackCollection.deleteOne(filter);
                res.send(result);
            }));
            //get tasks by manager email
            app.get('/managerTask/:email', verifyJWT, (req, res) => __awaiter(this, void 0, void 0, function* () {
                const appointee = req.params.email;
                const decodedEmail = req.decoded.email;
                if (appointee === decodedEmail) {
                    const query = { appointee: appointee };
                    const cursor = taskCollection.find(query);
                    const tasks = yield cursor.toArray();
                    return res.send(tasks);
                }
            }));
            //Update leaderboard from review data
            app.put('/leaderboard/:email', (req, res) => __awaiter(this, void 0, void 0, function* () {
                const email = req.params.email;
                const filter = { email: email };
                const updatedLeaderboard = req.body;
                const options = { upsert: true };
                const updateDoc = {
                    $set: updatedLeaderboard,
                };
                const result = yield leaderBoardCollection.updateOne(filter, updateDoc, options);
                res.send(result);
            }));
            //get leaderboard
            app.get('/leaderboard', (req, res) => __awaiter(this, void 0, void 0, function* () {
                const leaderboard = yield leaderBoardCollection.find().toArray();
                res.send(leaderboard);
            }));
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
app.listen((process.env.PORT || 5000), () => {
    console.log(`Connected successfully on port ${port}`);
});
