// api/driver/[driverId]/status.js - Driver status update endpoint
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
    const { status, movementStatus, activity } = req.body;

    if (!driverId || !status) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Update driver status
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
  } catch (error) {
    console.error('❌ Status update error:', error);
    
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



