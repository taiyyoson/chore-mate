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

// GET /api/chores - Get all chores
router.get('/', (req, res) => {
  try {
    const { completed } = req.query;
    const db = loadDB();
    let chores = db.chores;
    
    if (completed !== undefined) {
      chores = chores.filter(c => c.completed === (completed === 'true'));
    }
    
    res.json(chores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/chores/:id - Get chore by ID
router.get('/:id', (req, res) => {
  try {
    const db = loadDB();
    const chore = db.chores.find(c => c.id === req.params.id);
    if (!chore) {
      return res.status(404).json({ error: 'Chore not found' });
    }
    res.json(chore);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/chores - Create new chore
router.post('/', (req, res) => {
  try {
    const { name, frequency, roommate, progress } = req.body;
    const db = loadDB();
    
    // Verify the roommate exists
    const user = db.users.find(u => u.username === roommate);
    if (!user) {
      return res.status(400).json({ error: 'Roommate not found' });
    }
    
    const chore = {
      id: generateId(),
      name,
      frequency,
      roommate,
      progress: progress || 0,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null
    };
    
    db.chores.push(chore);
    saveDB(db);
    
    res.status(201).json(chore);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/chores/:id - Update chore
router.put('/:id', (req, res) => {
  try {
    const { name, frequency, roommate, progress, completed } = req.body;
    const db = loadDB();
    
    const choreIndex = db.chores.findIndex(c => c.id === req.params.id);
    if (choreIndex === -1) {
      return res.status(404).json({ error: 'Chore not found' });
    }
    
    db.chores[choreIndex] = {
      ...db.chores[choreIndex],
      name: name || db.chores[choreIndex].name,
      frequency: frequency || db.chores[choreIndex].frequency,
      roommate: roommate || db.chores[choreIndex].roommate,
      progress: progress !== undefined ? progress : db.chores[choreIndex].progress,
      completed: completed !== undefined ? completed : db.chores[choreIndex].completed,
      updatedAt: new Date().toISOString()
    };
    
    saveDB(db);
    res.json(db.chores[choreIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/chores/:id/complete - Complete a chore (increment progress)
router.patch('/:id/complete', (req, res) => {
  try {
    const db = loadDB();
    
    const choreIndex = db.chores.findIndex(c => c.id === req.params.id);
    if (choreIndex === -1) {
      return res.status(404).json({ error: 'Chore not found' });
    }
    
    const chore = db.chores[choreIndex];
    if (chore.completed) {
      return res.status(400).json({ error: 'Chore already completed' });
    }
    
    // Increment progress
    chore.progress += 1;
    
    // Check if chore is now complete
    if (chore.progress >= chore.frequency) {
      chore.completed = true;
      chore.completedAt = new Date().toISOString();
      
      // Reward the pet owner with health increase
      const userIndex = db.users.findIndex(u => u.username === chore.roommate);
      if (userIndex !== -1) {
        db.users[userIndex].petHealth = Math.min(db.users[userIndex].petHealth + 10, 100);
        db.users[userIndex].updatedAt = new Date().toISOString();
      }
    }
    
    chore.updatedAt = new Date().toISOString();
    db.chores[choreIndex] = chore;
    
    saveDB(db);
    res.json({
      chore: chore,
      petHealthUpdated: chore.completed
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/chores/:id/reset - Reset chore progress
router.patch('/:id/reset', (req, res) => {
  try {
    const db = loadDB();
    
    const choreIndex = db.chores.findIndex(c => c.id === req.params.id);
    if (choreIndex === -1) {
      return res.status(404).json({ error: 'Chore not found' });
    }
    
    db.chores[choreIndex] = {
      ...db.chores[choreIndex],
      progress: 0,
      completed: false,
      completedAt: null,
      updatedAt: new Date().toISOString()
    };
    
    saveDB(db);
    res.json(db.chores[choreIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/chores/:id - Delete chore
router.delete('/:id', (req, res) => {
  try {
    const db = loadDB();
    const choreIndex = db.chores.findIndex(c => c.id === req.params.id);
    
    if (choreIndex === -1) {
      return res.status(404).json({ error: 'Chore not found' });
    }
    
    db.chores.splice(choreIndex, 1);
    saveDB(db);
    
    res.json({ message: 'Chore deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/chores/:id/complete - Complete a chore (increment progress) - MOVED UP
router.patch('/:id/complete', (req, res) => {
  try {
    const db = loadDB();
    
    const choreIndex = db.chores.findIndex(c => c.id === req.params.id);
    if (choreIndex === -1) {
      return res.status(404).json({ error: 'Chore not found' });
    }
    
    const chore = db.chores[choreIndex];
    if (chore.completed) {
      return res.status(400).json({ error: 'Chore already completed' });
    }
    
    // Increment progress
    chore.progress += 1;
    
    // Check if chore is now complete
    if (chore.progress >= chore.frequency) {
      chore.completed = true;
      chore.completedAt = new Date().toISOString();
      
      // Reward the pet owner with health increase
      const userIndex = db.users.findIndex(u => u.username === chore.roommate);
      if (userIndex !== -1) {
        db.users[userIndex].petHealth = Math.min(db.users[userIndex].petHealth + 10, 100);
        db.users[userIndex].updatedAt = new Date().toISOString();
      }
    }
    
    chore.updatedAt = new Date().toISOString();
    db.chores[choreIndex] = chore;
    
    saveDB(db);
    res.json({
      chore: chore,
      petHealthUpdated: chore.completed
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/chores/user/:username - Get chores for specific user  
router.get('/user/:username', (req, res) => {
  try {
    const { completed } = req.query;
    const db = loadDB();
    let chores = db.chores.filter(c => c.roommate === req.params.username);
    
    if (completed !== undefined) {
      chores = chores.filter(c => c.completed === (completed === 'true'));
    }
    
    res.json(chores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;