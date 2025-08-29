import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const dbPath = path.join(__dirname, '..', 'data', 'db.json');

//get demo-adjusted current time
let demoTimeOffset = 0; 
function getDemoTime() {
  return new Date(Date.now() + demoTimeOffset);
}

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

function calculateDaysLeft(deadline) {
  const now = getDemoTime(); // account for demo manipulated time 
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays); // Don't return negative days
}

function addDaysLeftToChore(chore) {
  if (chore.deadline) {
    chore.daysLeft = calculateDaysLeft(chore.deadline);
  } else {
    chore.daysLeft = 7; // Default for older chores without deadline
  }
  return chore;
}

function processHealthDecrements() {
  const db = loadDB();
  const now = getDemoTime();
  const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Find all incomplete chores (regardless of deadline)
  const incompleteChores = db.chores.filter(chore => {
    return !chore.completed; // Any incomplete chore
  });
  
  // Group incomplete chores by user
  const choresByUser = {};
  incompleteChores.forEach(chore => {
    if (!choresByUser[chore.roommate]) {
      choresByUser[chore.roommate] = [];
    }
    choresByUser[chore.roommate].push(chore);
  });
  
  let healthUpdates = [];
  
  // Processing each user with incomplete chores
  Object.keys(choresByUser).forEach(username => {
    const userIndex = db.users.findIndex(u => u.username === username);
    if (userIndex === -1) return;
    
    const user = db.users[userIndex];
    const userChores = choresByUser[username];
    
    // Check if we already processed health decrement today
    const lastDecrementDate = user.lastHealthDecrementDate;
    if (lastDecrementDate === todayStr) {
      return; // Already processed today
    }
    
    // Calculate total health decrement (5% per incomplete chore)
    const decrementPerChore = 5; // 5% per chore
    const totalDecrement = userChores.length * decrementPerChore;
    
    // Apply health decrement
    const currentHealth = user.petHealth || 100;
    const newHealth = Math.max(0, currentHealth - totalDecrement);
    
    // Update user
    db.users[userIndex] = {
      ...user,
      petHealth: newHealth,
      lastHealthDecrementDate: todayStr,
      updatedAt: now.toISOString()
    };
    
    healthUpdates.push({
      username: username,
      previousHealth: currentHealth,
      newHealth: newHealth,
      decrementAmount: totalDecrement,
      incompleteChores: userChores.length
    });
  });
  
  saveDB(db);
  return healthUpdates;
}

function calculateChoreWeight(difficulty, frequency) {
  // Weight = difficulty (1-5) × frequency (1-7)
  // Range: 1 (easy, once/week) to 35 (hardest, daily)
  return (difficulty || 3) * (frequency || 1);
}

function findBestAssigneeByCapacity(users, choreWeight) {
  // Find user with highest available capacity (capacityScore - current load)
  let bestUser = null;
  let highestAvailableCapacity = -1;
  
  for (const user of users) {
    const availableCapacity = user.capacityScore;
    if (availableCapacity >= choreWeight && availableCapacity > highestAvailableCapacity) {
      highestAvailableCapacity = availableCapacity;
      bestUser = user;
    }
  }
  
  // If no user has enough capacity, assign to user with most capacity anyway
  if (!bestUser) {
    bestUser = users.reduce((prev, current) => 
      (current.capacityScore > prev.capacityScore) ? current : prev
    );
  }
  
  return bestUser;
}

