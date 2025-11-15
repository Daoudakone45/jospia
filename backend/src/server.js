const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

console.log('🔧 Starting JOSPIA Backend...');
console.log('📍 Node version:', process.version);
console.log('📍 Environment:', process.env.NODE_ENV || 'development');
console.log('📍 Supabase URL:', process.env.SUPABASE_URL ? '✓ Configured' : '✗ Missing');

const app = express();

// Import routes with error handling
console.log('\n📦 Loading routes...');

let authRoutes, inscriptionRoutes, paymentRoutes, receiptRoutes, dormitoryRoutes, statsRoutes, sectionRoutes;

try {
  console.log('  → auth.routes...');
  authRoutes = require('./routes/auth.routes');
  console.log('  ✓ auth.routes loaded');
} catch (error) {
  console.error('  ✗ Failed to load auth.routes:', error.message);
  process.exit(1);
}

try {
  console.log('  → inscription.routes...');
  inscriptionRoutes = require('./routes/inscription.routes');
  console.log('  ✓ inscription.routes loaded');
} catch (error) {
  console.error('  ✗ Failed to load inscription.routes:', error.message);
}

try {
  console.log('  → payment.routes...');
  paymentRoutes = require('./routes/payment.routes');
  console.log('  ✓ payment.routes loaded');
} catch (error) {
  console.error('  ✗ Failed to load payment.routes:', error.message);
}

try {
  console.log('  → receipt.routes...');
  receiptRoutes = require('./routes/receipt.routes');
  console.log('  ✓ receipt.routes loaded');
} catch (error) {
  console.error('  ✗ Failed to load receipt.routes:', error.message);
}

try {
  console.log('  → dormitory.routes...');
  dormitoryRoutes = require('./routes/dormitory.routes');
  console.log('  ✓ dormitory.routes loaded');
} catch (error) {
  console.error('  ✗ Failed to load dormitory.routes:', error.message);
}

try {
  console.log('  → stats.routes...');
  statsRoutes = require('./routes/stats.routes');
  console.log('  ✓ stats.routes loaded');
} catch (error) {
  console.error('  ✗ Failed to load stats.routes:', error.message);
}

try {
  console.log('  → section.routes...');
  sectionRoutes = require('./routes/section.routes');
  console.log('  ✓ section.routes loaded');
} catch (error) {
  console.error('  ✗ Failed to load section.routes:', error.message);
}

// Import middleware
console.log('\n📦 Loading middleware...');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
console.log('  ✓ Middleware loaded');

// Middleware
console.log('\n⚙️  Configuring middleware...');

// Trust proxy - IMPORTANT pour ngrok et autres proxies
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
app.use(rateLimiter);
console.log('  ✓ Middleware configured');

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
console.log('\n🛣️  Registering routes...');
if (authRoutes) {
  app.use('/api/auth', authRoutes);
  console.log('  ✓ /api/auth');
}
if (inscriptionRoutes) {
  app.use('/api/inscriptions', inscriptionRoutes);
  console.log('  ✓ /api/inscriptions');
}
if (paymentRoutes) {
  app.use('/api/payments', paymentRoutes);
  console.log('  ✓ /api/payments');
}
if (receiptRoutes) {
  app.use('/api/receipts', receiptRoutes);
  console.log('  ✓ /api/receipts');
}
if (dormitoryRoutes) {
  app.use('/api/dormitories', dormitoryRoutes);
  console.log('  ✓ /api/dormitories');
}
if (statsRoutes) {
  app.use('/api/stats', statsRoutes);
  console.log('  ✓ /api/stats');
}
if (sectionRoutes) {
  app.use('/api/sections', sectionRoutes);
  console.log('  ✓ /api/sections');
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
console.log('\n🚀 Starting server...');
app.listen(PORT, () => {
  console.log('\n═════════════════════════════════════════════');
  console.log('✅ JOSPIA Backend Server is Running!');
  console.log('═════════════════════════════════════════════');
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 Login endpoint: POST http://localhost:${PORT}/api/auth/login`);
  console.log('═════════════════════════════════════════════\n');
});

module.exports = app;
