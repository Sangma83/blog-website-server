const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4xueldm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server (optional starting in v4.7)
    // await client.connect();

    const recentBlogCollection = client.db('BlogTravel').collection('recentBlog');
    const commentsCollection = client.db('BlogTravel').collection('comments');

    // Fetch all recent blogs
    app.get('/recentBlog', async (req, res) => {
      const cursor = recentBlogCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Fetch a specific blog by ID
    app.get('/recentBlog/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await recentBlogCollection.findOne(query);
      res.send(result);
    });

    // Fetch comments for a specific blog
    app.get('/comments/:blogId', async (req, res) => {
      const blogId = req.params.blogId;
      const query = { blogId: new ObjectId(blogId) };
      const cursor = commentsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Add a new comment to a blog
    app.post('/comments', async (req, res) => {
      const comment = req.body;
      comment.blogId = new ObjectId(comment.blogId);  // Ensure blogId is an ObjectId
      comment.createdAt = new Date();  // Add timestamp
      const result = await commentsCollection.insertOne(comment);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Travel Blog is running');
});

app.listen(port, () => {
  console.log(`Travel Blog Server is running on port ${port}`);
});
