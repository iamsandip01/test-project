import express from 'express';
import Station from '../models/Station.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all stations
router.get('/', async (req, res) => {
  try {
    const stations = await Station.find().sort({ createdAt: -1 });
    res.json(stations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stations', error: error.message });
  }
});

// Get station by ID
router.get('/:id', async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    
    res.json(station);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch station', error: error.message });
  }
});

// Create new station (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, location, status, powerOutput, connectorType } = req.body;
    
    const station = new Station({
      name,
      location,
      status,
      powerOutput,
      connectorType,
      createdBy: req.user.id
    });
    
    await station.save();
    
    res.status(201).json(station);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create station', error: error.message });
  }
});

// Update station (protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, location, status, powerOutput, connectorType } = req.body;
    
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    
    // Update fields
    station.name = name;
    station.location = location;
    station.status = status;
    station.powerOutput = powerOutput;
    station.connectorType = connectorType;
    
    await station.save();
    
    res.json(station);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update station', error: error.message });
  }
});

// Delete station (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    
    await station.deleteOne();
    
    res.json({ message: 'Station deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete station', error: error.message });
  }
});

export default router;