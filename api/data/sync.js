// api/data/sync.js - Data synchronization endpoint
const db = require('../db');

module.exports = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Ensure data integrity for serverless environment
    db.ensureDataIntegrity();
    if (req.method === 'GET') {
<<<<<<< HEAD
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
=======
      // Return all system data in the format expected by the client
      const systemData = {
        success: true,
        data: {
          bins: db.getBins(),
          users: db.getUsers(),
          collections: db.getCollections(),
          issues: db.getIssues(),
          vehicles: db.getVehicles(),
          routes: db.getRoutes(),
          alerts: db.getAlerts(),
          complaints: db.getComplaints(),
          analytics: db.getAnalytics(),
          systemLogs: db.getSystemLogs(),
          driverLocations: {}
        },
>>>>>>> 3a3d25021ae37e98129b71bb8b9b56323687f303
        timestamp: new Date().toISOString()
      };

      // Add driver locations
      const drivers = db.getUsers().filter(user => user.type === 'driver');
      drivers.forEach(driver => {
        if (driver.lastLocation) {
          systemData.data.driverLocations[driver.id] = {
            lat: driver.lastLocation.latitude,
            lng: driver.lastLocation.longitude,
            timestamp: driver.lastUpdate || new Date().toISOString(),
            speed: 0,
            accuracy: 50
          };
        }
      });

      console.log('📊 Data sync requested');
      res.status(200).json({
        success: true,
        data: systemData,
        timestamp: new Date().toISOString()
      });
    } else if (req.method === 'POST') {
      // Handle data updates from client
      const requestData = req.body;
      
      console.log('📥 Data sync update received');
      
<<<<<<< HEAD
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
=======
      // Handle the sync format from the client
      if (requestData.data) {
        const { data, updateType } = requestData;
        
        // Update in-memory data with received data
        Object.keys(data).forEach(key => {
          if (data[key] !== undefined && data[key] !== null) {
            // Update the appropriate data store
            switch (key) {
              case 'users':
                if (Array.isArray(data[key])) {
                  // Merge users data
                  db.inMemoryData.users = data[key];
                }
                break;
              case 'driverLocations':
                if (typeof data[key] === 'object') {
                  // Update driver locations
                  Object.keys(data[key]).forEach(driverId => {
                    const location = data[key][driverId];
                    if (location.lat && location.lng) {
                      db.updateDriverLocation(driverId, location.lat, location.lng);
                    }
                  });
                }
                break;
              case 'collections':
                if (Array.isArray(data[key])) {
                  db.inMemoryData.collections = data[key];
                }
                break;
              case 'routes':
                if (Array.isArray(data[key])) {
                  db.inMemoryData.routes = data[key];
                }
                break;
              default:
                if (db.inMemoryData[key] !== undefined) {
                  db.inMemoryData[key] = data[key];
                }
            }
            console.log(`📝 Updated ${key} data`);
          }
        });
>>>>>>> 3a3d25021ae37e98129b71bb8b9b56323687f303
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

