// api/collections.js - Collections management endpoint
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
      // Get all collections
      const collections = db.getCollections();
      
      console.log(`📦 Collections requested: ${collections.length} collections`);
      
      res.status(200).json({
        success: true,
        collections,
        count: collections.length,
        timestamp: new Date().toISOString()
      });
    } else if (req.method === 'POST') {
      // Create new collection
      const collectionData = req.body;
      
      if (!collectionData.binId || !collectionData.driverId) {
        res.status(400).json({ error: 'Missing required fields: binId and driverId' });
        return;
      }

      const newCollection = db.addCollection(collectionData);
      
      console.log(`📦 New collection created: ${newCollection.id}`);
      
      res.status(201).json({
        success: true,
        collection: newCollection,
        message: 'Collection created successfully'
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Collections error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};



