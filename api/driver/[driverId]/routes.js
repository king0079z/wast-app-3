// api/driver/[driverId]/routes.js - Driver routes endpoint
const db = require('../../db');

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
    const { driverId } = req.query;

    if (!driverId) {
      res.status(400).json({ error: 'Driver ID is required' });
      return;
    }

    if (req.method === 'GET') {
      // Get routes for specific driver
      const routes = db.getRoutes().filter(route => route.driverId === driverId);
      
      console.log(`📋 Routes requested for driver ${driverId}: ${routes.length} routes found`);
      
      res.status(200).json({
        success: true,
        routes,
        driverId,
        timestamp: new Date().toISOString()
      });
    } else if (req.method === 'POST') {
      // Create new route for driver
      const routeData = {
        ...req.body,
        driverId,
        status: 'active'
      };

      const newRoute = db.addRoute(routeData);
      
      console.log(`🛣️ New route created for driver ${driverId}: ${newRoute.id}`);
      
      res.status(201).json({
        success: true,
        route: newRoute,
        message: 'Route created successfully'
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Routes error:', error);
    
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



