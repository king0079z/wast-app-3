// server.js - Simple Node.js server for the Waste Management System

const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

// Create Express app and HTTP server
const app = express();
const PORT = process.env.PORT || 8080;
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ 
    server,
    path: '/ws'
});

// WebSocket connection handling
const clients = new Set();

wss.on('connection', (ws, req) => {
    console.log('🔌 New WebSocket connection established');
    clients.add(ws);
    
    // Send welcome message
    ws.send(JSON.stringify({
        type: 'connected',
        message: 'WebSocket connection established',
        timestamp: new Date().toISOString()
    }));
    
    // Handle incoming messages
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            console.log('📨 WebSocket message received:', message.type);
            
            switch (message.type) {
                case 'ping':
                    ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
                    break;
                case 'client_info':
                    console.log('👤 Client info received:', message.userId, 'Type:', message.userType);
                    console.log('👤 Full client_info message:', message);
                    ws.userId = message.userId; // Store user ID for message routing
                    ws.userType = message.userType; // Store user type for debugging
                    
                    // Enhanced logging for driver connections
                    if (message.userId && message.userId.startsWith('USR-')) {
                        console.log(`🚗 Driver ${message.userId} connected via WebSocket`);
                    }
                    break;
                case 'chat_message':
                    handleChatMessage(ws, message);
                    break;
                case 'typing_indicator':
                    handleTypingIndicator(ws, message);
                    break;
                default:
                    console.log('❓ Unknown WebSocket message type:', message.type);
            }
        } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
        }
    });
    
    // Handle connection close
    ws.on('close', () => {
        console.log('🔌 WebSocket connection closed');
        clients.delete(ws);
    });
    
    // Handle errors
    ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        clients.delete(ws);
    });
});

// Broadcast function for real-time updates
function broadcastToClients(data) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            try {
                client.send(message);
            } catch (error) {
                console.error('❌ Error broadcasting to client:', error);
                clients.delete(client);
            }
        }
    });
}

// Security middleware - COMPLETELY DISABLED for development
// Helmet CSP is causing issues with inline event handlers
// app.use(helmet());

// Enable CORS
app.use(cors());

// Disable caching to prevent CSP cache issues in development
app.use((req, res, next) => {
    res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
    });
    next();
});

// Compress responses
app.use(compression());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-memory data store (in production, use a real database)
let serverData = {
    users: [],
    bins: [],
    routes: [],
    collections: [],
    complaints: [],
    alerts: [],
    pendingRegistrations: [],
    systemLogs: [],
    driverLocations: {},
    analytics: {},
    initialized: false,
    lastUpdate: new Date().toISOString()
};

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// API Routes for Data Synchronization

// Get all data for sync
app.get('/api/data/sync', (req, res) => {
    try {
        console.log('Data sync requested');
        res.json({
            success: true,
            data: serverData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to sync data'
        });
    }
});

// Update server data
app.post('/api/data/sync', (req, res) => {
    try {
        const { data, timestamp, updateType } = req.body;
        
        console.log(`Data update received: ${updateType || 'full'}`);
        
        if (updateType === 'partial') {
            // Merge partial updates
            Object.keys(data).forEach(key => {
                if (data[key] !== undefined) {
                    serverData[key] = data[key];
                }
            });
        } else {
            // Full data update
            serverData = { ...serverData, ...data };
        }
        
        serverData.lastUpdate = new Date().toISOString();
        
        res.json({
            success: true,
            message: 'Data updated successfully',
            timestamp: serverData.lastUpdate
        });
    } catch (error) {
        console.error('Data update error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update data'
        });
    }
});

// Specific endpoints for real-time updates

// Update driver location
app.post('/api/driver/:driverId/location', (req, res) => {
    try {
        const { driverId } = req.params;
        const { lat, lng, timestamp, accuracy, speed } = req.body;
        
        if (!serverData.driverLocations) {
            serverData.driverLocations = {};
        }
        
        serverData.driverLocations[driverId] = {
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            timestamp: timestamp || new Date().toISOString(),
            accuracy: accuracy || null,
            speed: speed || 0
        };
        
        serverData.lastUpdate = new Date().toISOString();
        
        console.log(`Location updated for driver ${driverId}: ${lat}, ${lng}`);
        
        res.json({
            success: true,
            message: 'Location updated',
            location: serverData.driverLocations[driverId]
        });
    } catch (error) {
        console.error('Location update error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update location'
        });
    }
});

