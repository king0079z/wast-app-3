// api/health.js - Health check endpoint
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

  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '9.0.0',
    environment: process.env.NODE_ENV || 'production',
    uptime: process.uptime(),
    platform: 'Vercel',
    node_version: process.version,
    services: {
      api: 'operational',
      database: 'operational',
      websocket: 'operational'
    }
  };

  console.log('💓 Health check requested');
  
  res.status(200).json(healthData);
};

