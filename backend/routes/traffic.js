const express = require('express');
const router = express.Router();
const Traffic = require('../models/Traffic');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const data = await Traffic.find().sort({ district: 1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const updated = await Traffic.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id, timestamp: new Date() },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/clear-incident', auth, adminOnly, async (req, res) => {
  try {
    const traffic = await Traffic.findById(req.params.id);
    if (!traffic) return res.status(404).json({ message: 'Not found' });
    traffic.incidents = 0;
    traffic.status = 'clear';
    traffic.updatedBy = req.user._id;
    await traffic.save();
    res.json(traffic);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
