// api/system.js - Consolidated system endpoints (health + info)
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
    const { action } = req.query;

    switch (action) {
      case 'info':
        return handleSystemInfo(res);
      case 'health':
      default:
        return handleHealthCheck(res);
    }
  } catch (error) {
    console.error('❌ System API error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Health check endpoint
function handleHealthCheck(res) {
  const systemStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };

  console.log('🏥 Health check requested - System healthy');
  
  res.status(200).json(systemStatus);
}

// System info endpoint  
function handleSystemInfo(res) {
  const systemInfo = {
    name: 'Autonautics Waste Management System',
    version: '1.0.0',
    description: 'AI-Powered Smart Waste Management with Real-time GPS Tracking',
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    features: [
      'Real-time GPS tracking',
      'Bidirectional messaging',
      'AI-powered analytics',
      'Smart route optimization',
      'Responsive UI',
      'Secure authentication',
      'Cloud database integration'
    ]
  };

  console.log('ℹ️ System info requested');
  
  res.status(200).json(systemInfo);
}
