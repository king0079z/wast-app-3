// api/messages.js - Emergency messaging endpoint
const db = require('./db');

// In-memory message storage for emergencies (fallback)
let emergencyMessages = [];

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
    if (req.method === 'POST') {
      // Store emergency message
      const message = req.body;
      
      if (!message.type || !message.userId || !message.message) {
        res.status(400).json({ 
          error: 'Missing required fields: type, userId, message' 
        });
        return;
      }

      const emergencyMessage = {
        id: `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ...message,
        timestamp: new Date().toISOString(),
        status: 'active'
      };

      // Try to store in database, fallback to memory
      if (db && typeof db.addMessage === 'function') {
        db.addMessage(emergencyMessage);
      } else {
        emergencyMessages.push(emergencyMessage);
      }

      console.log('🚨 Emergency message stored:', emergencyMessage.id);
      
      res.status(200).json({
        success: true,
        message: 'Emergency message stored successfully',
        messageId: emergencyMessage.id,
        timestamp: new Date().toISOString()
      });

    } else if (req.method === 'GET') {
      // Retrieve emergency messages
      const { type, userId, limit = 50 } = req.query;
      
      let messages = [];
      
      // Try to get from database, fallback to memory
      if (db && typeof db.getMessages === 'function') {
        messages = db.getMessages();
      } else {
        messages = [...emergencyMessages];
      }

      // Filter messages
      if (type) {
        messages = messages.filter(msg => msg.type === type);
      }
      if (userId) {
        messages = messages.filter(msg => msg.userId === userId);
      }

      // Limit results
      messages = messages.slice(-limit);
      
      // Sort by timestamp (newest first)
      messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      res.status(200).json({
        success: true,
        messages,
        count: messages.length,
        timestamp: new Date().toISOString()
      });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Messages endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
