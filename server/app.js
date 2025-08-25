const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();
const xss = require('xss');

const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blog');
const projectRoutes = require('./routes/projects');
const resourceRoutes = require('./routes/resources');
const serviceRoutes = require('./routes/services');
const paymentRoutes = require('./routes/payments');
const bookingRoutes = require('./routes/bookings');
const socialRoutes = require('./routes/social');
const contactRoutes = require('./routes/contact');

const app = express();

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// NoSQL injection sanitize
app.use(mongoSanitize());

// XSS sanitize basic strings
const sanitizeRequestBody = (data) => {
  if (typeof data === 'string') return xss(data);
  if (Array.isArray(data)) return data.map((i) => sanitizeRequestBody(i));
  if (data && typeof data === 'object') {
    const out = {};
    for (const k of Object.keys(data)) out[k] = sanitizeRequestBody(data[k]);
    return out;
  }
  return data;
};
app.use((req, res, next) => {
  if (req.body) req.body = sanitizeRequestBody(req.body);
  next();
});

// Prevent HTTP param pollution
app.use(hpp());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting on API
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Static
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/contact', contactRoutes);

// Health
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// 404
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;
