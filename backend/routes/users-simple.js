import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const dbPath = path.join(__dirname, '..', 'data', 'db.json');

// Helper functions
function loadDB() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [], chores: [] };
  }
}

function saveDB(db) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// GET /api/users - Get all users
router.get('/', (req, res) => {
  try {
    const db = loadDB();
    res.json(db.users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:username - Get user by username
router.get('/:username', (req, res) => {
  try {
    const db = loadDB();
    const user = db.users.find(u => u.username === req.params.username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users - Create new user
router.post('/', (req, res) => {
  try {
    const { username, petHealth } = req.body;
    const db = loadDB();
    
    // Check if user already exists
    const existingUser = db.users.find(u => u.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    const user = {
      id: generateId(),
      username,
      petHealth: petHealth || 80,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.users.push(user);
    saveDB(db);
    
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:username - Update user
router.put('/:username', (req, res) => {
  try {
    const { petHealth } = req.body;
    const db = loadDB();
    
    const userIndex = db.users.findIndex(u => u.username === req.params.username);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    db.users[userIndex] = {
      ...db.users[userIndex],
      petHealth: Math.max(0, Math.min(100, petHealth)),
      updatedAt: new Date().toISOString()
    };
    
    saveDB(db);
    res.json(db.users[userIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/users/:username/health - Update pet health specifically
router.patch('/:username/health', (req, res) => {
  try {
    const { healthChange } = req.body;
    const db = loadDB();
    
    const userIndex = db.users.findIndex(u => u.username === req.params.username);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const currentHealth = db.users[userIndex].petHealth;
    const newHealth = Math.max(0, Math.min(100, currentHealth + healthChange));
    
    db.users[userIndex] = {
      ...db.users[userIndex],
      petHealth: newHealth,
      updatedAt: new Date().toISOString()
    };
    
    saveDB(db);
    res.json(db.users[userIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/users/:username - Delete user
router.delete('/:username', (req, res) => {
  try {
    const db = loadDB();
    const userIndex = db.users.findIndex(u => u.username === req.params.username);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    db.users.splice(userIndex, 1);
    saveDB(db);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;