// Get driver locations
app.get('/api/driver/locations', (req, res) => {
    try {
        res.json({
            success: true,
            locations: serverData.driverLocations || {},
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Get locations error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get locations'
        });
    }
});

// Add/Update route
app.post('/api/routes', (req, res) => {
    try {
        const route = req.body;
        
        if (!serverData.routes) {
            serverData.routes = [];
        }
        
        // Check if route exists
        const existingIndex = serverData.routes.findIndex(r => r.id === route.id);
        
        if (existingIndex >= 0) {
            serverData.routes[existingIndex] = route;
        } else {
            serverData.routes.push(route);
        }
        
        serverData.lastUpdate = new Date().toISOString();
        
        console.log(`Route ${route.id} saved for driver ${route.driverId}`);
        
        res.json({
            success: true,
            message: 'Route saved',
            route: route
        });
    } catch (error) {
        console.error('Route save error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save route'
        });
    }
});

// Get routes for a driver
app.get('/api/driver/:driverId/routes', (req, res) => {
    try {
        const { driverId } = req.params;
        
        const routes = (serverData.routes || []).filter(r => 
            r.driverId === driverId && r.status !== 'completed'
        );
        
        res.json({
            success: true,
            routes: routes,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Get routes error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get routes'
        });
    }
});

// Route completion endpoint
app.post('/api/driver/:driverId/route-completion', (req, res) => {
    try {
        const { driverId } = req.params;
        const { completionTime, status, movementStatus } = req.body;
        
        console.log(`🏁 Route completion received for driver ${driverId}`);
        
        // Find and update driver
        const driverIndex = serverData.users.findIndex(user => user.id === driverId && user.type === 'driver');
        if (driverIndex !== -1) {
            const driver = serverData.users[driverIndex];
            
            // Update driver status
            driver.movementStatus = movementStatus || 'stationary';
            driver.status = 'available';
            driver.lastRouteCompletion = completionTime;
            driver.routeEndTime = completionTime;
            driver.lastStatusUpdate = new Date().toISOString();
            
            // Complete any active routes for this driver
            if (serverData.routes) {
                serverData.routes.forEach(route => {
                    if (route.driverId === driverId && (route.status === 'active' || route.status === 'in-progress')) {
                        route.status = 'completed';
                        route.completedAt = completionTime;
                        route.completedBy = driverId;
                    }
                });
            }
            
            serverData.users[driverIndex] = driver;
            console.log(`✅ Driver ${driverId} route completion processed - Status: ${driver.movementStatus}`);
            
            // Broadcast update to all WebSocket clients
            broadcastToClients({
                type: 'route_completion',
                driverId: driverId,
                driverData: driver,
                status: driver.movementStatus,
                timestamp: new Date().toISOString(),
                action: 'route_completed'
            });
            
            res.json({
                success: true,
                message: 'Route completion processed successfully',
                driver: driver
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Driver not found'
            });
        }
    } catch (error) {
        console.error('Route completion error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process route completion'
        });
    }
});

// Update driver status and profile data
app.post('/api/driver/:driverId/update', (req, res) => {
    try {
        const { driverId } = req.params;
        const updates = req.body;
        
        if (!serverData.users) {
            serverData.users = [];
        }
        
        // Find and update the driver
        const driverIndex = serverData.users.findIndex(u => u.id === driverId);
        
        if (driverIndex >= 0) {
            // Update existing driver
            serverData.users[driverIndex] = {
                ...serverData.users[driverIndex],
                ...updates,
                lastUpdate: new Date().toISOString()
            };
            
            console.log(`🔄 Driver ${driverId} updated:`, Object.keys(updates));
            
            res.json({
                success: true,
                message: 'Driver updated successfully',
                driver: serverData.users[driverIndex]
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Driver not found'
            });
        }
        
        serverData.lastUpdate = new Date().toISOString();
        
    } catch (error) {
        console.error('Driver update error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update driver'
        });
    }
});

// Update driver fuel level specifically
app.post('/api/driver/:driverId/fuel', (req, res) => {
    try {
        const { driverId } = req.params;
        const { fuelLevel } = req.body;
        
        if (!serverData.users) {
            serverData.users = [];
        }
        
        const driverIndex = serverData.users.findIndex(u => u.id === driverId);
        
        if (driverIndex >= 0) {
            serverData.users[driverIndex].fuelLevel = fuelLevel;
            serverData.users[driverIndex].lastFuelUpdate = new Date().toISOString();
            serverData.users[driverIndex].lastUpdate = new Date().toISOString();
            
            console.log(`⛽ Driver ${driverId} fuel level updated to ${fuelLevel}%`);
            
            res.json({
                success: true,
                message: 'Fuel level updated',
                fuelLevel: fuelLevel,
                timestamp: serverData.users[driverIndex].lastFuelUpdate
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Driver not found'
            });
        }
        
        serverData.lastUpdate = new Date().toISOString();
        
    } catch (error) {
        console.error('Fuel update error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update fuel level'
        });
    }
});

