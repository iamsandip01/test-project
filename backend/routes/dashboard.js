//Create a new dashboard route to handle user-specific data
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Protect the dashboard route
router.get('/', authMiddleware, async (req, res) => {
  res.json({ message: `Welcome, ${req.user.name}!`, user: req.user });
});

export default router;