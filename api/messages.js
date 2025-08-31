// api/messages.js - Emergency and regular messaging endpoint
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
    if (req.method === 'POST') {
      // Handle incoming message
      const messageData = req.body;
      
      if (!messageData.senderId || !messageData.message) {
        res.status(400).json({ error: 'Missing required fields: senderId and message' });
        return;
      }

      // Store message in database/memory
      const message = {
        id: messageData.id || Date.now().toString(),
        senderId: messageData.senderId,
        senderName: messageData.senderName,
        sender: messageData.sender, // 'driver' or 'admin'
        message: messageData.message,
        type: messageData.type || 'regular',
        priority: messageData.priority || 'normal',
        timestamp: messageData.timestamp || new Date().toISOString(),
        status: 'delivered',
        targetDriverId: messageData.targetDriverId
      };

      // Add to in-memory storage (you could extend db.js to have message storage)
      if (!db.messages) {
        db.messages = [];
      }
      db.messages.push(message);

      console.log(`📨 Message received: ${message.type} from ${message.senderName} (${message.senderId})`);
      
      // Special handling for emergency messages
      if (message.type === 'emergency') {
        console.log('🚨 EMERGENCY MESSAGE RECEIVED:', message.message.substring(0, 100));
        
        // Here you could add additional logic like:
        // - Send email notifications
        // - SMS alerts  
        // - Push notifications
        // - Log to priority system
        
        // For now, just ensure it's marked as high priority
        message.priority = 'high';
        message.emergencyAlert = true;
      }

      res.status(200).json({
        success: true,
        messageId: message.id,
        status: 'delivered',
        message: 'Message delivered successfully',
        timestamp: new Date().toISOString()
      });

    } else if (req.method === 'GET') {
      // Get messages (optional - for admin to fetch messages)
      const { driverId, type } = req.query;
      
      let messages = db.messages || [];
      
      // Filter by driver if requested
      if (driverId) {
        messages = messages.filter(msg => 
          msg.senderId === driverId || msg.targetDriverId === driverId
        );
      }
      
      // Filter by type if requested
      if (type) {
        messages = messages.filter(msg => msg.type === type);
      }
      
      // Sort by timestamp (newest first)
      messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      console.log(`📨 Messages requested: ${messages.length} messages`);

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
    console.error('❌ Messages API error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