// Update driver movement status specifically
app.post('/api/driver/:driverId/status', (req, res) => {
    try {
        const { driverId } = req.params;
        const { movementStatus, status } = req.body;
        
        if (!serverData.users) {
            serverData.users = [];
        }
        
        const driverIndex = serverData.users.findIndex(u => u.id === driverId);
        
        if (driverIndex >= 0) {
            if (movementStatus) {
                serverData.users[driverIndex].movementStatus = movementStatus;
            }
            if (status) {
                serverData.users[driverIndex].status = status;
            }
            serverData.users[driverIndex].lastStatusUpdate = new Date().toISOString();
            serverData.users[driverIndex].lastUpdate = new Date().toISOString();
            
            console.log(`🚛 Driver ${driverId} status updated - Movement: ${movementStatus}, Status: ${status}`);
            
            res.json({
                success: true,
                message: 'Driver status updated',
                movementStatus: serverData.users[driverIndex].movementStatus,
                status: serverData.users[driverIndex].status,
                timestamp: serverData.users[driverIndex].lastStatusUpdate
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Driver not found'
            });
        }
        
        serverData.lastUpdate = new Date().toISOString();
        
    } catch (error) {
        console.error('Status update error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update driver status'
        });
    }
});

// Get specific driver data
app.get('/api/driver/:driverId', (req, res) => {
    try {
        const { driverId } = req.params;
        
        if (!serverData.users) {
            serverData.users = [];
        }
        
        const driver = serverData.users.find(u => u.id === driverId);
        
        if (driver) {
            res.json({
                success: true,
                driver: driver,
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Driver not found'
            });
        }
        
    } catch (error) {
        console.error('Get driver error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get driver data'
        });
    }
});

// Add collection
app.post('/api/collections', (req, res) => {
    try {
        const collection = req.body;
        
        if (!serverData.collections) {
            serverData.collections = [];
        }
        
        serverData.collections.push(collection);
        serverData.lastUpdate = new Date().toISOString();
        
        console.log(`Collection registered: ${collection.binId} by ${collection.driverId}`);
        
        res.json({
            success: true,
            message: 'Collection registered',
            collection: collection
        });
    } catch (error) {
        console.error('Collection save error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to register collection'
        });
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint for health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        dataStatus: {
            users: (serverData.users || []).length,
            bins: (serverData.bins || []).length,
            routes: (serverData.routes || []).length,
            lastUpdate: serverData.lastUpdate
        }
    });
});

