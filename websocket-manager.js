// websocket-manager.js - Real-time WebSocket Communication Manager

class WebSocketManager {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second
        this.maxReconnectDelay = 30000; // Max 30 seconds
        this.isConnected = false;
        this.messageQueue = [];
        this.eventListeners = new Map();
        
        this.init();
    }
    
    init() {
        console.log('🔌 Initializing WebSocket Manager...');
        this.connect();
        
        // Set up ping interval to keep connection alive
        this.pingInterval = setInterval(() => {
            if (this.isConnected) {
                this.send({ type: 'ping' });
            }
        }, 30000); // Ping every 30 seconds
    }
    
    getCurrentUser() {
        // Try to get user from different sources
        
        // 1. Check if user is logged in through authManager (admin/management)
        const authUser = window.authManager?.getCurrentUser();
        if (authUser && authUser.id) {
            return authUser;
        }
        
        // 2. Check if this is a driver session
        if (window.currentDriverData) {
            return window.currentDriverData;
        }
        
        // 3. Check localStorage for driver data
        const storedDriver = localStorage.getItem('currentDriver');
        if (storedDriver) {
            try {
                return JSON.parse(storedDriver);
            } catch (error) {
                console.warn('Error parsing stored driver data:', error);
            }
        }
        
        // 4. Check if we can identify from URL or global variables
        if (window.location.pathname.includes('driver') || window.currentUserId) {
            return {
                id: window.currentUserId || 'USR-003', // Fallback to default driver
                type: 'driver',
                name: 'Driver User'
            };
        }
        
        console.warn('⚠️ Could not identify current user for WebSocket connection');
        return null;
    }
    
    updateClientInfo() {
        if (!this.isConnected) {
            console.log('📡 WebSocket not connected, skipping client info update');
            return;
        }
        
        const currentUser = this.getCurrentUser();
        console.log('🔄 updateClientInfo called - Current user:', currentUser);
        
        if (currentUser?.id) {
            console.log('🔄 Updating WebSocket client info - User ID:', currentUser.id, 'Type:', currentUser.type);
            
            const updateInfo = {
                type: 'client_info',
                userAgent: navigator.userAgent,
                timestamp: Date.now(),
                userId: currentUser.id,
                userType: currentUser.type,
                updated: true
            };
            
            console.log('🔄 Sending updated client_info:', updateInfo);
            this.send(updateInfo);
        } else {
            console.log('⏱️ User still not identified, will retry in 3 seconds...');
            setTimeout(() => {
                this.updateClientInfo();
            }, 3000);
        }
    }
    
    connect() {
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/ws`;
            
            console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = this.handleOpen.bind(this);
            this.ws.onmessage = this.handleMessage.bind(this);
            this.ws.onclose = this.handleClose.bind(this);
            this.ws.onerror = this.handleError.bind(this);
            
        } catch (error) {
            console.error('❌ WebSocket connection failed:', error);
            this.scheduleReconnect();
        }
    }
    
    handleOpen() {
        console.log('✅ WebSocket connected successfully');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000; // Reset delay
        
        // Send any queued messages
        this.flushMessageQueue();
        
        // Notify listeners
        this.dispatchEvent('connected', { timestamp: Date.now() });
        
        // Send connection info
        const currentUser = this.getCurrentUser();
        console.log('📡 Sending WebSocket client info - User ID:', currentUser?.id, 'Type:', currentUser?.type);
        console.log('📡 Current user object:', currentUser);
        
        const clientInfo = {
            type: 'client_info',
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
            userId: currentUser?.id,
            userType: currentUser?.type
        };
        
        console.log('📡 Sending client_info message:', clientInfo);
        this.send(clientInfo);
        
        // Set up a periodic check to re-send client info if user data becomes available
        if (!currentUser?.id) {
            console.log('⏱️ User not identified yet, will retry in 3 seconds...');
            setTimeout(() => {
                this.updateClientInfo();
            }, 3000);
        }
    }
    
    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            console.log('📨 WebSocket message received:', data.type);
            
            switch (data.type) {
                case 'driver_update':
                    this.handleDriverUpdate(data);
                    break;
                case 'bin_update':
                    this.handleBinUpdate(data);
                    break;
                case 'route_update':
                    this.handleRouteUpdate(data);
                    break;
                case 'collection_update':
                    this.handleCollectionUpdate(data);
                    break;
                case 'route_completion':
                    this.handleRouteCompletion(data);
                    break;
                case 'chat_message':
                    this.handleChatMessage(data);
                    break;
                case 'typing_indicator':
                    this.handleTypingIndicator(data);
                    break;
                case 'pong':
                    // Connection is alive
                    break;
                default:
                    console.log('🔔 Unknown message type:', data.type);
            }
            
            // Dispatch to custom listeners
            this.dispatchEvent(data.type, data);
            
        } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
        }
    }
    
    handleClose(event) {
        console.log('🔌 WebSocket connection closed:', event.code, event.reason);
        this.isConnected = false;
        
        // Don't reconnect if it was a clean close
        if (event.code !== 1000) {
            this.scheduleReconnect();
        }
        
        // Notify listeners
        this.dispatchEvent('disconnected', { 
            code: event.code, 
            reason: event.reason,
            timestamp: Date.now()
        });
    }
    
    handleError(error) {
        console.error('❌ WebSocket error:', error);
        this.isConnected = false;
    }
    
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ Max reconnection attempts reached');
            return;
        }
        
        this.reconnectAttempts++;
        console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts} in ${this.reconnectDelay}ms`);
        
        setTimeout(() => {
            this.connect();
        }, this.reconnectDelay);
        
        // Exponential backoff
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
    }
    
    send(data) {
        if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
            return true;
        } else {
            // Queue message for later
            this.messageQueue.push(data);
            console.log('📤 Message queued (WebSocket not connected)');
            return false;
        }
    }
    
    flushMessageQueue() {
        if (this.messageQueue.length > 0) {
            console.log(`📤 Sending ${this.messageQueue.length} queued messages`);
            
            while (this.messageQueue.length > 0) {
                const message = this.messageQueue.shift();
                this.send(message);
            }
        }
    }
    
    // Handle real-time driver updates
    handleDriverUpdate(data) {
        console.log('🚛 Real-time driver update received:', data.driverId);
        
        // Update local data
        if (window.dataManager && data.driverData) {
            window.dataManager.updateUser(data.driverData);
        }
        
        // Trigger immediate UI updates
        if (window.mapManager && window.mapManager.map) {
            window.mapManager.updateDriverStatus(data.driverId, data.status);
            window.mapManager.updateDriverDataUI(data.driverId);
        }
        
        // Update monitoring page if active
        if (window.app && window.app.currentSection === 'monitoring') {
            window.app.updateMonitoringStats();
        }
        
        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('driverDataUpdated', {
            detail: {
                driverId: data.driverId,
                status: data.status,
                fuelLevel: data.fuelLevel,
                timestamp: data.timestamp,
                source: 'websocket'
            }
        }));
    }
    
    // Handle real-time bin updates
    handleBinUpdate(data) {
        console.log('🗑️ Real-time bin update received:', data.binId);
        
        // Update local data
        if (window.dataManager && data.binData) {
            const bins = window.dataManager.getBins();
            const binIndex = bins.findIndex(bin => bin.id === data.binId);
            if (binIndex >= 0) {
                bins[binIndex] = { ...bins[binIndex], ...data.binData };
                window.dataManager.saveToStorage('bins');
            }
        }
        
        // Update map
        if (window.mapManager && window.mapManager.map) {
            window.mapManager.updateBinMarker(data.binId);
        }
    }
    
    // Handle real-time route completion updates
    handleRouteCompletion(data) {
        console.log('🏁 Real-time route completion received for driver:', data.driverId);
        
        // Update local driver data
        if (window.dataManager && data.driverData) {
            window.dataManager.updateUser(data.driverData);
        }
        
        // Update map immediately with stationary status
        if (window.mapManager && window.mapManager.map) {
            window.mapManager.updateDriverStatus(data.driverId, 'stationary');
            window.mapManager.updateDriverDataUI(data.driverId);
            window.mapManager.refreshDriverPopup(data.driverId);
        }
        
        // Update monitoring page if active
        if (window.app && window.app.currentSection === 'monitoring') {
            window.app.updateMonitoringStats();
            // Force refresh the live monitoring
            setTimeout(() => {
                window.app.performLiveMonitoringSync();
            }, 100);
        }
        
        // Update driver interface if this is the current user
        const currentUser = window.authManager?.getCurrentUser();
        if (currentUser && currentUser.id === data.driverId && window.driverSystemV3Instance) {
            // Update button state
            window.driverSystemV3Instance.updateStartRouteButton();
        }
        
        // Dispatch custom events
        document.dispatchEvent(new CustomEvent('driverDataUpdated', {
            detail: {
                driverId: data.driverId,
                status: data.status,
                action: 'route_completed',
                timestamp: data.timestamp,
                source: 'websocket'
            }
        }));
        
        document.dispatchEvent(new CustomEvent('routeCompleted', {
            detail: {
                driverId: data.driverId,
                completionTime: data.timestamp,
                source: 'websocket'
            }
        }));
    }

    // Handle real-time route updates
    handleRouteUpdate(data) {
        console.log('🛣️ Real-time route update received:', data.routeId);
        
        // Update local data
        if (window.dataManager && data.routeData) {
            const routes = window.dataManager.getRoutes();
            const routeIndex = routes.findIndex(route => route.id === data.routeId);
            if (routeIndex >= 0) {
                routes[routeIndex] = { ...routes[routeIndex], ...data.routeData };
                window.dataManager.saveToStorage('routes');
            }
        }
        
        // Refresh route displays
        if (window.app && window.app.currentSection === 'fleet') {
            window.app.refreshAllDriverData();
        }
    }
    
    // Handle real-time collection updates
    handleCollectionUpdate(data) {
        console.log('📦 Real-time collection update received');
        
        // Update local data
        if (window.dataManager && data.collectionData) {
            window.dataManager.addCollection(data.collectionData);
        }
        
        // Update analytics if on dashboard
        if (window.app && window.app.currentSection === 'dashboard') {
            if (typeof analyticsManager !== 'undefined') {
                analyticsManager.updateDashboardMetrics();
            }
        }
    }
    
    // Event listener system
    addEventListener(eventType, callback) {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, []);
        }
        this.eventListeners.get(eventType).push(callback);
    }
    
    removeEventListener(eventType, callback) {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }
    
    dispatchEvent(eventType, data) {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in WebSocket event listener for ${eventType}:`, error);
                }
            });
        }
    }
    
    // Get connection status
    getStatus() {
        return {
            connected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            queuedMessages: this.messageQueue.length
        };
    }
    
    // Manual reconnect
    reconnect() {
        if (this.ws) {
            this.ws.close();
        }
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.connect();
    }
    
    // Cleanup
    destroy() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
        }
        
        if (this.ws) {
            this.ws.close(1000, 'Client shutting down');
        }
        
        this.eventListeners.clear();
        this.messageQueue = [];
    }

    // ================== MESSAGING SYSTEM HANDLERS ==================
    
    handleChatMessage(data) {
        console.log('💬 Chat message received:', data);
        
        // Forward to enhanced messaging system if available
        if (window.enhancedMessaging && typeof window.enhancedMessaging.handleWebSocketMessage === 'function') {
            window.enhancedMessaging.handleWebSocketMessage(data);
        }
        
        // Also forward to legacy messaging system for compatibility
        if (window.messagingSystem && typeof window.messagingSystem.handleWebSocketMessage === 'function') {
            window.messagingSystem.handleWebSocketMessage(data);
        }
        
        // Show notification if message is high priority
        if (data.priority === 'high') {
            this.showHighPriorityNotification(data);
        }
    }
    
    handleTypingIndicator(data) {
        console.log('⌨️ Typing indicator:', data);
        
        // Forward to enhanced messaging system if available
        if (window.enhancedMessaging && typeof window.enhancedMessaging.handleWebSocketMessage === 'function') {
            window.enhancedMessaging.handleWebSocketMessage(data);
        }
    }
    
    showHighPriorityNotification(data) {
        try {
            const messageData = data.data;
            if (messageData && messageData.type === 'emergency') {
                // Show urgent notification
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('🚨 EMERGENCY ALERT', {
                        body: `${messageData.senderName}: ${messageData.message.substring(0, 100)}`,
                        icon: '/favicon.ico',
                        tag: 'emergency',
                        requireInteraction: true,
                        vibrate: [300, 100, 300, 100, 300]
                    });
                }
                
                // Also trigger app alert if available
                if (window.app && typeof window.app.showAlert === 'function') {
                    window.app.showAlert('EMERGENCY ALERT', 
                        `${messageData.senderName}: ${messageData.message}`, 
                        'error', 10000);
                }
            }
        } catch (error) {
            console.error('Error showing high priority notification:', error);
        }
    }
}

// Initialize WebSocket manager
let webSocketManager = null;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Delay initialization to ensure other managers are ready
    setTimeout(() => {
        try {
            webSocketManager = new WebSocketManager();
            window.webSocketManager = webSocketManager;
            console.log('✅ WebSocket Manager initialized successfully');
        } catch (error) {
            console.warn('⚠️ WebSocket Manager initialization failed:', error);
            // Continue without WebSocket - system will fall back to polling
        }
    }, 2000);
});

// Export for global access
window.WebSocketManager = WebSocketManager;

// Global function to manually trigger client info update for testing
window.updateWebSocketClientInfo = function() {
    console.log('🔧 Manually triggering WebSocket client info update...');
    if (window.webSocketManager) {
        window.webSocketManager.updateClientInfo();
    } else {
        console.error('❌ WebSocket manager not available');
    }
};

// Global function to check current WebSocket user identification
window.debugWebSocketUser = function() {
    console.log('🔍 WebSocket user identification debug:');
    if (window.webSocketManager) {
        const currentUser = window.webSocketManager.getCurrentUser();
        console.log('  - Current user from WebSocket manager:', currentUser);
        console.log('  - WebSocket connected:', window.webSocketManager.isConnected);
        console.log('  - window.currentDriverData:', window.currentDriverData);
        console.log('  - window.currentUserId:', window.currentUserId);
        console.log('  - localStorage currentDriver:', localStorage.getItem('currentDriver'));
        console.log('  - authManager getCurrentUser:', window.authManager?.getCurrentUser());
    } else {
        console.error('❌ WebSocket manager not available');
    }
};
