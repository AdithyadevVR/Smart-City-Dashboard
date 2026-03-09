const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
  district: { type: String, required: true },
  temperature: { type: Number }, // Celsius
  feelsLike: { type: Number },
  humidity: { type: Number }, // %
  windSpeed: { type: Number }, // km/h
  windDirection: { type: String },
  aqi: { type: Number }, // Air Quality Index
  uvIndex: { type: Number },
  visibility: { type: Number }, // km
  condition: { type: String, enum: ['sunny', 'cloudy', 'rainy', 'stormy', 'foggy', 'partly-cloudy'], default: 'sunny' },
  forecast: [{
    day: String,
    high: Number,
    low: Number,
    condition: String,
    precipitation: Number
  }],
  timestamp: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Weather', weatherSchema);
