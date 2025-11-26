// backend/models/Column.js

const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual for tasks
columnSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'columnId'
});

// Ensure virtual fields are serialized
columnSchema.set('toJSON', { virtuals: true });
columnSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Column', columnSchema);