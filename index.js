const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://blog-travel-website.web.app'],
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
    const wishlistCollection = client.db('BlogTravel').collection('wishlist'); // Initialize the wishlist collection

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

    // Add a blog to the wishlist
    app.post('/wishlist', async (req, res) => {
      const wishlistItem = req.body;
      const result = await wishlistCollection.insertOne(wishlistItem);
      res.send(result);
    });

    // Fetch wishlist items for a specific user
    app.get('/wishlist/:userId', async (req, res) => {
      const userId = req.params.userId;
      const query = { userId: userId };
      const cursor = wishlistCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //Delete wishlist items for a specific user
    app.delete('/wishlist/:userId', async(req, res) =>{
      const userId = req.params.userId;
      const query = { _id: new ObjectId(userId) };
      const result = await wishlistCollection.deleteOne(query);
      res.send(result);

    })

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
      comment.blogId = {_id: new ObjectId(comment.blogId)};  // Ensure blogId is an ObjectId
      comment.createdAt = new Date();  // Add timestamp
      const result = await commentsCollection.insertOne(comment);
      res.send(result);
    });

    // Add a new blog post
    app.post('/recentBlog', async (req, res) => {
      const blogPost = req.body;
      blogPost.createdAt = new Date();  // Add timestamp
      const result = await recentBlogCollection.insertOne(blogPost);
      res.send(result);
    });



   // Fetch all recent blogs with text search
// app.get('/recentBlogSearch', async (req, res) => {
//   const searchText = req.query.search || ''; // Get search text from query parameter
//   const query = {
//     $text: {
//       $search: searchText,
//       $caseSensitive: false, // Optional: Case sensitivity
//       $diacriticSensitive: false // Optional: Diacritic sensitivity
//     }
//   };
//   const cursor = recentBlogCollection.find(query);
//   const result = await cursor.toArray();
//   res.send(result);
// });


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
