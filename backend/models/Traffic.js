const mongoose = require('mongoose');

const trafficSchema = new mongoose.Schema({
  district: { type: String, required: true },
  congestionLevel: { type: Number, min: 0, max: 100 }, // 0-100%
  avgSpeed: { type: Number }, // km/h
  vehicleCount: { type: Number },
  incidents: { type: Number, default: 0 },
  status: { type: String, enum: ['clear', 'moderate', 'heavy', 'blocked'], default: 'clear' },
  roadSegments: [{
    name: String,
    from: String,
    to: String,
    congestion: Number,
    status: String
  }],
  timestamp: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Traffic', trafficSchema);
