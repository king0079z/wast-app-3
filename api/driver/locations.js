// api/driver/locations.js - All driver locations endpoint
const db = require('../db');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Get all drivers with their locations
    const drivers = db.getUsers().filter(user => user.type === 'driver');
    
    const driversWithLocations = drivers.map(driver => {
      const vehicle = db.getVehicles().find(v => v.driverId === driver.id);
      
      return {
        id: driver.id,
        name: driver.name,
        status: driver.status || 'active',
        movementStatus: driver.movementStatus || 'stationary',
        location: driver.lastLocation || {
          latitude: 25.276987,
          longitude: 51.520008
        },
        vehicle: vehicle ? {
          id: vehicle.id,
          licensePlate: vehicle.licensePlate,
          fuelLevel: vehicle.fuelLevel || 75
        } : null,
        lastUpdate: driver.lastUpdate || new Date().toISOString()
      };
    });

    console.log(`📍 Driver locations requested - Found ${driversWithLocations.length} drivers`);
    
    res.status(200).json({
      success: true,
      drivers: driversWithLocations,
      count: driversWithLocations.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Driver locations error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
