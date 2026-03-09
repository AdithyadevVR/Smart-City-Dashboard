const express = require('express');
const router = express.Router();
const Waste = require('../models/Waste');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const data = await Waste.find().sort({ district: 1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const updated = await Waste.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id, timestamp: new Date() },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/collect', auth, adminOnly, async (req, res) => {
  try {
    const waste = await Waste.findById(req.params.id);
    if (!waste) return res.status(404).json({ message: 'Not found' });
    waste.binFillLevel = 0;
    waste.collectionStatus = 'completed';
    waste.binsNeedingCollection = 0;
    waste.updatedBy = req.user._id;
    await waste.save();
    res.json(waste);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
