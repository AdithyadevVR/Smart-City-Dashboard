const mongoose = require('mongoose');

const energySchema = new mongoose.Schema({
  district: { type: String, required: true },
  currentLoad: { type: Number }, // MW
  maxCapacity: { type: Number }, // MW
  renewablePercent: { type: Number }, // %
  solarOutput: { type: Number }, // MW
  windOutput: { type: Number }, // MW
  gridImport: { type: Number }, // MW
  consumption: { type: Number }, // MWh today
  status: { type: String, enum: ['normal', 'high', 'critical', 'outage'], default: 'normal' },
  hourlyData: [{
    hour: Number,
    load: Number,
    renewable: Number
  }],
  timestamp: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Energy', energySchema);
