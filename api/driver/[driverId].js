// api/driver/[driverId].js - Consolidated driver endpoint
const db = require('../db');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { driverId } = req.query;
    const { action } = req.query; // Get action from query params

    if (!driverId) {
      res.status(400).json({ error: 'Driver ID is required' });
      return;
    }

    if (req.method === 'GET') {
      // Handle different GET operations based on action
      switch (action) {
        case 'routes':
          return handleGetRoutes(driverId, res);
        default:
          return handleGetDriver(driverId, res);
      }
    } else if (req.method === 'POST') {
      // Handle different POST operations based on action
      switch (action) {
        case 'location':
          return handleUpdateLocation(driverId, req.body, res);
        case 'status':
          return handleUpdateStatus(driverId, req.body, res);
        case 'fuel':
          return handleUpdateFuel(driverId, req.body, res);
        case 'update':
        default:
          return handleUpdateDriver(driverId, req.body, res);
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Driver API error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Get driver data
async function handleGetDriver(driverId, res) {
  const driver = db.getUsers().find(user => user.id === driverId && user.type === 'driver');
  
  if (!driver) {
    res.status(404).json({ error: 'Driver not found' });
    return;
  }

  const vehicle = db.getVehicles().find(v => v.driverId === driverId);
  const routes = db.getRoutes().filter(route => route.driverId === driverId);
  const collections = db.getCollections().filter(c => c.driverId === driverId);

  const driverData = {
    ...driver,
    vehicle,
    routes,
    collections: collections.length,
    recentCollections: collections.slice(-10)
  };

  console.log(`👤 Driver data requested for ${driverId}`);
  
  res.status(200).json({
    success: true,
    driver: driverData,
    timestamp: new Date().toISOString()
  });
}

// Get driver routes
async function handleGetRoutes(driverId, res) {
  const routes = db.getRoutes().filter(route => route.driverId === driverId);
  
  console.log(`🗺️ Routes requested for driver ${driverId}: ${routes.length} routes`);
  
  res.status(200).json({
    success: true,
    routes,
    timestamp: new Date().toISOString()
  });
}

// Update driver location
async function handleUpdateLocation(driverId, body, res) {
  const { latitude, longitude, accuracy, timestamp } = body;

  if (!latitude || !longitude) {
    res.status(400).json({ error: 'Missing latitude or longitude' });
    return;
  }

  const success = db.updateDriverLocation(driverId, latitude, longitude);
  
  if (success) {
    console.log(`📍 Location updated for driver ${driverId}: ${latitude}, ${longitude}`);
    
    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      driverId,
      latitude,
      longitude,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(404).json({ error: 'Driver not found' });
  }
}

// Update driver status
async function handleUpdateStatus(driverId, body, res) {
  const { status, movementStatus, activity } = body;

  if (!status) {
    res.status(400).json({ error: 'Status is required' });
    return;
  }

  const success = db.updateDriverStatus(driverId, status, movementStatus);
  
  if (success) {
    console.log(`🚛 Driver ${driverId} status updated - Movement: ${movementStatus}, Status: ${status}`);
    
    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      driverId,
      status,
      movementStatus,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(404).json({ error: 'Driver not found' });
  }
}

// Update fuel level
async function handleUpdateFuel(driverId, body, res) {
  const { fuelLevel } = body;

  if (fuelLevel === undefined) {
    res.status(400).json({ error: 'Fuel level is required' });
    return;
  }

  const success = db.updateDriverFuel(driverId, fuelLevel);
  
  if (success) {
    console.log(`⛽ Fuel level updated for driver ${driverId}: ${fuelLevel}%`);
    
    res.status(200).json({
      success: true,
      message: 'Fuel level updated successfully',
      driverId,
      fuelLevel,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(404).json({ error: 'Driver not found' });
  }
}

// Update driver data
async function handleUpdateDriver(driverId, body, res) {
  console.log(`🔄 Updating driver ${driverId}:`, Object.keys(body));
  
  const users = db.getUsers();
  const driverIndex = users.findIndex(u => u.id === driverId);
  
  if (driverIndex === -1) {
    res.status(404).json({
      success: false,
      error: 'Driver not found'
    });
    return;
  }
  
  // Update the driver data
  const updatedDriver = {
    ...users[driverIndex],
    ...body,
    lastUpdate: new Date().toISOString()
  };
  
  // Update in memory data
  db.inMemoryData.users[driverIndex] = updatedDriver;
  
  console.log(`✅ Driver ${driverId} updated successfully`);
  
  res.status(200).json({
    success: true,
    data: updatedDriver,
    message: 'Driver updated successfully'
  });
}
