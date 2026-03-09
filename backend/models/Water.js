const mongoose = require('mongoose');

const waterSchema = new mongoose.Schema({
  district: { type: String, required: true },
  reservoirLevel: { type: Number, min: 0, max: 100 }, // %
  pressure: { type: Number }, // bar
  dailyConsumption: { type: Number }, // million liters
  leaks: { type: Number, default: 0 },
  waterQuality: { type: Number, min: 0, max: 100 }, // quality score
  status: { type: String, enum: ['normal', 'low', 'critical', 'flood-risk'], default: 'normal' },
  valveOpen: { type: Boolean, default: true },
  consumptionTrend: [{
    hour: Number,
    consumption: Number
  }],
  timestamp: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Water', waterSchema);
