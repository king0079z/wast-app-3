// sync-manager.js - Cross-Device Data Synchronization Manager

class SyncManager {
    constructor() {
        this.baseUrl = window.location.origin;
        console.log('🔍 SyncManager baseUrl set to:', this.baseUrl);
        this.syncInterval = null;
        this.isOnline = navigator.onLine;
        this.lastSyncTime = null;
        this.pendingUpdates = [];
        this.syncEnabled = false;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        // NEW: Intelligent sync features
        this.lastDataHash = null;
        this.isSyncing = false;
        this.syncQueue = [];
        this.connectionHealth = 'unknown';
        this.adaptiveInterval = 10000; // Start with 10s, adapt based on activity
        this.lastActivity = Date.now();
        this.quietPeriodThreshold = 60000; // 1 minute of no activity = slower sync
        
        this.init();
    }

    init() {
        console.log('🔄 Initializing Sync Manager...');
        
        // Check if server is available
        this.checkServerConnection().then(isAvailable => {
            if (isAvailable) {
                this.syncEnabled = true;
                console.log('✅ Server sync enabled');
                this.startPeriodicSync();
                this.setupEventListeners();
                
                // Initial sync from server
                this.syncFromServer();
            } else {
                console.log('⚠️ Server not available, using local storage only');
                this.syncEnabled = false;
            }
        });
    }

