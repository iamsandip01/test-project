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
const PORT = process.env.PORT || 3002; // Use PORT from environment variables or default to 3002

// --- CORS Configuration ---
// IMPORTANT: Configure CORS before any other routes or middleware that handle requests.
// This ensures that preflight (OPTIONS) requests are handled correctly.

// Define the allowed origins for your frontend applications.
// You MUST include:
// 1. Your local development frontend URL (http://localhost:5173)
// 2. Your deployed frontend URL on Vercel (e.g., https://your-frontend-app.vercel.app)
//    Replace 'https://your-deployed-frontend-domain.vercel.app' with your actual frontend's Vercel URL.
const allowedOrigins = [
  'http://localhost:5173', // Your frontend's local development server
  'https://your-deployed-frontend-domain.vercel.app' // <-- IMPORTANT: REPLACE THIS with your actual deployed frontend URL on Vercel!
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    // OR if the origin is in our explicitly allowed list.
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Allow the request
    } else {
      // Deny the request if the origin is not allowed
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly allow common HTTP methods, including OPTIONS for preflight
  credentials: true, // Allow cookies and authorization headers to be sent with requests
}));

// --- Other Middleware ---
app.use(express.json()); // Parses incoming requests with JSON payloads
app.use(express.urlencoded({ extended: true })); // Parses incoming requests with URL-encoded payloads

// Welcome route for basic API check
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

// Export the app for testing or other purposes (e.g., Vercel's implicit serverless function handling)
export default app;
