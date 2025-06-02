import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile } from 'fs/promises';
import Station from '../models/Station.js';
import connectDB from '../config/database.js';

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Read the JSON file
    const stationsData = JSON.parse(
      await readFile(join(__dirname, '../data/stations.json'), 'utf8')
    );
    
    // Clear existing stations
    await Station.deleteMany({});
    console.log('Cleared existing stations');
    
    // Insert new stations
    const stations = await Station.insertMany(stationsData.stations);
    console.log(`Inserted ${stations.length} stations`);
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();