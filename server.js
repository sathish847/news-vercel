const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// CORS configuration - allow all origins for multiple frontend URLs
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Allow all origins with *
  credentials: false, // Must be false when using * origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Authorization']
};

// Security middleware
app.use(helmet()); // Security headers
app.use(compression()); // Response compression
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection with optimized settings for Vercel/serverless
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/express-backend', {
      // Connection pool settings for serverless
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      // Additional options for better performance
      retryWrites: true,
      retryReads: true,
    });

    console.log('MongoDB connected successfully');
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Don't exit process in serverless environment
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    throw error;
  }
};

// Initialize database connection
connectDB();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const newsRoutes = require('./routes/news');
const subNewsRoutes = require('./routes/subnews');
const miniNewsRoutes = require('./routes/mini_news');
const mainNewsRoutes = require('./routes/main_news');
const trendingNewsRoutes = require('./routes/trending_news');
const combinedNewsRoutes = require('./routes/combined_news');

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Express Backend API',
    secure: req.secure,
    protocol: req.protocol
  });
});

// API routes
app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/subnews', subNewsRoutes);
app.use('/api/mini_news', miniNewsRoutes);
app.use('/api/main_news', mainNewsRoutes);
app.use('/api/trending_news', trendingNewsRoutes);
app.use('/api/all_news', combinedNewsRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    secure: req.secure
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';

  res.status(err.status || 500).json({
    message: isDevelopment ? err.message : 'Internal Server Error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start HTTP server
const httpServer = http.createServer(app);
httpServer.listen(PORT, () => {
  console.log(`HTTP Server is running on port ${PORT}`);
});

// Start HTTPS server (if certificates exist)
try {
  const sslKeyPath = path.join(__dirname, 'ssl', 'key.pem');
  const sslCertPath = path.join(__dirname, 'ssl', 'cert.pem');

  if (fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
    const sslOptions = {
      key: fs.readFileSync(sslKeyPath),
      cert: fs.readFileSync(sslCertPath),
    };

    const httpsServer = https.createServer(sslOptions, app);
    httpsServer.listen(HTTPS_PORT, () => {
      console.log(`HTTPS Server is running on port ${HTTPS_PORT}`);
    });
  } else {
    console.log('SSL certificates not found. HTTPS server not started.');
    console.log('To enable HTTPS, place key.pem and cert.pem in the ssl/ directory');
  }
} catch (error) {
  console.error('Error starting HTTPS server:', error.message);
}

module.exports = app;
