const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// =============================================
// Middleware
// =============================================
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const timestamp = new Date().toLocaleTimeString('th-TH');
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
  });
}

// =============================================
// Routes
// =============================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cards', require('./routes/cards'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/fare', require('./routes/fare'));
app.use('/api/topups', require('./routes/topups'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'BTS Rabbit Card API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error'
  });
});

// =============================================
// Start Server
// =============================================
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║   🚇 BTS Rabbit Card API Server             ║
║   Port: ${PORT}                                ║
║   Mode: ${process.env.NODE_ENV || 'development'}                       ║
║   Database: ${process.env.DB_NAME}              ║
╚══════════════════════════════════════════════╝
  `);
});

module.exports = app;
