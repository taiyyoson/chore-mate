import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple file-based database for development
const dbPath = path.join(__dirname, 'data', 'db.json');
let db = {};

// Load database
function loadDB() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    db = JSON.parse(data);
  } catch (error) {
    console.log('Creating new database file');
    db = { users: [], chores: [] };
    saveDB();
  }
}

// Save database
function saveDB() {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// Initialize database
loadDB();

// Import simple routes for file-based database
import userRoutesSimple from './routes/users-simple.js';
import choreRoutesSimple from './routes/chores-simple.js';

// Serve static files from the React build
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Routes
app.use('/api/users', userRoutesSimple);
app.use('/api/chores', choreRoutesSimple);

// middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ChorePet backend server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Catch-all handler: serve React app for any non-API routes
app.get('*', (req, res) => {
  // Don't serve React app for API routes
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API route not found' });
  } else {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});