// api/driver/[driverId]/location.js - Driver location update endpoint
const db = require('../../db');

module.exports = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Ensure data integrity for serverless environment
    db.ensureDataIntegrity();
    const { driverId } = req.query;
    const { latitude, longitude, accuracy, timestamp } = req.body;

    if (!driverId || !latitude || !longitude) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Update driver location
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
  } catch (error) {
    console.error('❌ Location update error:', error);
    
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



