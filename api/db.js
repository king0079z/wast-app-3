// Database configuration for Vercel deployment
const { Pool } = require('pg');

// Initialize database connection
let pool;

function getPool() {
  if (!pool) {
    // Use Vercel Postgres connection string or fallback to in-memory storage
    if (process.env.POSTGRES_URL) {
      pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: {
          rejectUnauthorized: false
        }
      });
    } else {
      // Fallback to in-memory storage for development
      console.log('⚠️ No database URL found, using in-memory storage');
      return null;
    }
  }
  return pool;
}

// In-memory storage as fallback
const inMemoryData = {
  bins: [
    { id: 'BIN-001', location: 'Downtown Plaza', fill: 75, status: 'normal', type: 'general', lastCollection: '2025-08-25', temperature: 22, battery: 85 },
    { id: 'BIN-002', location: 'Shopping Mall', fill: 45, status: 'normal', type: 'recycling', lastCollection: '2025-08-26', temperature: 20, battery: 92 },
    { id: 'BIN-003', location: 'Business District', fill: 85, status: 'warning', type: 'general', lastCollection: '2025-08-24', temperature: 23, battery: 78 },
    { id: 'BIN-004', location: 'Residential Area A', fill: 30, status: 'normal', type: 'organic', lastCollection: '2025-08-27', temperature: 21, battery: 88 },
    { id: 'BIN-005', location: 'Park Central', fill: 60, status: 'normal', type: 'recycling', lastCollection: '2025-08-25', temperature: 19, battery: 95 }
  ],
  users: [
    { id: 'ADM-001', name: 'Admin User', type: 'admin', email: 'admin@autonautics.com', status: 'active', lastLogin: new Date().toISOString() },
    { id: 'MNG-001', name: 'Operations Manager', type: 'manager', email: 'manager@autonautics.com', status: 'active', lastLogin: new Date().toISOString() },
    { id: 'USR-001', name: 'Ahmed Al-Rashid', type: 'driver', email: 'ahmed@autonautics.com', status: 'active', lastLogin: new Date().toISOString() },
    { id: 'USR-002', name: 'Mohammed Hassan', type: 'driver', email: 'mohammed@autonautics.com', status: 'active', lastLogin: new Date().toISOString() },
    { id: 'USR-003', name: 'Khalid Al-Mansoori', type: 'driver', email: 'khalid@autonautics.com', status: 'active', lastLogin: new Date().toISOString() }
  ],
  collections: [
    { id: 'COL-001', binId: 'BIN-001', driverId: 'USR-001', timestamp: new Date().toISOString(), weight: 45, status: 'completed' },
    { id: 'COL-002', binId: 'BIN-002', driverId: 'USR-002', timestamp: new Date().toISOString(), weight: 32, status: 'completed' },
    { id: 'COL-003', binId: 'BIN-003', driverId: 'USR-003', timestamp: new Date().toISOString(), weight: 58, status: 'completed' }
  ],
  issues: [
    { id: 'ISS-001', type: 'maintenance', description: 'Bin sensor malfunction', priority: 'high', status: 'open', reportedBy: 'System', date: new Date().toISOString() },
    { id: 'ISS-002', type: 'collection', description: 'Route optimization needed', priority: 'medium', status: 'resolved', reportedBy: 'USR-001', date: new Date().toISOString() }
  ],
  vehicles: [
    { id: 'VEH-001', type: 'Truck', licensePlate: 'WM-001-QA', capacity: '10 tons', status: 'active', driverId: 'USR-001', fuelLevel: 75 },
    { id: 'VEH-002', type: 'Truck', licensePlate: 'WM-002-QA', capacity: '10 tons', status: 'active', driverId: 'USR-002', fuelLevel: 82 },
    { id: 'VEH-003', type: 'Truck', licensePlate: 'WM-003-QA', capacity: '10 tons', status: 'active', driverId: 'USR-003', fuelLevel: 68 }
  ],
  routes: [
    { id: 'ROUTE-001', name: 'Downtown Circuit', driverId: 'USR-001', bins: ['BIN-001', 'BIN-003'], status: 'active', estimatedTime: '2h 30m' },
    { id: 'ROUTE-002', name: 'Mall & Residential', driverId: 'USR-002', bins: ['BIN-002', 'BIN-004'], status: 'active', estimatedTime: '1h 45m' },
    { id: 'ROUTE-003', name: 'Park Route', driverId: 'USR-003', bins: ['BIN-005'], status: 'completed', estimatedTime: '45m' }
  ],
  alerts: [
    { id: 'ALT-001', type: 'system', message: 'High bin fill level detected', severity: 'warning', timestamp: new Date().toISOString(), source: 'BIN-003', status: 'active' },
    { id: 'ALT-002', type: 'maintenance', message: 'Vehicle fuel low', severity: 'medium', timestamp: new Date().toISOString(), source: 'VEH-003', status: 'active' }
  ],
  complaints: [
    { id: 'CMP-001', type: 'service', description: 'Missed collection', priority: 'high', status: 'resolved', reportedBy: 'Citizen', date: new Date().toISOString() }
  ],
  analytics: {
    totalCollections: 156,
    totalPaperCollected: 2450,
    avgResponseTime: 24.5,
    citizenSatisfaction: 92.3,
    systemEfficiency: 89.2
  },
  systemLogs: [
    { timestamp: new Date().toISOString(), level: 'info', component: 'WebSocket', message: 'Connection established', user: 'System', ip: '127.0.0.1' },
    { timestamp: new Date().toISOString(), level: 'info', component: 'API', message: 'Data sync completed', user: 'System', ip: '127.0.0.1' }
  ]
};

