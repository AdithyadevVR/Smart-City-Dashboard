const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Traffic = require('./models/Traffic');
const Weather = require('./models/Weather');
const Energy = require('./models/Energy');
const Waste = require('./models/Waste');
const Water = require('./models/Water');
const Alert = require('./models/Alert');

const districts = ['Downtown', 'North District', 'South District', 'East District', 'West District', 'Harbor Zone'];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear all
  await Promise.all([
    User.deleteMany({}), Traffic.deleteMany({}), Weather.deleteMany({}),
    Energy.deleteMany({}), Waste.deleteMany({}), Water.deleteMany({}), Alert.deleteMany({})
  ]);

  // Users
  await User.create([
    { name: 'Admin User', email: 'admin@smartcity.com', password: 'admin123', role: 'admin', department: 'City Management' },
    { name: 'John Observer', email: 'user@smartcity.com', password: 'user123', role: 'user', department: 'Public Services' },
    { name: 'Sarah Chen', email: 'sarah@smartcity.com', password: 'user123', role: 'user', department: 'Traffic Control' },
    { name: 'Mike Johnson', email: 'mike@smartcity.com', password: 'user123', role: 'user', department: 'Energy' }
  ]);

  // Traffic
  const trafficStatuses = ['clear', 'moderate', 'heavy', 'blocked'];
  for (const district of districts) {
    const congestion = Math.floor(Math.random() * 90) + 5;
    await Traffic.create({
      district,
      congestionLevel: congestion,
      avgSpeed: Math.max(10, 80 - congestion * 0.7),
      vehicleCount: Math.floor(Math.random() * 3000) + 500,
      incidents: Math.floor(Math.random() * 5),
      status: congestion < 30 ? 'clear' : congestion < 60 ? 'moderate' : congestion < 80 ? 'heavy' : 'blocked',
      roadSegments: [
        { name: 'Main St', from: 'A', to: 'B', congestion: congestion - 10, status: 'moderate' },
        { name: 'Central Ave', from: 'B', to: 'C', congestion: congestion + 5, status: 'heavy' },
        { name: 'Ring Road', from: 'C', to: 'D', congestion: congestion - 20, status: 'clear' }
      ]
    });
  }

  // Weather
  const conditions = ['sunny', 'cloudy', 'rainy', 'partly-cloudy'];
  const forecastDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  for (const district of districts) {
    const temp = Math.floor(Math.random() * 20) + 15;
    await Weather.create({
      district,
      temperature: temp,
      feelsLike: temp - 2,
      humidity: Math.floor(Math.random() * 40) + 40,
      windSpeed: Math.floor(Math.random() * 30) + 5,
      windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
      aqi: Math.floor(Math.random() * 80) + 20,
      uvIndex: Math.floor(Math.random() * 8) + 1,
      visibility: Math.floor(Math.random() * 10) + 5,
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      forecast: forecastDays.map(day => ({
        day,
        high: temp + Math.floor(Math.random() * 5),
        low: temp - Math.floor(Math.random() * 8),
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        precipitation: Math.floor(Math.random() * 80)
      }))
    });
  }

  // Energy
  for (const district of districts) {
    const load = Math.floor(Math.random() * 400) + 100;
    const capacity = 600;
    await Energy.create({
      district,
      currentLoad: load,
      maxCapacity: capacity,
      renewablePercent: Math.floor(Math.random() * 50) + 20,
      solarOutput: Math.floor(Math.random() * 100) + 20,
      windOutput: Math.floor(Math.random() * 80) + 10,
      gridImport: Math.floor(Math.random() * 150) + 50,
      consumption: Math.floor(Math.random() * 2000) + 500,
      status: load / capacity > 0.9 ? 'critical' : load / capacity > 0.75 ? 'high' : 'normal',
      hourlyData: Array.from({ length: 24 }, (_, h) => ({
        hour: h,
        load: Math.floor(Math.random() * 200) + 100,
        renewable: Math.floor(Math.random() * 80) + 20
      }))
    });
  }

  // Waste
  for (const district of districts) {
    const fill = Math.floor(Math.random() * 90) + 5;
    const total = Math.floor(Math.random() * 50) + 20;
    await Waste.create({
      district,
      binFillLevel: fill,
      totalBins: total,
      binsNeedingCollection: Math.floor(total * fill / 100),
      recyclingPercent: Math.floor(Math.random() * 40) + 20,
      collectionStatus: fill > 80 ? 'overdue' : fill > 60 ? 'scheduled' : 'completed',
      nextCollection: new Date(Date.now() + Math.random() * 86400000 * 3),
      weeklyData: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
        day,
        collected: Math.floor(Math.random() * 500) + 100,
        recycled: Math.floor(Math.random() * 200) + 50
      }))
    });
  }

  // Water
  for (const district of districts) {
    const level = Math.floor(Math.random() * 70) + 20;
    await Water.create({
      district,
      reservoirLevel: level,
      pressure: (Math.random() * 3 + 1).toFixed(1),
      dailyConsumption: (Math.random() * 5 + 1).toFixed(2),
      leaks: Math.floor(Math.random() * 4),
      waterQuality: Math.floor(Math.random() * 20) + 75,
      status: level < 20 ? 'critical' : level < 40 ? 'low' : 'normal',
      valveOpen: true,
      consumptionTrend: Array.from({ length: 24 }, (_, h) => ({
        hour: h,
        consumption: Math.floor(Math.random() * 300) + 100
      }))
    });
  }

  // Alerts
  await Alert.create([
    { type: 'traffic', module: 'Traffic', message: 'Heavy congestion detected on Main Street corridor', severity: 'warning', district: 'Downtown' },
    { type: 'water', module: 'Water', message: 'Pipe leak detected in North District sector 4B', severity: 'critical', district: 'North District' },
    { type: 'energy', module: 'Energy', message: 'Peak load threshold approaching in South District', severity: 'warning', district: 'South District' },
    { type: 'weather', module: 'Weather', message: 'Storm advisory: High winds expected after 18:00', severity: 'info', district: 'Harbor Zone' },
    { type: 'waste', module: 'Waste', message: 'Collection overdue in East District Zone 3', severity: 'warning', district: 'East District' },
    { type: 'traffic', module: 'Traffic', message: 'Accident reported at Harbor Bridge — expect delays', severity: 'critical', district: 'Harbor Zone' }
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('\n👤 Login credentials:');
  console.log('   Admin: admin@smartcity.com / admin123');
  console.log('   User:  user@smartcity.com  / user123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
