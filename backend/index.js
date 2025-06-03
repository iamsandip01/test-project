import express from 'express';
import mongoose from 'mongoose'; // Assuming mongoose is used for MongoDB connection
import cors from 'cors'; // Already imported, but we'll configure it explicitly
import dotenv from 'dotenv';
import connectDB from './config/database.js'; // Path to your database connection logic
import authRoutes from './routes/auth.js';
import stationRoutes from './routes/stations.js';
import dashboardRoutes from './routes/dashboard.js';

// Load environment variables from .env file
dotenv.config();

// Create Express app instance
const app = express();
const PORT = process.env.PORT || 3002;
const allowedOrigins = [
  'http://localhost:5173', // Your frontend's local development server
  'https://your-deployed-frontend-domain.vercel.app' // <-- IMPORTANT: REPLACE THIS with your actual deployed frontend URL on Vercel!
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,   
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('EV Charging Station Management API');
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/dashboard', dashboardRoutes); // Added this based on your snippet

// Connect to database before starting the server
connectDB().then(() => {
  // Start the Express server only after a successful database connection
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access backend at: http://localhost:${PORT} (for local development)`);
    console.log(`Deployed backend at: https://test-project-lake-eta.vercel.app/ (on Vercel)`);
  });
}).catch(error => {
  console.error('Failed to connect to database:', error);
  // Exit the process if database connection fails
  process.exit(1);
});

// --- Global Error Handling Middleware ---
// This catches any errors thrown in your routes or other middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the full error stack to the console
  res.status(500).json({
    message: 'An unexpected error occurred',
    // In production, avoid sending detailed error messages to the client for security
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

// Export the app for testing or other purposes (e.g., Vercel's   implicit serverless function handling)
export default app;