// API endpoint for system info
app.get('/api/info', (req, res) => {
    res.json({
        name: 'Autonautics Waste Management System',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// ===== DRIVER-SPECIFIC API ENDPOINTS =====

// Get specific driver data
app.get('/api/driver/:driverId', (req, res) => {
    console.log(`${new Date().toISOString()} - GET /api/driver/${req.params.driverId}`);
    
    const { driverId } = req.params;
    const driver = data.users.find(user => user.id === driverId && user.type === 'driver');
    
    if (!driver) {
        return res.status(404).json({ 
            success: false, 
            message: 'Driver not found' 
        });
    }
    
    res.json({ 
        success: true, 
        data: driver,
        message: 'Driver data retrieved successfully'
    });
});

// Update complete driver profile
app.post('/api/driver/:driverId/update', (req, res) => {
    console.log(`${new Date().toISOString()} - POST /api/driver/${req.params.driverId}/update`);
    
    const { driverId } = req.params;
    const updates = req.body;
    
    const driverIndex = data.users.findIndex(user => user.id === driverId && user.type === 'driver');
    
    if (driverIndex === -1) {
        return res.status(404).json({ 
            success: false, 
            message: 'Driver not found' 
        });
    }
    
    // Update driver data
    data.users[driverIndex] = { ...data.users[driverIndex], ...updates };
    
    console.log(`🔄 Driver ${driverId} updated: [`, Object.keys(updates).map(key => `'${key}'`).join(', '), ']');
    
    // ENHANCED: Broadcast real-time update via WebSocket
    const updatedDriver = data.users[driverIndex];
    broadcastToClients({
        type: 'driver_update',
        driverId: driverId,
        driverData: updatedDriver,
        status: updatedDriver.movementStatus || 'stationary',
        fuelLevel: updatedDriver.fuelLevel || 75,
        timestamp: new Date().toISOString(),
        changes: Object.keys(updates)
    });
    
    res.json({ 
        success: true, 
        data: data.users[driverIndex],
        message: 'Driver updated successfully'
    });
});

// Update only driver fuel level
app.post('/api/driver/:driverId/fuel', (req, res) => {
    console.log(`${new Date().toISOString()} - POST /api/driver/${req.params.driverId}/fuel`);
    
    const { driverId } = req.params;
    const { fuelLevel } = req.body;
    
    const driverIndex = data.users.findIndex(user => user.id === driverId && user.type === 'driver');
    
    if (driverIndex === -1) {
        return res.status(404).json({ 
            success: false, 
            message: 'Driver not found' 
        });
    }
    
    // Update fuel level
    data.users[driverIndex].fuelLevel = fuelLevel;
    data.users[driverIndex].lastUpdate = new Date().toISOString();
    data.users[driverIndex].lastFuelUpdate = new Date().toISOString();
    
    console.log(`⛽ Driver ${driverId} fuel level updated to ${fuelLevel}%`);
    
    // ENHANCED: Broadcast real-time fuel update via WebSocket
    const updatedDriver = data.users[driverIndex];
    broadcastToClients({
        type: 'driver_update',
        driverId: driverId,
        driverData: updatedDriver,
        status: updatedDriver.movementStatus || 'stationary',
        fuelLevel: fuelLevel,
        timestamp: new Date().toISOString(),
        changes: ['fuelLevel']
    });
    
    res.json({ 
        success: true, 
        data: { fuelLevel, lastUpdate: data.users[driverIndex].lastUpdate },
        message: 'Fuel level updated'
    });
});

// Update only driver status
app.post('/api/driver/:driverId/status', (req, res) => {
    console.log(`${new Date().toISOString()} - POST /api/driver/${req.params.driverId}/status`);
    
    const { driverId } = req.params;
    const { movementStatus, status } = req.body;
    
    const driverIndex = data.users.findIndex(user => user.id === driverId && user.type === 'driver');
    
    if (driverIndex === -1) {
        return res.status(404).json({ 
            success: false, 
            message: 'Driver not found' 
        });
    }
    
    // Update status fields
    if (movementStatus !== undefined) {
        data.users[driverIndex].movementStatus = movementStatus;
    }
    if (status !== undefined) {
        data.users[driverIndex].status = status;
    }
    data.users[driverIndex].lastUpdate = new Date().toISOString();
    data.users[driverIndex].lastStatusUpdate = new Date().toISOString();
    
    console.log(`🚛 Driver ${driverId} status updated - Movement: ${movementStatus}, Status: ${status}`);
    
    // ENHANCED: Broadcast real-time status update via WebSocket
    const updatedDriver = data.users[driverIndex];
    broadcastToClients({
        type: 'driver_update',
        driverId: driverId,
        driverData: updatedDriver,
        status: movementStatus || updatedDriver.movementStatus || 'stationary',
        fuelLevel: updatedDriver.fuelLevel || 75,
        timestamp: new Date().toISOString(),
        changes: ['movementStatus', 'status'].filter(field => 
            (field === 'movementStatus' && movementStatus !== undefined) ||
            (field === 'status' && status !== undefined)
        )
    });
    
    res.json({ 
        success: true, 
        data: { 
            movementStatus: data.users[driverIndex].movementStatus,
            status: data.users[driverIndex].status,
            lastUpdate: data.users[driverIndex].lastUpdate 
        },
        message: 'Driver status updated'
    });
});

// Catch-all route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ================== ENHANCED MESSAGING SYSTEM HANDLERS ==================

function handleChatMessage(senderWs, message) {
    console.log('💬 Processing chat message:', message.data);
    
    try {
        const messageData = message.data;
        
        // Store message in memory (could be enhanced with database storage)
        // For now, we rely on client-side storage and real-time broadcasting
        
        // Broadcast message to relevant clients
        if (messageData.sender === 'driver') {
            // Driver sent message - broadcast to admin clients
            broadcastToAdminClients(message);
        } else if (messageData.sender === 'admin') {
            // Admin sent message - broadcast to specific driver
            const targetDriverId = messageData.targetDriverId || messageData.senderId;
            console.log('🎯 Admin message target driver:', targetDriverId);
            broadcastToDriver(targetDriverId, message);
        }
        
        // Store in system messages for logging
        const systemMessage = {
            ...messageData,
            serverTimestamp: new Date().toISOString(),
            processed: true
        };
        
        console.log(`📤 Message relayed: ${messageData.sender} -> ${messageData.sender === 'driver' ? 'admin' : 'driver'}`);
        
    } catch (error) {
        console.error('❌ Error handling chat message:', error);
    }
}

function handleTypingIndicator(senderWs, message) {
    console.log('⌨️ Processing typing indicator:', message);
    
    try {
        // Relay typing indicator to relevant clients
        if (message.sender === 'driver') {
            broadcastToAdminClients(message);
        } else if (message.sender === 'admin' && message.target) {
            broadcastToDriver(message.target, message);
        }
        
    } catch (error) {
        console.error('❌ Error handling typing indicator:', error);
    }
}

function broadcastToAdminClients(message) {
    let adminCount = 0;
    let totalConnections = 0;
    let connectionsWithUserId = 0;
    
    console.log(`🔍 Broadcasting to admin clients among ${clients.size} total clients`);
    
    clients.forEach(client => {
        totalConnections++;
        if (client.readyState === 1) { // WebSocket.OPEN
            if (client.userId) {
                connectionsWithUserId++;
                console.log(`📋 Checking connection: userId=${client.userId}, userType=${client.userType}`);
            }
            
            // Check if client is admin (userType is 'admin' OR userId exists but userType is not 'driver')
            const isAdmin = client.userType === 'admin' || (client.userId && client.userType !== 'driver');
            
            if (isAdmin) {
                try {
                    client.send(JSON.stringify(message));
                    adminCount++;
                    console.log(`📡 Message sent to admin client: ${client.userId}`);
                } catch (error) {
                    console.error('Error sending message to admin client:', error);
                }
            } else {
                console.log(`📋 Skipping non-admin client: userId=${client.userId}, userType=${client.userType}`);
            }
        }
    });
    
    console.log(`📊 Admin broadcast summary: ${adminCount} admin clients reached out of ${totalConnections} total connections`);
    console.log(`📡 Message broadcast to ${adminCount} admin clients`);
}

function broadcastToDriver(driverId, message) {
    let driverFound = false;
    let totalConnections = 0;
    let connectionsWithUserId = 0;
    
    console.log(`🔍 Looking for driver ${driverId} among ${clients.size} total clients`);
    
    clients.forEach(client => {
        totalConnections++;
        if (client.readyState === 1) {
            if (client.userId) {
                connectionsWithUserId++;
                console.log(`📋 Active connection found: userId=${client.userId}, userType=${client.userType}`);
            } else {
                console.log(`📋 Active connection found: userId=undefined, userType=undefined`);
            }
            
            if (client.userId === driverId) {
                try {
                    client.send(JSON.stringify(message));
                    driverFound = true;
                    console.log(`📡 Message sent to driver ${driverId}`);
                } catch (error) {
                    console.error(`Error sending message to driver ${driverId}:`, error);
                }
            }
        }
    });
    
    console.log(`📊 Connection summary: ${totalConnections} total, ${connectionsWithUserId} with userId`);
    
    if (!driverFound) {
        console.log(`⚠️ Driver ${driverId} not connected - message queued for next connection`);
    }
}

function broadcastToClients(message) {
    let broadcastCount = 0;
    
    clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
            try {
                client.send(JSON.stringify(message));
                broadcastCount++;
            } catch (error) {
                console.error('Error broadcasting message to client:', error);
            }
        }
    });
    
    return broadcastCount;
}

// Start server
server.listen(PORT, () => {
    console.log(`
    â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
    â•‘                                                    â•‘
    â•‘   ðŸš› Autonautics Waste Management System          â•‘
    â•‘                                                    â•‘
    â•‘   Server running at: http://localhost:${PORT}        â•‘
    â•‘   Environment: ${process.env.NODE_ENV || 'development'}                      â•‘
    â•‘                                                    â•‘
    â•‘   Press Ctrl+C to stop                            â•‘
    â•‘                                                    â•‘
    â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    `);
    
    console.log('🔌 WebSocket server ready for real-time communication');
    console.log(`👥 Active WebSocket connections: ${clients.size}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\nðŸ“› Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n\nðŸ“› Server terminated');
    process.exit(0);
});

module.exports = app;