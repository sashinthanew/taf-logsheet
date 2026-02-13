require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS Configuration for production
const allowedOrigins = [
  'http://localhost:5173', // Local development
  process.env.CLIENT_URL || 'https://your-app.vercel.app' // Production
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✓ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'TWL System API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});