// GET /api/chores - Get all chores
router.get('/', (req, res) => {
  try {
    const { completed } = req.query;
    
    // Process health decrements for incomplete chores
    processHealthDecrements();
    
    const db = loadDB();
    let chores = db.chores;
    
    if (completed !== undefined) {
      chores = chores.filter(c => c.completed === (completed === 'true'));
    }
    
    // Add daysLeft to each chore
    chores = chores.map(addDaysLeftToChore);
    
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
    res.json(addDaysLeftToChore(chore));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/chores - Create new chore
router.post('/', (req, res) => {
  try {
    const { name, frequency, progress, difficulty } = req.body;
    const db = loadDB();
    
    // Calculate chore weight
    const choreWeight = calculateChoreWeight(difficulty, frequency);
    
    // Auto-assign to best available user
    const assignedUser = findBestAssigneeByCapacity(db.users, choreWeight);
    if (!assignedUser) {
      return res.status(400).json({ error: 'No users available for assignment' });
    }
    
    const now = new Date();
    const deadline = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days from now
    
    const chore = {
      id: generateId(),
      name,
      frequency,
      roommate: assignedUser.username,
      progress: progress || 0,
      completed: false,
      difficulty: difficulty || 3,
      weight: choreWeight,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      completedAt: null,
      deadline: deadline.toISOString()
    };
    
    // Update assignee's capacity score
    const userIndex = db.users.findIndex(u => u.username === assignedUser.username);
    if (userIndex !== -1) {
      db.users[userIndex].capacityScore = Math.max(0, db.users[userIndex].capacityScore - choreWeight);
      db.users[userIndex].updatedAt = now.toISOString();
    }
    
    db.chores.push(chore);
    saveDB(db);
    
    res.status(201).json(addDaysLeftToChore(chore));
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
    res.json(addDaysLeftToChore(db.chores[choreIndex]));
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
    res.json(addDaysLeftToChore(db.chores[choreIndex]));
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
    
    const chore = db.chores[choreIndex];
    
    // Restore capacity if chore was not completed yet
    if (!chore.completed) {
      const choreWeight = chore.weight || calculateChoreWeight(chore.difficulty, chore.frequency);
      const userIndex = db.users.findIndex(u => u.username === chore.roommate);
      if (userIndex !== -1) {
        db.users[userIndex].capacityScore += choreWeight;
        db.users[userIndex].updatedAt = new Date().toISOString();
      }
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
    

    let petHealthUpdated = false; 
    // Check if chore is now complete
    if (chore.progress >= chore.frequency) {
      chore.completed = true;
      chore.completedAt = new Date().toISOString();
      petHealthUpdated = true;
      
      // Restore capacity when chore is completed
      const choreWeight = chore.weight || calculateChoreWeight(chore.difficulty, chore.frequency);
      const userIndex = db.users.findIndex(u => u.username === chore.roommate);
      if (userIndex !== -1) {
        // Reward the pet owner with health increase
        db.users[userIndex].petHealth = Math.min(db.users[userIndex].petHealth + 10, 100);
        // Restore capacity score
        db.users[userIndex].capacityScore += choreWeight;
        db.users[userIndex].updatedAt = new Date().toISOString();
      }
      
      // Auto-reassign chore to a different user
      const currentAssignee = chore.roommate;
      const availableUsers = db.users.filter(user => user.username !== currentAssignee);
      
      if (availableUsers.length > 0) {
        const newAssignee = findBestAssigneeByCapacity(availableUsers, choreWeight);
        
        if (newAssignee) {
          // Reset chore for new assignment
          chore.progress = 0;
          chore.completed = false;
          chore.completedAt = null;
          chore.roommate = newAssignee.username;
          
          // Set new deadline (7 days from now)
          const now = new Date();
          chore.deadline = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString();
          
          // Deduct capacity from new assignee
          const newUserIndex = db.users.findIndex(u => u.username === newAssignee.username);
          if (newUserIndex !== -1) {
            db.users[newUserIndex].capacityScore = Math.max(0, db.users[newUserIndex].capacityScore - choreWeight);
            db.users[newUserIndex].updatedAt = new Date().toISOString();
          }
        }
      }
    }
    
    chore.updatedAt = new Date().toISOString();
    db.chores[choreIndex] = chore;
    
    saveDB(db);
    res.json({
      chore: addDaysLeftToChore(chore),
      petHealthUpdated: petHealthUpdated
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
    
    // Add daysLeft to each chore
    chores = chores.map(addDaysLeftToChore);
    
    res.json(chores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




// POST /api/chores/demo/advance-time - Advance demo time by 2 days
router.post('/demo/advance-time', (req, res) => {
  try {
    const twoDaysInMs = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds
    demoTimeOffset += twoDaysInMs;
    
    // Process health decrements for incomplete chores after time advancement
    const healthUpdates = processHealthDecrements();
    
    const db = loadDB();
    // Update all chore daysLeft with new time
    const updatedChores = db.chores.map(chore => addDaysLeftToChore(chore));
    
    res.json({ 
      message: 'Time advanced by 2 days',
      currentDemoOffset: Math.floor(demoTimeOffset / (24 * 60 * 60 * 1000)), // days
      chores: updatedChores,
      healthUpdates: healthUpdates
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/chores/demo/reset-time - Reset demo time to normal
router.post('/demo/reset-time', (req, res) => {
  try {
    demoTimeOffset = 0;
    
    const db = loadDB();
    // Update all chore daysLeft with reset time
    const updatedChores = db.chores.map(chore => addDaysLeftToChore(chore));
    
    res.json({ 
      message: 'Demo time reset to normal',
      currentDemoOffset: 0,
      chores: updatedChores
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/chores/demo/status - Get current demo time status
router.get('/demo/status', (req, res) => {
  try {
    const demoOffsetDays = Math.floor(demoTimeOffset / (24 * 60 * 60 * 1000));
    const currentDemoTime = getDemoTime();
    
    res.json({
      demoOffsetDays,
      currentDemoTime: currentDemoTime.toISOString(),
      actualTime: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



export default router;