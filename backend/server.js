require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const ingestRoute = require('./routes/ingest');
const authRoute = require('./routes/auth');
const assessmentRoute = require('./routes/assessment');
const adaptationRoute = require('./routes/adaptation');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB Atlas!');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

// Routes
app.use('/api/ingest', ingestRoute);
app.use('/api/auth', authRoute);
app.use('/api/assessment', assessmentRoute);
app.use('/api/adaptation', adaptationRoute);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'LumynMinds backend is running',
    dbConnected: mongoose.connection.readyState === 1
  });
});

// JSON error handler (e.g., Multer upload validation errors)
app.use((err, req, res, next) => {
  if (err) {
    const status = err.status || (err.name === 'MulterError' ? 400 : 400);
    return res.status(status).json({ error: err.message || 'Request failed' });
  }
  next();
});

// Server Start
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});