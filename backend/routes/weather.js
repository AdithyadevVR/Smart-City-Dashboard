const express = require('express');
const router = express.Router();
const Weather = require('../models/Weather');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const data = await Weather.find().sort({ district: 1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const updated = await Weather.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id, timestamp: new Date() },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
