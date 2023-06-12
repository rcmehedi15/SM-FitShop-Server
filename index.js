// esential require 
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000

// middleware
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())
app.use((req, res, next) => {
    res.header({ "Access-Control-Allow-Origin": "*" });
    next();
})
// database connection 

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@mehedi15.lrak9tg.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
})

async function run() {
    try {
        /// our all collection 
        const usersCollection = client.db('SM-Fit').collection('users')
        const classesCollection = client.db('SM-Fit').collection('classes')

        // save user email and role
        app.put('/users/:email', async (req, res) => {
            const email = req.params.email
            const user = req.body
            const query = { email: email }
            console.log(query);
            const options = { upsert: true }
            const updateDoc = {
                $set: user,
            }
            const result = await usersCollection.updateOne(query, updateDoc, options)
            console.log(result)
            res.send(result)
        })
        // save instructor added class database
        app.post('/classes', async (req, res) => {
            const singleClass = req.body;
            console.log(singleClass);
            const result = await classesCollection.insertOne(singleClass);
            res.send(result);
        })


            /
            // Update instructor post data
            app.put('/classes/:id', async (req, res) => {
                const classes = req.body
                const filter = { _id: new ObjectId(req.params.id) }
                const options = { upsert: true }
                const updateDoc = {
                    $set: classes,
                }
                const result = await classesCollection.updateOne(filter, updateDoc, options)
                res.send(result)
            })

        /// get all uses 
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray()
            res.send(result)
            console.log(result);
        })
        // only instructor show
        app.get('/users/instructor', async (req, res) => {
            const filter = { role: 'instructor' }
            const result = await usersCollection.find(filter).toArray()
            res.send(result)
            console.log(result);
        })

        // get all classes data 

        app.get('/classes', async (req, res) => {
            const result = await classesCollection.find().toArray()
            res.send(result)
            console.log(result);
        })


        // Get a instructor posted single class
        app.get('/classes/:email', async (req, res) => {
            const email = req.params.email;
            const query = { 'instructor.email': email };

            try {
                const result = await classesCollection.find(query).toArray();
                res.send(result);
                console.log(result);
            } catch (error) {
                console.error(error);
                res.status(500).send('An error occurred');
            }
        });

        // deleted single room 
        app.delete('/classes/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await classesCollection.deleteOne(query)
            res.send(result)
            console.log(result);
        })



        // Get user
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await usersCollection.findOne(query)
            res.send(result)
        })

        // user data patch
        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: 'admin'
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result)
        })
        // Send a ping to confirm a successful connection
        await client.db('admin').command({ ping: 1 })
        console.log(
            'Pinged your deployment. You successfully connected to MongoDB!'
        )
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('SM-Fit Server is running..')
})

app.listen(port, () => {
    console.log(`SM-Fit is running on port ${port}`)
})