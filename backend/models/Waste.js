const mongoose = require('mongoose');

const wasteSchema = new mongoose.Schema({
  district: { type: String, required: true },
  binFillLevel: { type: Number, min: 0, max: 100 }, // %
  totalBins: { type: Number },
  binsNeedingCollection: { type: Number },
  recyclingPercent: { type: Number },
  collectionStatus: { type: String, enum: ['scheduled', 'in-progress', 'completed', 'overdue'], default: 'scheduled' },
  nextCollection: { type: Date },
  wasteType: { type: String, enum: ['general', 'recyclable', 'organic', 'hazardous'], default: 'general' },
  weeklyData: [{
    day: String,
    collected: Number,
    recycled: Number
  }],
  timestamp: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Waste', wasteSchema);
