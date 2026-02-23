-- =========================================================
-- NEXUS CITY — PostgreSQL Schema
-- Run once:
-- psql -U postgres -d nexus_city -f backend/db/schema.sql
-- =========================================================

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'resident',
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW()
);

-- TRAFFIC SENSORS
CREATE TABLE IF NOT EXISTS traffic_sensors (
  id SERIAL PRIMARY KEY,
  sensor_code VARCHAR(20) UNIQUE NOT NULL,
  location VARCHAR(200) NOT NULL,
  sector VARCHAR(10) NOT NULL,
  congestion INTEGER NOT NULL DEFAULT 0 CHECK (congestion BETWEEN 0 AND 100),
  avg_speed INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'low',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- WASTE FACILITIES
CREATE TABLE IF NOT EXISTS waste_facilities (
  id SERIAL PRIMARY KEY,
  facility_code VARCHAR(20) UNIQUE NOT NULL,
  zone VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 0 CHECK (capacity BETWEEN 0 AND 100),
  last_pickup TIMESTAMP DEFAULT NOW(),
  next_pickup TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'good',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ENERGY SOURCES
CREATE TABLE IF NOT EXISTS energy_sources (
  id SERIAL PRIMARY KEY,
  source_code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL,
  output_mw DECIMAL(8,2) NOT NULL DEFAULT 0,
  capacity_pct INTEGER NOT NULL DEFAULT 0 CHECK (capacity_pct BETWEEN 0 AND 100),
  cost_per_mwh DECIMAL(8,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'online',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- INCIDENTS
CREATE TABLE IF NOT EXISTS incidents (
  id SERIAL PRIMARY KEY,
  module VARCHAR(20) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  priority VARCHAR(10) NOT NULL DEFAULT 'medium',
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ACTIVITY LOG
CREATE TABLE IF NOT EXISTS activity_log (
  id SERIAL PRIMARY KEY,
  module VARCHAR(20) NOT NULL,
  icon VARCHAR(10),
  message TEXT NOT NULL,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ANALYTICS SNAPSHOTS
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id SERIAL PRIMARY KEY,
  snapshot_time TIMESTAMP DEFAULT NOW(),
  avg_congestion DECIMAL(5,2),
  avg_speed DECIMAL(5,2),
  total_waste_pct DECIMAL(5,2),
  total_energy_mw DECIMAL(8,2),
  city_score INTEGER
);

-- =========================================================
-- SEED DATA
-- =========================================================

-- ADMIN USER (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Administrator','admin@nexus.city',
'$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/DP1TkMF4Fp4wjmVdK','admin')
ON CONFLICT (email) DO NOTHING;

-- RESIDENT USER (password: user123)
INSERT INTO users (name, email, password, role) VALUES
('Jane Resident','user@nexus.city',
'$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','resident')
ON CONFLICT (email) DO NOTHING;

-- TRAFFIC DATA
INSERT INTO traffic_sensors
(sensor_code,location,sector,congestion,avg_speed,status) VALUES
('T-001','Meridian Ave & 5th St','B2',88,18,'high'),
('T-002','Commerce Blvd North','A3',55,34,'medium'),
('T-003','North Ring Road','C1',30,62,'low'),
('T-004','Eastgate Expressway','D4',62,28,'medium'),
('T-005','Southbridge Connector','D1',41,48,'low'),
('T-006','Central Plaza Junction','B3',79,22,'high')
ON CONFLICT (sensor_code) DO NOTHING;

-- WASTE DATA
INSERT INTO waste_facilities
(facility_code,zone,name,capacity,last_pickup,next_pickup,status) VALUES
('W-001','Zone 1 - North','North Main Depot',61,NOW()-INTERVAL '4 hours',NOW()+INTERVAL '2 hours','moderate'),
('W-002','Zone 2 - East','East Recycling Hub',72,NOW()-INTERVAL '6 hours',NOW()+INTERVAL '1 hour','moderate'),
('W-003','Zone 3 - South','South Transfer Station',91,NOW()-INTERVAL '28 hours',NOW(),'critical'),
('W-004','Zone 4 - West','West Depot',38,NOW()-INTERVAL '2 hours',NOW()+INTERVAL '6 hours','good')
ON CONFLICT (facility_code) DO NOTHING;

-- ENERGY DATA
INSERT INTO energy_sources
(source_code,name,type,output_mw,capacity_pct,cost_per_mwh,status) VALUES
('E-001','SolarGrid North','solar',13.3,74,42.00,'online'),
('E-002','WindFarm East','wind',10.6,81,38.00,'online'),
('E-003','GasTurbine Plant','gas',8.4,60,95.00,'partial'),
('E-004','National Grid Feed','grid',5.7,38,120.00,'online')
ON CONFLICT (source_code) DO NOTHING;

-- INCIDENTS
INSERT INTO incidents (module,title,description,priority) VALUES
('waste','Emergency Dispatch - Zone 3',
 'Zone 3 at 91%. Deploy extra truck from depot 2. ETA: 22 min.','high'),
('traffic','Signal Optimization - Sector B2',
 'Retiming Meridian Ave signals - AI projects 15% congestion drop.','medium'),
('energy','Demand Response 18:00-21:00',
 'Notify 340 enrolled buildings. Expected savings: 4.2 MW.','low');

-- ACTIVITY LOG
INSERT INTO activity_log (module,icon,message) VALUES
('traffic','CAR','Rerouting activated on Meridian Ave - 1,240 vehicles redirected'),
('energy','ENERGY','Solar output +13.3 MW following cloud clearance'),
('waste','WASTE','Zone 3 south reached 91% - operations alerted'),
('traffic','SIGNAL','Adaptive signals updated across 12 intersections'),
('energy','BATTERY','Battery bank 3 charged to 92% - peak demand ready');