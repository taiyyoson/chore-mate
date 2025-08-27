import mongoose from 'mongoose';

const choreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100
  },
  frequency: {
    type: Number,
    required: true,
    min: 1,
    max: 50
  },
  progress: {
    type: Number,
    default: 0,
    min: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  roommate: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  }
});

// Update the updatedAt field before saving
choreSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set completedAt when chore is marked as completed
  if (this.completed && !this.completedAt) {
    this.completedAt = Date.now();
  }
  
  next();
});

// Virtual to check if chore is ready for completion
choreSchema.virtual('isReadyForCompletion').get(function() {
  return this.progress >= this.frequency;
});

export default mongoose.model('Chore', choreSchema);