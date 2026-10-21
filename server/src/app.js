const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = require('./config/db');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const testRoutes = require('./routes/testRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(null, true); // Permissive during dev / testing
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result, CURRENT_TIMESTAMP() AS server_time');
    res.json({
      status: 'UP',
      message: 'Driving School Management System API is healthy',
      database: 'Connected to TiDB Cloud MySQL',
      timestamp: rows[0].server_time,
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'DOWN',
      message: 'Database connection error',
      error: error.message
    });
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.url}` });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` DRIVING SCHOOL MANAGEMENT SYSTEM API (COCSIT BCA) `);
    console.log(` Server running on: http://localhost:${PORT}`);
    console.log(` Connected to TiDB: ${process.env.DB_HOST}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
  });
}

module.exports = app;