    async checkServerConnection() {
        try {
            const response = await fetch(`${this.baseUrl}/api/system?action=health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            });
            
            return response.ok;
        } catch (error) {
            console.warn('Server connection check failed:', error.message);
            return false;
        }
    }

    setupEventListeners() {
        // Online/offline detection
        window.addEventListener('online', () => {
            console.log('🌐 Connection restored');
            this.isOnline = true;
            if (this.syncEnabled) {
                this.processPendingUpdates();
                this.syncFromServer();
            }
        });

        window.addEventListener('offline', () => {
            console.log('📡 Connection lost - operating offline');
            this.isOnline = false;
        });

        // Page visibility for sync optimization
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.syncEnabled && this.isOnline) {
                this.syncFromServer();
            }
        });
    }

    startPeriodicSync() {
        // ENHANCED: Intelligent adaptive sync with activity-based intervals
        this.syncInterval = setInterval(() => {
            if (this.isOnline && this.syncEnabled && !this.isSyncing) {
                this.performIntelligentSync();
                
                // ENHANCED: Auto-sync driver locations for manager (more frequent for real-time tracking)
                setTimeout(() => {
                    this.syncDriverLocationsForManager();
                }, 500); // Reduced delay for faster GPS updates
            }
        }, this.adaptiveInterval);
        
        // ✅ CRITICAL FIX: Additional high-frequency location sync for managers
        if (authManager && authManager.getCurrentUser() && authManager.getCurrentUser().type !== 'driver') {
            console.log('🌐 Starting high-frequency driver location sync for manager');
            this.locationSyncInterval = setInterval(() => {
                if (this.isOnline && this.syncEnabled) {
                    this.syncDriverLocationsForManager();
                }
            }, 10000); // Every 10 seconds for real-time tracking
        }
        
        console.log(`🔄 Intelligent periodic sync started (${this.adaptiveInterval/1000}s interval)`);
    }
    
    // NEW: Intelligent sync that adapts to activity levels
    async performIntelligentSync() {
        const now = Date.now();
        const timeSinceLastActivity = now - this.lastActivity;
        
        // Adapt sync interval based on activity
        if (timeSinceLastActivity > this.quietPeriodThreshold) {
            // Quiet period - reduce sync frequency to save resources
            this.adaptiveInterval = 30000; // 30 seconds
        } else {
            // Active period - more frequent syncing
            this.adaptiveInterval = 10000; // 10 seconds
        }
        
        // Restart interval with new frequency if it changed
        if (this.syncInterval) {
            const currentInterval = this.adaptiveInterval;
            clearInterval(this.syncInterval);
            this.syncInterval = setInterval(() => {
                if (this.isOnline && this.syncEnabled && !this.isSyncing) {
                    this.performIntelligentSync();
                    
                    // ENHANCED: Auto-sync driver locations for manager
                    setTimeout(() => {
                        this.syncDriverLocationsForManager();
                    }, 1000); // Slight delay to not overwhelm the server
                }
            }, currentInterval);
        }
        
        // Only sync if data might have changed
        const currentDataHash = this.generateDataHash();
        if (currentDataHash !== this.lastDataHash || !this.lastDataHash) {
            console.log('🎯 Data change detected - performing sync');
            await this.syncFromServer();
            this.lastDataHash = currentDataHash;
        } else {
            console.log('📊 No data changes detected - skipping sync');
        }
    }
    
    // NEW: Generate hash of current data to detect changes
    generateDataHash() {
        try {
            const data = {
                users: dataManager?.users?.length || 0,
                bins: dataManager?.bins?.length || 0,
                routes: dataManager?.routes?.length || 0,
                collections: dataManager?.collections?.length || 0,
                lastUserActivity: this.lastActivity
            };
            return JSON.stringify(data);
        } catch (error) {
            return Date.now().toString(); // Fallback to timestamp
        }
    }
    
    // NEW: Mark activity to influence sync frequency
    markActivity() {
        this.lastActivity = Date.now();
        console.log('🎯 User activity detected - adjusting sync frequency');
    }

    stopPeriodicSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            console.log('⏹️ Periodic sync stopped');
        }
    }

    // Sync all data from server to local
    // Force refresh baseUrl to ensure it's current
    refreshBaseUrl() {
        const newBaseUrl = window.location.origin;
        if (this.baseUrl !== newBaseUrl) {
            console.log('🔄 Updating baseUrl from', this.baseUrl, 'to', newBaseUrl);
            this.baseUrl = newBaseUrl;
        }
    }

    async syncFromServer() {
        if (!this.syncEnabled || !this.isOnline) return;
        
        // ENHANCED: Prevent concurrent syncing
        if (this.isSyncing) {
            console.log('🔄 Sync already in progress - skipping');
            return false;
        }
        
        this.isSyncing = true;
        
        try {
            console.log('📥 Syncing from server...');
            
            // Ensure we're using the current URL
            this.refreshBaseUrl();
            
            // Enhanced connection health check with timeout
            const startTime = Date.now();
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
            
            const response = await fetch(`${this.baseUrl}/api/data/sync`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            const responseTime = Date.now() - startTime;
            this.updateConnectionHealth(response.ok, responseTime);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.success && result.data) {
                let hasChanges = false;
                
                // ENHANCED: Smart merge with change detection
                Object.keys(result.data).forEach(key => {
                    if (result.data[key] !== undefined && key !== 'lastUpdate') {
                        const serverData = result.data[key];
                        const localData = dataManager.getData(key);
                        
                        // Check if data actually changed
                        if (!this.hasDataChanged(key, serverData, localData)) {
                            console.log(`📊 No changes in ${key} - skipping update`);
                            return;
                        }
                        
                        // For users array, merge instead of overwrite to preserve demo accounts
                        if (key === 'users' && Array.isArray(serverData) && Array.isArray(localData)) {
                            if (serverData.length === 0 && localData.length > 0) {
                                console.log(`📝 Preserving local ${key} data (${localData.length} items)`);
                                // Keep local data and upload to server
                                this.syncToServer({ [key]: localData }, 'partial');
                                return;
                            }
                            
                            // Merge users by ID/username
                            const merged = [...localData];
                            serverData.forEach(serverItem => {
                                const existingIndex = merged.findIndex(local => 
                                    local.id === serverItem.id || local.username === serverItem.username
                                );
                                if (existingIndex >= 0) {
                                    merged[existingIndex] = serverItem;
                                } else {
                                    merged.push(serverItem);
                                }
                            });
                            dataManager.setData(key, merged);
                            console.log(`🔄 Merged ${key}: ${merged.length} items`);
                            hasChanges = true;
                        } else {
                            // For other data types, use server data if available
                            if (Array.isArray(serverData) && serverData.length > 0) {
                                dataManager.setData(key, serverData);
                                console.log(`📥 Updated ${key}: ${serverData.length} items`);
                                hasChanges = true;
                            } else if (!Array.isArray(serverData) && serverData !== null) {
                                dataManager.setData(key, serverData);
                                console.log(`📥 Updated ${key}:`, serverData);
                                hasChanges = true;
                                
                                // Debug driver locations specifically
                                if (key === 'driverLocations') {
                                    console.log(`🔍 Driver locations synced from server:`, serverData);
                                    console.log(`💾 Verified in dataManager:`, dataManager.getData(key));
                                    console.log(`📍 Available drivers:`, Object.keys(serverData || {}));
                                    
                                    // Trigger AI recommendation refresh for current driver when locations update
                                    if (window.currentUser && window.currentUser.type === 'driver') {
                                        console.log(`🤖 Refreshing AI recommendations due to location update`);
                                        setTimeout(() => {
                                            if (typeof createAISuggestionForDriver === 'function') {
                                                createAISuggestionForDriver(window.currentUser.id).then(() => {
                                                    if (window.app && typeof window.app.loadAISuggestionForDriver === 'function') {
                                                        window.app.loadAISuggestionForDriver(window.currentUser.id);
                                                    }
                                                }).catch(error => {
                                                    console.error('❌ AI recommendation refresh failed:', error);
                                                });
                                            }
                                        }, 1000); // Small delay to ensure data is fully synced
                                    }
                                }
                            }
                        }
                    }
                });

                this.lastSyncTime = result.timestamp || Date.now();
                this.retryCount = 0;
                
                console.log('✅ Sync from server completed');
                
                // Only trigger UI updates if there were actual changes
                if (hasChanges) {
                    console.log('🎯 Changes detected - triggering UI updates');
                    this.triggerUIUpdates();
                } else {
                    console.log('📊 No changes from server - UI updates skipped');
                }
                
                return true;
            } else {
                throw new Error(result.error || 'Sync failed');
            }
        } catch (error) {
            console.error('❌ Sync from server failed:', error.message);
            this.updateConnectionHealth(false, 0);
            this.handleSyncError();
            return false;
        } finally {
            this.isSyncing = false;
        }
    }
    
    // Enhanced driver location sync for manager
    async syncDriverLocationsForManager() {
        if (!this.syncEnabled || !this.isOnline) return;
        
        // Only fetch locations if user is admin/manager
        if (!authManager || !authManager.getCurrentUser()) return;
        const currentUser = authManager.getCurrentUser();
        if (currentUser.type === 'driver') return; // Don't sync if user is driver
        
        try {
            this.refreshBaseUrl();
            console.log('📍 Manager fetching all driver locations...');
            
            const response = await fetch(`${this.baseUrl}/api/driver/locations`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (response.ok) {
                const locationData = await response.json();
                console.log('📡 Driver locations from server:', locationData);
                
                if (locationData.success && locationData.drivers) {
                    // CRITICAL FIX: Convert driver array to location object format
                    const driverLocationMap = {};
                    locationData.drivers.forEach(driver => {
                        if (driver.location) {
                            driverLocationMap[driver.id] = {
                                lat: driver.location.latitude || driver.location.lat,
                                lng: driver.location.longitude || driver.location.lng,
                                timestamp: driver.lastUpdate || new Date().toISOString(),
                                accuracy: driver.location.accuracy || 10,
                                status: driver.status || 'active'
                            };
                        }
                    });
                    
                    console.log('🔄 Converted driver locations:', driverLocationMap);
                    
                    // Update driver locations in correct format
                    dataManager.setData('driverLocations', driverLocationMap);
                    
                    // Trigger map refresh if map manager exists
                    if (typeof mapManager !== 'undefined' && mapManager.map) {
                        console.log('🗺️ Refreshing driver markers on manager map');
                        mapManager.loadDriversOnMap(); // Use loadDriversOnMap instead of initializeAllDrivers
                    }
                    
                    return true;
                }
            }
        } catch (error) {
            console.error('❌ Failed to sync driver locations for manager:', error);
        }
        
        return false;
    }
    
    // NEW: Enhanced change detection for specific data types
    hasDataChanged(type, serverData, localData) {
        try {
            if (!localData && !serverData) return false;
            if (!localData || !serverData) return true;
            
            // For arrays, compare length and last update times
            if (Array.isArray(serverData) && Array.isArray(localData)) {
                if (serverData.length !== localData.length) return true;
                
                // Compare checksums of important fields
                const serverHash = this.generateArrayHash(serverData);
                const localHash = this.generateArrayHash(localData);
                return serverHash !== localHash;
            }
            
            // For objects, do deep comparison
            return JSON.stringify(serverData) !== JSON.stringify(localData);
        } catch (error) {
            console.warn(`Error comparing ${type} data:`, error);
            return true; // If we can't compare, assume it changed
        }
    }
    
    // NEW: Generate hash for array comparison
    generateArrayHash(arr) {
        return arr.map(item => ({
            id: item.id,
            lastUpdate: item.lastUpdate || item.timestamp,
            checksum: (item.name || '') + (item.status || '') + (item.fuelLevel || '')
        })).sort((a, b) => a.id?.localeCompare(b.id)).map(item => JSON.stringify(item)).join('|');
    }
    
    // NEW: Update connection health metrics
    updateConnectionHealth(success, responseTime) {
        if (success) {
            if (responseTime < 1000) {
                this.connectionHealth = 'excellent';
            } else if (responseTime < 3000) {
                this.connectionHealth = 'good';
            } else {
                this.connectionHealth = 'slow';
            }
        } else {
            this.connectionHealth = 'poor';
        }
        
        // Dispatch connection health event for UI updates
        document.dispatchEvent(new CustomEvent('connectionHealthChanged', {
            detail: { 
                health: this.connectionHealth, 
                responseTime,
                timestamp: Date.now()
            }
        }));
    }

    // Upload local data to server
    async syncToServer(data = null, updateType = 'partial') {
        if (!this.syncEnabled || !this.isOnline) {
            // Add to pending updates if offline
            if (data) {
                this.addToPendingUpdates(data, updateType);
            }
            return false;
        }

        try {
            // Ensure we're using the current URL
            this.refreshBaseUrl();
            
            // If no data provided, get all current data from dataManager
            let syncData = data;
            if (!syncData && typeof dataManager !== 'undefined') {
                console.log('📤 No data provided, syncing all current data...');
                syncData = {
                    users: dataManager.getUsers(),
                    bins: dataManager.getBins(),
                    routes: dataManager.getRoutes(),
                    collections: dataManager.getCollections(),
                    driverLocations: dataManager.getAllDriverLocations(),
                    complaints: dataManager.getComplaints(),
                    alerts: dataManager.getAlerts()
                };
                updateType = 'full';
            }
            
            // If still no data, skip sync
            if (!syncData) {
                console.log('⚠️ No data to sync, skipping...');
                return true;
            }
            
            console.log(`📤 Syncing to server (${updateType})...`);
            
            // Safe JSON serialization to prevent circular references
            let jsonBody;
            try {
                // Reset seen objects for this serialization
                this.seenObjects = new Set();
                
                jsonBody = JSON.stringify({
                    data: syncData,
                    updateType: updateType,
                    timestamp: new Date().toISOString()
                }, this.jsonReplacer.bind(this));
            } catch (jsonError) {
                console.error('❌ JSON serialization error:', jsonError);
                throw new Error(`Failed to serialize data: ${jsonError.message}`);
            }
            
            const response = await fetch(`${this.baseUrl}/api/data/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: jsonBody
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Sync to server completed');
                this.retryCount = 0;
                return true;
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (error) {
            console.error('❌ Sync to server failed:', error.message);
            this.addToPendingUpdates(data, updateType);
            this.handleSyncError();
            return false;
        }
    }

    // Specific sync functions for real-time data

    async syncDriverLocation(driverId, location) {
        if (!this.syncEnabled || !this.isOnline) {
            console.log('📱 Saving location locally (offline)');
            return false;
        }

        try {
            // Ensure we're using the current URL
            this.refreshBaseUrl();
            const response = await fetch(`${this.baseUrl}/api/driver/${driverId}?action=location`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(location)
            });

            const result = await response.json();
            
            if (result.success) {
                console.log(`📍 Location synced for driver ${driverId}`);
                return true;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Location sync failed:', error.message);
            return false;
        }
    }

    async syncRoute(route) {
        if (!this.syncEnabled || !this.isOnline) {
            console.log('📱 Saving route locally (offline)');
            return false;
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/routes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(route)
            });

            const result = await response.json();
            
            if (result.success) {
                console.log(`🛣️ Route synced: ${route.id}`);
                return true;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Route sync failed:', error.message);
            return false;
        }
    }

    async syncCollection(collection) {
        if (!this.syncEnabled || !this.isOnline) {
            console.log('📱 Saving collection locally (offline)');
            return false;
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/collections`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(collection)
            });

            const result = await response.json();
            
            if (result.success) {
                console.log(`🗑️ Collection synced: ${collection.binId}`);
                return true;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Collection sync failed:', error.message);
            return false;
        }
    }

    async getDriverRoutes(driverId) {
        if (!this.syncEnabled || !this.isOnline) {
            return dataManager.getDriverRoutes(driverId);
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/driver/${driverId}?action=routes`);
            const result = await response.json();
            
            if (result.success) {
                console.log(`📋 Routes retrieved for driver ${driverId}: ${result.routes.length}`);
                return result.routes;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Failed to get routes from server, using local data');
            return dataManager.getDriverRoutes(driverId);
        }
    }

    // Pending updates management for offline operations
    addToPendingUpdates(data, updateType) {
        this.pendingUpdates.push({
            data: data,
            updateType: updateType,
            timestamp: new Date().toISOString()
        });
        
        console.log(`📋 Added to pending updates (${this.pendingUpdates.length} pending)`);
    }

    async processPendingUpdates() {
        if (this.pendingUpdates.length === 0) return;

        console.log(`🔄 Processing ${this.pendingUpdates.length} pending updates...`);
        
        const updates = [...this.pendingUpdates];
        this.pendingUpdates = [];

        for (const update of updates) {
            const success = await this.syncToServer(update.data, update.updateType);
            if (!success) {
                // Re-add failed updates
                this.pendingUpdates.push(update);
            }
        }

        if (this.pendingUpdates.length > 0) {
            console.log(`⚠️ ${this.pendingUpdates.length} updates still pending`);
        } else {
            console.log('✅ All pending updates processed');
        }
    }

    handleSyncError() {
        this.retryCount++;
        
        if (this.retryCount >= this.maxRetries) {
            console.log('❌ Max sync retries reached, will retry later');
            this.retryCount = 0;
            
            // Show user notification
            if (window.app) {
                window.app.showAlert(
                    'Sync Warning', 
                    'Unable to sync with server. Operating in offline mode.', 
                    'warning'
                );
            }
        }
    }

    triggerUIUpdates() {
        // Refresh driver routes if driver is logged in
        if (authManager && authManager.isDriver() && window.app) {
            window.app.loadDriverRoutes();
        }

        // Update map if available
        if (typeof mapManager !== 'undefined') {
            mapManager.loadDriversOnMap();
        }

        // Update analytics
        if (typeof analyticsManager !== 'undefined') {
            analyticsManager.updateDashboardMetrics();
        }
    }

    // Full sync for initialization
    async performFullSync() {
        if (!this.syncEnabled) return false;

        console.log('🔄 Performing full sync...');
        
        // First sync from server
        const serverSyncSuccess = await this.syncFromServer();
        
        // Then upload any local changes
        const localData = {
            users: dataManager.getUsers(),
            bins: dataManager.getBins(),
            routes: dataManager.getRoutes(),
            collections: dataManager.getCollections(),
            complaints: dataManager.getComplaints(),
            alerts: dataManager.getAlerts(),
            driverLocations: dataManager.getAllDriverLocations(),
            analytics: dataManager.getAnalytics(),
            binHistory: dataManager.getAllBinHistory(),
            driverHistory: dataManager.getAllDriverHistory()
        };
        
        const uploadSuccess = await this.syncToServer(localData, 'full');
        
        return serverSyncSuccess && uploadSuccess;
    }

    // Get sync status for UI
    getSyncStatus() {
        return {
            enabled: this.syncEnabled,
            online: this.isOnline,
            lastSync: this.lastSyncTime,
            pendingUpdates: this.pendingUpdates.length,
            retryCount: this.retryCount
        };
    }

    // Enable/disable sync
    setEnabled(enabled) {
        this.syncEnabled = enabled;
        
        if (enabled && this.isOnline) {
            this.startPeriodicSync();
            this.syncFromServer();
        } else {
            this.stopPeriodicSync();
        }
        
        console.log(`🔄 Sync ${enabled ? 'enabled' : 'disabled'}`);
    }

    // Cleanup
    // JSON replacer to handle circular references and functions
    jsonReplacer(key, value) {
        // Initialize seenObjects set if not exists
        if (!this.seenObjects) {
            this.seenObjects = new Set();
        }
        
        // Skip functions
        if (typeof value === 'function') {
            return undefined;
        }
        
        // Skip circular references
        if (typeof value === 'object' && value !== null) {
            if (this.seenObjects.has(value)) {
                return '[Circular]';
            }
            this.seenObjects.add(value);
        }
        
        return value;
    }

    destroy() {
        this.stopPeriodicSync();
        this.syncEnabled = false;
        console.log('🗑️ Sync Manager destroyed');
    }
}

// Create global instance
window.syncManager = new SyncManager();

// Integrate with existing data manager
if (typeof dataManager !== 'undefined') {
    // Override methods to include sync
    const originalUpdateDriverLocation = dataManager.updateDriverLocation;
    dataManager.updateDriverLocation = function(driverId, latitude, longitude, additionalData = {}) {
        const result = originalUpdateDriverLocation.call(this, driverId, latitude, longitude, additionalData);
        
        // ✅ FIXED: Validate driver exists before syncing location
        const driver = this.getUserById(driverId);
        if (!driver || driver.type !== 'driver') {
            console.warn(`⚠️ Skipping location sync for non-existent or non-driver user: ${driverId}`);
            return result;
        }
        
        // Sync to server
        if (window.syncManager) {
            window.syncManager.syncDriverLocation(driverId, {
                latitude: latitude,
                longitude: longitude,
                timestamp: new Date().toISOString(),
                ...additionalData
            }).catch(error => {
                console.warn(`⚠️ Location sync failed for ${driverId}, continuing without sync`);
            });
        }
        
        return result;
    };

    const originalAddRoute = dataManager.addRoute;
    dataManager.addRoute = function(route) {
        const result = originalAddRoute.call(this, route);
        
        // Sync to server
        if (window.syncManager) {
            window.syncManager.syncRoute(result);
        }
        
        return result;
    };

    const originalAddCollection = dataManager.addCollection;
    dataManager.addCollection = function(collection) {
        const result = originalAddCollection.call(this, collection);
        
        // Sync to server
        if (window.syncManager) {
            window.syncManager.syncCollection(result);
        }
        
        return result;
    };
}

console.log('🔄 Sync Manager loaded successfully');