// api/routes.js - Routes management endpoint
const db = require('./db');

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
      // Get all routes
      const routes = db.getRoutes();
      
      console.log(`🛣️ Routes requested: ${routes.length} routes`);
      
      res.status(200).json({
        success: true,
        routes,
        count: routes.length,
        timestamp: new Date().toISOString()
      });
    } else if (req.method === 'POST') {
      // Create new route
      const routeData = req.body;
      
      if (!routeData.name || !routeData.driverId) {
        res.status(400).json({ error: 'Missing required fields: name and driverId' });
        return;
      }

      const newRoute = db.addRoute(routeData);
      
      console.log(`🛣️ New route created: ${newRoute.id} for driver ${routeData.driverId}`);
      
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
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};



