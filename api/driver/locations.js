// api/driver/locations.js - All driver locations endpoint
const db = require('../db');

module.exports = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Ensure data integrity for serverless environment
    db.ensureDataIntegrity();
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
<<<<<<< HEAD
      drivers: driversWithLocations,
      count: driversWithLocations.length,
=======
      locations: locations,
>>>>>>> 3a3d25021ae37e98129b71bb8b9b56323687f303
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Driver locations error:', error);
    
    // Ensure we always return JSON, not HTML
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    });
  }
};
