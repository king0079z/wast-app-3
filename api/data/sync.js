// api/data/sync.js - Data synchronization endpoint
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
    if (req.method === 'GET') {
      // Return all system data - ensure all functions exist
      const systemData = {
        bins: db.getBins ? db.getBins() : [],
        users: db.getUsers ? db.getUsers() : [],
        collections: db.getCollections ? db.getCollections() : [],
        issues: db.getIssues ? db.getIssues() : [],
        vehicles: db.getVehicles ? db.getVehicles() : [],
        routes: db.getRoutes ? db.getRoutes() : [],
        alerts: db.getAlerts ? db.getAlerts() : [],
        complaints: db.getComplaints ? db.getComplaints() : [],
        analytics: db.getAnalytics ? db.getAnalytics() : {},
        systemLogs: db.getSystemLogs ? db.getSystemLogs() : [],
        timestamp: new Date().toISOString()
      };

      console.log('📊 Data sync requested');
      res.status(200).json({
        success: true,
        data: systemData,
        timestamp: new Date().toISOString()
      });
    } else if (req.method === 'POST') {
      // Handle data updates
      const { type, data } = req.body;
      
      console.log('📥 Data update received:', type);
      
      // Process different types of updates with safety checks
      switch (type) {
        case 'driver_location':
          if (db.updateDriverLocation && data.driverId) {
            db.updateDriverLocation(data.driverId, data.latitude, data.longitude);
          }
          break;
        case 'driver_status':
          if (db.updateDriverStatus && data.driverId) {
            db.updateDriverStatus(data.driverId, data.status, data.movementStatus);
          }
          break;
        case 'collection':
          if (db.addCollection && data) {
            db.addCollection(data);
          }
          break;
        default:
          console.log('⚠️ Unknown update type:', type);
      }

      res.status(200).json({
        success: true,
        message: 'Data updated successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Data sync error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