// Database operations
async function query(text, params) {
  const db = getPool();
  if (!db) {
    // Use in-memory storage
    return { rows: [] };
  }
  
  try {
    const result = await db.query(text, params);
    return result;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
}

// Initialize database tables
async function initializeDatabase() {
  const db = getPool();
  if (!db) return;

  try {
    // Create tables if they don't exist
    await query(`
      CREATE TABLE IF NOT EXISTS bins (
        id VARCHAR(50) PRIMARY KEY,
        location VARCHAR(255),
        fill INTEGER,
        status VARCHAR(50),
        type VARCHAR(50),
        last_collection DATE,
        temperature INTEGER,
        battery INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255),
        type VARCHAR(50),
        email VARCHAR(255),
        status VARCHAR(50),
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS collections (
        id VARCHAR(50) PRIMARY KEY,
        bin_id VARCHAR(50),
        driver_id VARCHAR(50),
        timestamp TIMESTAMP,
        weight INTEGER,
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS issues (
        id VARCHAR(50) PRIMARY KEY,
        type VARCHAR(50),
        description TEXT,
        priority VARCHAR(50),
        status VARCHAR(50),
        reported_by VARCHAR(255),
        date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id VARCHAR(50) PRIMARY KEY,
        type VARCHAR(50),
        license_plate VARCHAR(50),
        capacity VARCHAR(50),
        status VARCHAR(50),
        driver_id VARCHAR(50),
        fuel_level INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables initialized');
  } catch (err) {
    console.error('❌ Database initialization error:', err);
  }
}

// Data access functions
function getBins() {
  return inMemoryData.bins;
}

function getUsers() {
  return inMemoryData.users;
}

function getCollections() {
  return inMemoryData.collections;
}

function getIssues() {
  return inMemoryData.issues;
}

function getVehicles() {
  return inMemoryData.vehicles;
}

function getRoutes() {
  return inMemoryData.routes;
}

function getAlerts() {
  return inMemoryData.alerts;
}

function getComplaints() {
  return inMemoryData.complaints;
}

function getAnalytics() {
  return inMemoryData.analytics;
}

function getSystemLogs() {
  return inMemoryData.systemLogs;
}

function updateDriverLocation(driverId, latitude, longitude) {
  const user = inMemoryData.users.find(u => u.id === driverId);
  if (user) {
    user.lastLocation = { latitude, longitude };
    user.lastUpdate = new Date().toISOString();
    return true;
  }
  return false;
}

function updateDriverStatus(driverId, status, movementStatus) {
  const user = inMemoryData.users.find(u => u.id === driverId);
  if (user) {
    user.status = status;
    user.movementStatus = movementStatus;
    user.lastStatusUpdate = new Date().toISOString();
    return true;
  }
  return false;
}

function updateDriverFuel(driverId, fuelLevel) {
  const vehicle = inMemoryData.vehicles.find(v => v.driverId === driverId);
  if (vehicle) {
    vehicle.fuelLevel = fuelLevel;
    vehicle.lastFuelUpdate = new Date().toISOString();
    return true;
  }
  return false;
}

function addCollection(collection) {
  const newCollection = {
    id: `COL-${Date.now()}`,
    ...collection,
    timestamp: new Date().toISOString()
  };
  inMemoryData.collections.push(newCollection);
  return newCollection;
}

function addRoute(route) {
  const newRoute = {
    id: `ROUTE-${Date.now()}`,
    ...route,
    createdAt: new Date().toISOString()
  };
  inMemoryData.routes.push(newRoute);
  return newRoute;
}

// Export functions
module.exports = {
  query,
  initializeDatabase,
  getBins,
  getUsers,
  getCollections,
  getIssues,
  getVehicles,
  getRoutes,
  getAlerts,
  getComplaints,
  getAnalytics,
  getSystemLogs,
  updateDriverLocation,
  updateDriverStatus,
  updateDriverFuel,
  addCollection,
  addRoute,
  inMemoryData
};

