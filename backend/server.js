// Tracked by Git
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const ingestRoute = require('./routes/ingest');
const authRoute = require('./routes/auth'); // <-- add this

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB Atlas!');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

app.use('/api/ingest', ingestRoute);
app.use('/api/auth', authRoute); // <-- add this

app.get('/api/health', (req, res) => {
  res.json({ status: 'LumynMinds backend is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
