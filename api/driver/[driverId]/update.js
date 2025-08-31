// api/driver/[driverId]/update.js - Driver data update endpoint
const db = require('../../db');

module.exports = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'POST' && req.method !== 'PUT') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Ensure data integrity for serverless environment
    db.ensureDataIntegrity();
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


