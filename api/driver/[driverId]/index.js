// api/driver/[driverId]/index.js - Driver data endpoint
const db = require('../../db');

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

    if (!driverId) {
      res.status(400).json({ error: 'Driver ID is required' });
      return;
    }

    if (req.method === 'GET') {
      // Get driver data
      const driver = db.getUsers().find(user => user.id === driverId && user.type === 'driver');
      
      if (!driver) {
        res.status(404).json({ error: 'Driver not found' });
        return;
      }

      // Get driver's vehicle
      const vehicle = db.getVehicles().find(v => v.driverId === driverId);
      
      // Get driver's routes
      const routes = db.getRoutes().filter(route => route.driverId === driverId);
      
      // Get driver's collections
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
    } else if (req.method === 'POST') {
      // Update driver data
      const updateData = req.body;
      const users = db.getUsers();
      const driverIndex = users.findIndex(user => user.id === driverId);
      
      if (driverIndex === -1) {
        res.status(404).json({ error: 'Driver not found' });
        return;
      }

      // Update driver fields
      const updatedFields = [];
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          users[driverIndex][key] = updateData[key];
          updatedFields.push(key);
        }
      });

      users[driverIndex].lastUpdate = new Date().toISOString();

      console.log(`🔄 Driver ${driverId} updated:`, updatedFields);
      
      res.status(200).json({
        success: true,
        message: 'Driver updated successfully',
        updatedFields,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Driver data error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};



