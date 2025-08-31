// api/system.js - Consolidated system endpoints (health, info)
const db = require('./db');

// Health check handler
function handleHealthCheck(req, res) {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: db ? 'connected' : 'fallback',
      memory: process.memoryUsage(),
      uptime: process.uptime()
    }
  };
  
  res.status(200).json({
    success: true,
    health: healthData
  });
}

// System info handler
function handleSystemInfo(req, res) {
  const systemInfo = {
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    features: {
      realTimeTracking: true,
      aiAnalytics: true,
      emergencyAlerts: true,
      routeOptimization: true
    }
  };
  
  res.status(200).json({
    success: true,
    info: systemInfo
  });
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { action } = req.query;

    if (req.method === 'GET') {
      switch (action) {
        case 'health':
          return handleHealthCheck(req, res);
        case 'info':
          return handleSystemInfo(req, res);
        default:
          // Default to health check
          return handleHealthCheck(req, res);
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ System endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
