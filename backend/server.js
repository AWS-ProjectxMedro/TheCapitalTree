const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { sequelize, setupAssociations } = require('./models');
const userRoutes = require('./routes/userRoutes');
const planRoutes = require('./routes/planRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const marketRoutes = require('./routes/marketRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const blogRoutes = require('./routes/blogRoutes');
const faqRoutes = require('./routes/faqRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const withdrawalRoutes = require('./routes/withdrawalRoutes');
const firebaseUserRoutes = require('./routes/firebaseUserRoutes');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Verify environment variables
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("ALPHA_VANTAGE_API_KEY:", process.env.ALPHA_VANTAGE_API_KEY);

const app = express();

// Enhanced CORS Configuration
const corsOptions = {
  origin: [
    'https://thecapitaltree.in',
    'https://www.thecapitaltree.in',
    'http://43.204.120.102' // For development
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept'
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Security Middlewares
app.use(helmet());
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Setup database associations
setupAssociations();

// Register Routes
app.use('/api/users', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/prediction', predictionRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);

app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/firebase-users', firebaseUserRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Database synchronization
sequelize.sync({
  force: false, // Don't drop existing tables
  alter: true   // Safely alter tables to match models
})
.then(() => {
  console.log("Database synchronized successfully");
  const PORT = process.env.PORT || 3308;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("Available routes:");
    console.log("- /api/users");
    console.log("- /api/plans");
    console.log("- /api/payments");
    console.log("- /api/health");
    // Add other routes as needed
  });
})

.catch(err => {
  console.error("Database synchronization failed:", err);
  process.exit(1);
});

module.exports = app;
