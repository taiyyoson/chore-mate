import express from 'express';
import Chore from '../models/Chore.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/chores - Get all chores
router.get('/', async (req, res) => {
  try {
    const { completed } = req.query;
    let filter = {};
    
    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }
    
    const chores = await Chore.find(filter).sort({ createdAt: -1 });
    res.json(chores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/chores/:id - Get chore by ID
router.get('/:id', async (req, res) => {
  try {
    const chore = await Chore.findById(req.params.id);
    if (!chore) {
      return res.status(404).json({ error: 'Chore not found' });
    }
    res.json(chore);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/chores - Create new chore
router.post('/', async (req, res) => {
  try {
    const { name, frequency, roommate, progress } = req.body;
    
    // Verify the roommate exists
    const user = await User.findOne({ username: roommate });
    if (!user) {
      return res.status(400).json({ error: 'Roommate not found' });
    }
    
    const chore = new Chore({
      name,
      frequency,
      roommate,
      progress: progress || 0
    });
    
    const savedChore = await chore.save();
    res.status(201).json(savedChore);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/chores/:id - Update chore
router.put('/:id', async (req, res) => {
  try {
    const { name, frequency, roommate, progress, completed } = req.body;
    
    const chore = await Chore.findByIdAndUpdate(
      req.params.id,
      { name, frequency, roommate, progress, completed },
      { new: true, runValidators: true }
    );
    
    if (!chore) {
      return res.status(404).json({ error: 'Chore not found' });
    }
    
    res.json(chore);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/chores/:id/complete - Complete a chore (increment progress)
router.patch('/:id/complete', async (req, res) => {
  try {
    const chore = await Chore.findById(req.params.id);
    if (!chore) {
      return res.status(404).json({ error: 'Chore not found' });
    }
    
    if (chore.completed) {
      return res.status(400).json({ error: 'Chore already completed' });
    }
    
    // Increment progress
    chore.progress += 1;
    
    // Check if chore is now complete
    if (chore.progress >= chore.frequency) {
      chore.completed = true;
      chore.completedAt = new Date();
      
      // Reward the pet owner with health increase
      const user = await User.findOne({ username: chore.roommate });
      if (user) {
        user.petHealth = Math.min(user.petHealth + 10, 100);
        await user.save();
      }
    }
    
    const savedChore = await chore.save();
    res.json({
      chore: savedChore,
      petHealthUpdated: chore.completed
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/chores/:id/reset - Reset chore progress
router.patch('/:id/reset', async (req, res) => {
  try {
    const chore = await Chore.findByIdAndUpdate(
      req.params.id,
      { 
        progress: 0, 
        completed: false,
        completedAt: null 
      },
      { new: true }
    );
    
    if (!chore) {
      return res.status(404).json({ error: 'Chore not found' });
    }
    
    res.json(chore);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/chores/:id - Delete chore
router.delete('/:id', async (req, res) => {
  try {
    const chore = await Chore.findByIdAndDelete(req.params.id);
    if (!chore) {
      return res.status(404).json({ error: 'Chore not found' });
    }
    res.json({ message: 'Chore deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/chores/user/:username - Get chores for specific user
router.get('/user/:username', async (req, res) => {
  try {
    const { completed } = req.query;
    let filter = { roommate: req.params.username };
    
    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }
    
    const chores = await Chore.find(filter).sort({ createdAt: -1 });
    res.json(chores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;