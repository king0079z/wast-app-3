// api/driver/[driverId].js - Consolidated driver endpoint
const db = require('../db');

// Get driver data
function handleGetDriver(req, res, driverId) {
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

  res.status(200).json({
    success: true,
    driver: driverData,
    timestamp: new Date().toISOString()
  });
}

// Get driver routes
function handleGetRoutes(req, res, driverId) {
  const routes = db.getRoutes().filter(route => route.driverId === driverId);
  
  res.status(200).json({
    success: true,
    routes,
    timestamp: new Date().toISOString()
  });
}

// Update driver location
function handleUpdateLocation(req, res, driverId) {
  const { lat, lng, accuracy, heading } = req.body;
  
  if (!lat || !lng) {
    res.status(400).json({ error: 'Latitude and longitude are required' });
    return;
  }

  const users = db.getUsers();
  const driverIndex = users.findIndex(user => user.id === driverId);
  
  if (driverIndex === -1) {
    res.status(404).json({ error: 'Driver not found' });
    return;
  }

  users[driverIndex].lastLocation = {
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    accuracy: accuracy ? parseFloat(accuracy) : null,
    heading: heading ? parseFloat(heading) : null,
    timestamp: new Date().toISOString()
  };

  res.status(200).json({
    success: true,
    message: 'Location updated successfully',
    location: users[driverIndex].lastLocation
  });
}

// Update driver status
function handleUpdateStatus(req, res, driverId) {
  const { status, workingHours } = req.body;
  
  if (!status) {
    res.status(400).json({ error: 'Status is required' });
    return;
  }

  const users = db.getUsers();
  const driverIndex = users.findIndex(user => user.id === driverId);
  
  if (driverIndex === -1) {
    res.status(404).json({ error: 'Driver not found' });
    return;
  }

  users[driverIndex].status = status;
  if (workingHours) {
    users[driverIndex].workingHours = workingHours;
  }
  users[driverIndex].lastUpdate = new Date().toISOString();

  res.status(200).json({
    success: true,
    message: 'Status updated successfully',
    status: users[driverIndex].status
  });
}

// Update fuel level
function handleUpdateFuel(req, res, driverId) {
  const { fuelLevel } = req.body;
  
  if (fuelLevel === undefined || fuelLevel === null) {
    res.status(400).json({ error: 'Fuel level is required' });
    return;
  }

  const vehicles = db.getVehicles();
  const vehicleIndex = vehicles.findIndex(v => v.driverId === driverId);
  
  if (vehicleIndex === -1) {
    res.status(404).json({ error: 'Vehicle not found for driver' });
    return;
  }

  vehicles[vehicleIndex].fuelLevel = parseFloat(fuelLevel);
  vehicles[vehicleIndex].lastUpdate = new Date().toISOString();

  res.status(200).json({
    success: true,
    message: 'Fuel level updated successfully',
    fuelLevel: vehicles[vehicleIndex].fuelLevel
  });
}

// Update driver data
function handleUpdateDriver(req, res, driverId) {
  const updateData = req.body;
  const users = db.getUsers();
  const driverIndex = users.findIndex(user => user.id === driverId);
  
  if (driverIndex === -1) {
    res.status(404).json({ error: 'Driver not found' });
    return;
  }

  const updatedFields = [];
  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined) {
      users[driverIndex][key] = updateData[key];
      updatedFields.push(key);
    }
  });

  users[driverIndex].lastUpdate = new Date().toISOString();
  
  res.status(200).json({
    success: true,
    message: 'Driver updated successfully',
    updatedFields,
    timestamp: new Date().toISOString()
  });
}

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
    const { driverId, action } = req.query;

    if (!driverId) {
      res.status(400).json({ error: 'Driver ID is required' });
      return;
    }

    if (req.method === 'GET') {
      switch (action) {
        case 'routes':
          return handleGetRoutes(req, res, driverId);
        default:
          return handleGetDriver(req, res, driverId);
      }
    } else if (req.method === 'POST') {
      switch (action) {
        case 'location':
          return handleUpdateLocation(req, res, driverId);
        case 'status':
          return handleUpdateStatus(req, res, driverId);
        case 'fuel':
          return handleUpdateFuel(req, res, driverId);
        case 'update':
          return handleUpdateDriver(req, res, driverId);
        default:
          return handleUpdateDriver(req, res, driverId);
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Driver endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
