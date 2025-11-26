// backend/routes/columns.js

const express = require('express');
const Column = require('../models/Column');
const Task = require('../models/Task');
const Board = require('../models/Board');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Create column
router.post('/', [
  auth,
  body('title').notEmpty().withMessage('Title is required'),
  body('boardId').notEmpty().withMessage('Board ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify user owns the board
    const board = await Board.findOne({ _id: req.body.boardId, userId: req.user._id });
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const column = new Column({
      title: req.body.title,
      boardId: req.body.boardId,
      order: req.body.order || 0
    });

    await column.save();
    res.status(201).json(column);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update column
router.put('/:id', auth, async (req, res) => {
  try {
    const column = await Column.findById(req.params.id);
    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }

    // Verify user owns the board
    const board = await Board.findOne({ _id: column.boardId, userId: req.user._id });
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    Object.assign(column, req.body);
    await column.save();
    res.json(column);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete column
router.delete('/:id', auth, async (req, res) => {
  try {
    const column = await Column.findById(req.params.id);
    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }

    // Verify user owns the board
    const board = await Board.findOne({ _id: column.boardId, userId: req.user._id });
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Delete associated tasks
    await Task.deleteMany({ columnId: column._id });
    await Column.findByIdAndDelete(req.params.id);

    res.json({ message: 'Column deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;