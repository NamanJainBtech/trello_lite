// backend/routes/users.js

const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

router.put('/theme', [
  auth,
  body('theme').isIn(['light', 'dark', 'system']).withMessage('Theme must be light, dark, or system')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { themePreference: req.body.theme },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Theme preference updated',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        themePreference: user.themePreference
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;