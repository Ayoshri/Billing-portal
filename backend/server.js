import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { seedMockStore } from './models/mockStore.js';

// Route files
import authRoutes from './routes/auth.js';
import teamRoutes from './routes/team.js';
import billingRoutes from './routes/billing.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Set global flag
global.useMockDb = false;

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// Database connection
const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/saas-billing-portal';
    // Set connection timeout to 2 seconds so we fail fast and fallback
    await mongoose.connect(connStr, { serverSelectionTimeoutMS: 2000 });
    console.log(`MongoDB Connected successfully to: ${connStr}`);
  } catch (error) {
    console.warn(`[WARNING] MongoDB connection failed: ${error.message}`);
    console.warn(`[FALLBACK] Activating In-Memory Mock Database Mode. Database changes will persist in memory for this session.`);
    global.useMockDb = true;
    await seedMockStore();
    console.log(`[SEED] Pre-seeded 3 role accounts under 'Acme Corp' in mock store.`);
  }
};

connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/billing', billingRoutes);

// Base route for status checks
app.get('/', (req, res) => {
  res.json({ 
    message: 'SaaS Billing Portal API is running...',
    databaseMode: global.useMockDb ? 'In-Memory Mock Store' : 'MongoDB'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

// Start Server
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in development mode`);
  });
}

export default app;
