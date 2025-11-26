// backend/routes/boards.js

const express = require('express');
const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get all boards for user
router.get('/', auth, async (req, res) => {
  try {
    const boards = await Board.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new board
router.post('/', [
  auth,
  body('title').notEmpty().withMessage('Title is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const board = new Board({
      title: req.body.title,
      description: req.body.description,
      userId: req.user._id
    });

    await board.save();

    // Create default columns
    const defaultColumns = ['To Do', 'In Progress', 'Done'];
    for (let i = 0; i < defaultColumns.length; i++) {
      const column = new Column({
        title: defaultColumns[i],
        boardId: board._id,
        order: i
      });
      await column.save();
    }

    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single board with columns and tasks - FIXED VERSION
router.get('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, userId: req.user._id });
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Get columns for this board
    const columns = await Column.find({ boardId: board._id }).sort({ order: 1 });
    
    // Get tasks for each column and combine
    const columnsWithTasks = await Promise.all(
      columns.map(async (column) => {
        const tasks = await Task.find({ columnId: column._id }).sort({ order: 1 });
        return {
          ...column.toObject(),
          tasks
        };
      })
    );

    res.json({ 
      board, 
      columns: columnsWithTasks 
    });
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update board
router.put('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true }
    );

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    res.json(board);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete board
router.delete('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Get all columns for this board
    const columns = await Column.find({ boardId: board._id });
    const columnIds = columns.map(col => col._id);

    // Delete all tasks in these columns
    await Task.deleteMany({ columnId: { $in: columnIds } });
    
    // Delete all columns
    await Column.deleteMany({ boardId: board._id });
    
    // Finally delete the board
    await Board.findByIdAndDelete(board._id);

    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;