// backend/routes/tasks.js

const express = require('express');
const Task = require('../models/Task');
const Column = require('../models/Column');
const Board = require('../models/Board');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Create task
router.post('/', [
  auth,
  body('title').notEmpty().withMessage('Title is required'),
  body('columnId').notEmpty().withMessage('Column ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify user owns the column's board
    const column = await Column.findById(req.body.columnId);
    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }

    const board = await Board.findOne({ _id: column.boardId, userId: req.user._id });
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const task = new Task({
      title: req.body.title,
      description: req.body.description,
      columnId: req.body.columnId,
      order: req.body.order || 0
    });

    await task.save();
    
    // Populate the task with column info for frontend
    const populatedTask = await Task.findById(task._id).populate('columnId', 'title');
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const column = await Column.findById(task.columnId);
    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }

    const board = await Board.findOne({ _id: column.boardId, userId: req.user._id });
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    Object.assign(task, req.body);
    await task.save();
    
    const updatedTask = await Task.findById(task._id).populate('columnId', 'title');
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Move task to different column - FIXED VERSION
router.put('/:id/move', [
  auth,
  body('newColumnId').notEmpty().withMessage('New column ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify current column's board belongs to user
    const currentColumn = await Column.findById(task.columnId);
    if (!currentColumn) {
      return res.status(404).json({ message: 'Current column not found' });
    }

    const currentBoard = await Board.findOne({ _id: currentColumn.boardId, userId: req.user._id });
    if (!currentBoard) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Verify new column belongs to same board
    const newColumn = await Column.findOne({
      _id: req.body.newColumnId,
      boardId: currentColumn.boardId
    });

    if (!newColumn) {
      return res.status(400).json({ message: 'Invalid column or column not in same board' });
    }

    // Update task with new column
    task.columnId = req.body.newColumnId;
    task.order = req.body.order || 0;
    await task.save();

    // Return populated task
    const movedTask = await Task.findById(task._id).populate('columnId', 'title');
    res.json(movedTask);
  } catch (error) {
    console.error('Error moving task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const column = await Column.findById(task.columnId);
    const board = await Board.findOne({ _id: column.boardId, userId: req.user._id });
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;