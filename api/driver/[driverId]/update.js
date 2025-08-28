// api/driver/[driverId]/update.js - Driver data update endpoint
const db = require('../../db');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST' && req.method !== 'PUT') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { driverId } = req.query;
    const updateData = req.body;

    if (!driverId) {
      res.status(400).json({ error: 'Driver ID is required' });
      return;
    }

    // Find driver in in-memory data
    const users = db.getUsers();
    const driverIndex = users.findIndex(u => u.id === driverId);
    
    if (driverIndex === -1) {
      res.status(404).json({ error: 'Driver not found' });
      return;
    }

    // Update driver data
    const updatedDriver = {
      ...users[driverIndex],
      ...updateData,
      lastUpdate: new Date().toISOString()
    };

    // Update in memory
    users[driverIndex] = updatedDriver;

    console.log(`✅ Driver ${driverId} updated successfully`);
    
    res.status(200).json({
      success: true,
      message: 'Driver updated successfully',
      driver: updatedDriver
    });

  } catch (error) {
    console.error('❌ Driver update error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
