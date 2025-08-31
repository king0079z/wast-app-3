// api/info.js - System information endpoint
const db = require('./db');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Get system statistics
    const bins = db.getBins();
    const users = db.getUsers();
    const collections = db.getCollections();
    const vehicles = db.getVehicles();
    const routes = db.getRoutes();
    const issues = db.getIssues();
    const alerts = db.getAlerts();

    const systemInfo = {
      system: {
        name: 'Autonautics Waste Management System',
        version: '9.0.0 Enhanced',
        description: 'AI-Powered Smart Waste Management with Real-time Tracking',
        environment: process.env.NODE_ENV || 'production',
        platform: 'Vercel Serverless',
        timestamp: new Date().toISOString()
      },
      statistics: {
        totalBins: bins.length,
        totalUsers: users.length,
        totalDrivers: users.filter(u => u.type === 'driver').length,
        totalAdmins: users.filter(u => u.type === 'admin').length,
        totalManagers: users.filter(u => u.type === 'manager').length,
        totalCollections: collections.length,
        totalVehicles: vehicles.length,
        totalRoutes: routes.length,
        activeIssues: issues.filter(i => i.status === 'open').length,
        activeAlerts: alerts.filter(a => a.status === 'active').length,
        todayCollections: collections.filter(c => {
          const collectionDate = new Date(c.timestamp).toDateString();
          const today = new Date().toDateString();
          return collectionDate === today;
        }).length
      },
      features: [
        'Real-time GPS Tracking',
        'AI Route Optimization',
        'Predictive Analytics',
        'Smart Bin Monitoring',
        'Driver Management',
        'Fleet Management',
        'Environmental Reporting',
        'WebSocket Communication',
        'Comprehensive Analytics',
        'Mobile-Responsive Design'
      ],
      endpoints: [
        'GET /api/health - Health check',
        'GET /api/info - System information',
        'GET /api/data/sync - Data synchronization',
        'POST /api/data/sync - Data updates',
        'GET /api/driver/locations - All driver locations',
        'POST /api/driver/{id}/location - Update driver location',
        'POST /api/driver/{id}/status - Update driver status',
        'POST /api/driver/{id}/fuel - Update fuel level',
        'GET /api/driver/{id}/routes - Get driver routes',
        'GET /api/collections - Get collections',
        'POST /api/collections - Create collection',
        'GET /api/routes - Get routes',
        'POST /api/routes - Create route'
      ]
    };

    console.log('ℹ️ System info requested');
    
    res.status(200).json(systemInfo);
  } catch (error) {
    console.error('❌ System info error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};



