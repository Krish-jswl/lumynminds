// Tracked by Git
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 1. Initialize the app FIRST
const app = express();
const PORT = process.env.PORT || 5000;

// 2. Middleware
app.use(cors());
app.use(express.json());

// 3. Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB Atlas!');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

// 4. Routes (Now it knows what 'app' is)
const ingestRoute = require('./routes/ingest');
app.use('/api/ingest', ingestRoute);

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'LumynMinds backend is running' });
});

// 5. Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
