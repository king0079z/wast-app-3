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
    const vehicles = db.getVehicles();
    
    const driverLocations = drivers.map(driver => {
      const vehicle = vehicles.find(v => v.driverId === driver.id);
      
      return {
        driverId: driver.id,
        name: driver.name,
        status: driver.status,
        movementStatus: driver.movementStatus || 'stationary',
        location: driver.lastLocation || {
          latitude: 25.276987 + (Math.random() - 0.5) * 0.1,
          longitude: 51.520008 + (Math.random() - 0.5) * 0.1
        },
        vehicle: vehicle ? {
          id: vehicle.id,
          type: vehicle.type,
          licensePlate: vehicle.licensePlate,
          fuelLevel: vehicle.fuelLevel
        } : null,
        lastUpdate: driver.lastUpdate || new Date().toISOString()
      };
    });

    console.log(`📍 Driver locations requested: ${driverLocations.length} drivers`);
    
    // Convert to the format expected by the client
    const locations = {};
    driverLocations.forEach(driver => {
      if (driver.location) {
        locations[driver.driverId] = {
          lat: driver.location.latitude,
          lng: driver.location.longitude,
          timestamp: driver.lastUpdate,
          speed: 0,
          accuracy: 50,
          name: driver.name,
          status: driver.status,
          movementStatus: driver.movementStatus
        };
      }
    });
    
    res.status(200).json({
      success: true,
      locations: locations,
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

