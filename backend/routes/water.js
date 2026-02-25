const express = require('express');
const router = express.Router();
const Water = require('../models/Water');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const data = await Water.find().sort({ district: 1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const updated = await Water.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id, timestamp: new Date() },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/toggle-valve', auth, adminOnly, async (req, res) => {
  try {
    const water = await Water.findById(req.params.id);
    if (!water) return res.status(404).json({ message: 'Not found' });
    water.valveOpen = !water.valveOpen;
    water.updatedBy = req.user._id;
    await water.save();
    res.json(water);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
