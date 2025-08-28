// data-manager.js - Fixed Data Management and Persistence Module

class DataManager {
    constructor() {
        this.storagePrefix = 'waste_mgmt_';
        this.initializeDefaultData();
    }

    // Initialize default data if not exists
    initializeDefaultData() {
        // Check if already initialized
        const isInitialized = this.getData('initialized');
        const users = this.getData('users') || [];
        
        if (!isInitialized || users.length === 0) {
            console.log('🔧 Initializing demo accounts...');
            console.log('Current initialization status:', isInitialized);
            console.log('Current users count:', users.length);
            
            // Initialize demo accounts
            const demoAccounts = [
                { 
                    id: 'USR-001', 
                    username: 'admin', 
                    password: 'admin123', 
                    name: 'Admin User', 
                    type: 'admin', 
                    email: 'admin@autonautics.com', 
                    phone: '+974 1234 5678',
                    status: 'active', 
                    createdAt: new Date().toISOString() 
                },
                { 
                    id: 'USR-002', 
                    username: 'manager1', 
                    password: 'manager123', 
                    name: 'Sarah Manager', 
                    type: 'manager', 
                    email: 'sarah@autonautics.com', 
                    phone: '+974 2345 6789',
                    status: 'active', 
                    createdAt: new Date().toISOString() 
                },
                { 
                    id: 'USR-003', 
                    username: 'driver1', 
                    password: 'driver123', 
                    name: 'John Smith', 
                    type: 'driver', 
                    email: 'john@autonautics.com', 
                    phone: '+974 3456 7890',
                    vehicleId: 'DA130-01', 
                    license: 'DL-12345',
                    status: 'active', 
                    rating: 5.0,
                    createdAt: new Date().toISOString() 
                },
                { 
                    id: 'USR-004', 
                    username: 'driver2', 
                    password: 'driver123', 
                    name: 'Mike Johnson', 
                    type: 'driver', 
                    email: 'mike@autonautics.com', 
                    phone: '+974 4567 8901',
                    vehicleId: 'DA130-02', 
                    license: 'DL-23456',
                    status: 'active', 
                    rating: 4.8,
                    createdAt: new Date().toISOString() 
                }
            ];
            
            // Set the users data with demo accounts
            this.setData('users', demoAccounts);

            // Initialize sample bins with Doha locations
            this.setData('bins', [
                {
                    id: 'DF703-001',
                    location: 'Pearl Qatar Tower A',
                    lat: 25.3682,
                    lng: 51.5511,
                    type: 'paper',
                    capacity: 100,
                    fill: 75,
                    status: 'warning',
                    lastCollection: 'Yesterday',
                    temperature: 28,
                    batteryLevel: 95,
                    signalStrength: -65,
                    sensorStatus: 'active',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'DF703-002',
                    location: 'West Bay Business District',
                    lat: 25.3215,
                    lng: 51.5309,
                    type: 'paper',
                    capacity: 100,
                    fill: 45,
                    status: 'normal',
                    lastCollection: '2 days ago',
                    temperature: 25,
                    batteryLevel: 100,
                    signalStrength: -70,
                    sensorStatus: 'active',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'DF703-003',
                    location: 'Katara Cultural Village',
                    lat: 25.3606,
                    lng: 51.5256,
                    type: 'mixed',
                    capacity: 150,
                    fill: 90,
                    status: 'critical',
                    lastCollection: '3 days ago',
                    temperature: 30,
                    batteryLevel: 88,
                    signalStrength: -72,
                    sensorStatus: 'active',
                    createdAt: new Date().toISOString()
                }
            ]);

            // Initialize sample routes
            this.setData('routes', [
                {
                    id: 'RTE-001',
                    driverId: 'USR-003',
                    binIds: ['DF703-001', 'DF703-003'],
                    status: 'pending',
                    assignedBy: 'USR-002',
                    createdAt: new Date().toISOString()
                }
            ]);

            // Initialize sample complaints
            this.setData('complaints', [
                {
                    id: 'CMP-001',
                    type: 'overflow',
                    location: 'Pearl Qatar Tower B',
                    description: 'Bin is overflowing with paper waste',
                    priority: 'high',
                    email: 'resident@pearl.qa',
                    status: 'open',
                    createdAt: new Date().toISOString()
                }
            ]);

            // Initialize collections
            this.setData('collections', []);
            
            // Initialize alerts
            this.setData('alerts', [
                {
                    id: 'ALT-001',
                    type: 'bin_overflow',
                    message: 'Bin DF703-003 is 90% full',
                    priority: 'high',
                    relatedId: 'DF703-003',
                    timestamp: new Date().toISOString(),
                    status: 'active'
                }
            ]);
            
            // Initialize pending registrations with a sample
            this.setData('pendingRegistrations', [
                {
                    id: 'REG-001',
                    userType: 'driver',
                    name: 'Ahmed Ali',
                    username: 'ahmed_driver',
                    email: 'ahmed@example.com',
                    phone: '+974 5678 9012',
                    password: 'driver123',
                    vehicleId: 'DA130-03',
                    license: 'DL-34567',
                    submittedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                    status: 'pending'
                }
            ]);
            
            // Initialize system logs
            this.setData('systemLogs', [
                {
                    id: 'LOG-001',
                    message: 'System initialized',
                    type: 'info',
                    timestamp: new Date().toISOString()
                }
            ]);
            
            // Initialize driver locations
            this.setData('driverLocations', {
                'USR-003': {
                    lat: 25.2854,
                    lng: 51.5310,
                    timestamp: new Date().toISOString()
                }
            });
            
            // Initialize analytics
            this.setData('analytics', {
                totalCollections: 125,
                totalPaperCollected: 2500,
                totalComplaints: 5,
                avgResponseTime: 25,
                citizenSatisfaction: 85,
                costReduction: 20,
                carbonReduction: 15
            });
            
            this.setData('initialized', true);
            this.addSystemLog('System initialized with default data', 'info');
            console.log('Default data initialized successfully');
        } else {
            console.log('Data already initialized');
            // Ensure demo accounts are always available
            this.ensureDemoAccounts();
        }
    }

    // Ensure demo accounts exist
    ensureDemoAccounts() {
        const users = this.getUsers();
        const demoUsernames = ['admin', 'manager1', 'driver1', 'driver2'];
        const existingUsernames = users.map(u => u.username);
        
        console.log('🔍 Checking demo accounts...');
        console.log('Current users:', users.length);
        console.log('Existing usernames:', existingUsernames);
        console.log('Expected usernames:', demoUsernames);
        
        const demoAccounts = [
            { 
                id: 'USR-001', 
                username: 'admin', 
                password: 'admin123', 
                name: 'Admin User', 
                type: 'admin', 
                email: 'admin@autonautics.com', 
                phone: '+974 1234 5678',
                status: 'active', 
                createdAt: new Date().toISOString() 
            },
            { 
                id: 'USR-002', 
                username: 'manager1', 
                password: 'manager123', 
                name: 'Sarah Manager', 
                type: 'manager', 
                email: 'sarah@autonautics.com', 
                phone: '+974 2345 6789',
                status: 'active', 
                createdAt: new Date().toISOString() 
            },
            { 
                id: 'USR-003', 
                username: 'driver1', 
                password: 'driver123', 
                name: 'John Smith', 
                type: 'driver', 
                email: 'john@autonautics.com', 
                phone: '+974 3456 7890',
                vehicleId: 'DA130-01', 
                license: 'DL-12345',
                status: 'active', 
                rating: 5.0,
                createdAt: new Date().toISOString() 
            },
            { 
                id: 'USR-004', 
                username: 'driver2', 
                password: 'driver123', 
                name: 'Mike Johnson', 
                type: 'driver', 
                email: 'mike@autonautics.com', 
                phone: '+974 4567 8901',
                vehicleId: 'DA130-02', 
                license: 'DL-23456',
                status: 'active', 
                rating: 4.8,
                createdAt: new Date().toISOString() 
            }
        ];
        
        let updated = false;
        demoAccounts.forEach(demo => {
            if (!existingUsernames.includes(demo.username)) {
                users.push(demo);
                updated = true;
                console.log(`Added missing demo account: ${demo.username}`);
            }
        });
        
        if (updated) {
            this.setData('users', users);
            console.log('Demo accounts restored');
        }
    }

    // Generic data operations
    getData(key) {
        try {
            const data = localStorage.getItem(this.storagePrefix + key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting data for key:', key, error);
            return null;
        }
    }

    setData(key, value) {
        try {
            localStorage.setItem(this.storagePrefix + key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error setting data for key:', key, error);
            return false;
        }
    }

    // User Management
    getUsers() {
        return this.getData('users') || [];
    }

    // Get all drivers
    getDrivers() {
        return this.getUsers().filter(u => u.type === 'driver') || [];
    }

    getUserById(userId) {
        const users = this.getUsers();
        return users.find(u => u.id === userId);
    }

    getUserByUsername(username) {
        const users = this.getUsers();
        return users.find(u => u.username === username);
    }

    addUser(user) {
        const users = this.getUsers();
        user.id = user.id || this.generateId('USR');
        user.createdAt = new Date().toISOString();
        user.status = user.status || 'pending';
        users.push(user);
        this.setData('users', users);
        this.addSystemLog(`New user registered: ${user.name}`, 'info');
        console.log('User added:', user);
        return user;
    }

    updateUser(userId, updates) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            this.setData('users', users);
            console.log('📝 User updated locally:', users[index]);
            
            // Also sync to server if it's a driver
            if (users[index].type === 'driver') {
                this.syncDriverToServer(userId, updates);
            }
            
            return users[index];
        }
        console.log('User not found for update:', userId);
        return null;
    }

    // Sync driver data to server
    async syncDriverToServer(driverId, userData) {
        try {
            const response = await fetch(`/api/driver/${driverId}/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Driver data synced to server via dataManager:', result.message);
            } else {
                console.error('❌ Failed to sync driver data to server via dataManager:', response.status);
            }
        } catch (error) {
            console.error('❌ Error syncing driver data to server via dataManager:', error);
        }
    }

    // Bin Management
    getBins() {
        return this.getData('bins') || [];
    }

    getBinById(binId) {
        const bins = this.getBins();
        return bins.find(b => b.id === binId);
    }

    addBin(bin) {
        const bins = this.getBins();
        bin.id = bin.id || this.generateId('BIN');
        bin.createdAt = new Date().toISOString();
        bin.fill = bin.fill || 0;
        bin.status = 'normal';
        bin.lastCollection = 'Never';
        bin.temperature = 25;
        bin.batteryLevel = 100;
        bin.signalStrength = -70;
        bin.sensorStatus = 'active';
        bins.push(bin);
        this.setData('bins', bins);
        this.addSystemLog(`New bin added: ${bin.id} at ${bin.location}`, 'info');
        console.log('Bin added:', bin);
        return bin;
    }

    updateBin(binId, updates) {
        const bins = this.getBins();
        const index = bins.findIndex(b => b.id === binId);
        if (index !== -1) {
            const oldBin = { ...bins[index] };
            bins[index] = { ...bins[index], ...updates, lastUpdated: new Date().toISOString() };
            
            // Add to bin history if this is a significant change
            if (updates.fill !== undefined || updates.lastCollection !== undefined) {
                this.addBinHistoryEntry(binId, {
                    previousFill: oldBin.fill,
                    newFill: bins[index].fill,
                    action: updates.lastCollection ? 'collection' : 'sensor_update',
                    timestamp: new Date().toISOString(),
                    collectedBy: updates.collectedBy || null
                });
            }
            
            // Check for alerts
            if (bins[index].fill >= 85) {
                bins[index].status = 'critical';
                this.addAlert('bin_overflow', `Bin ${binId} is ${bins[index].fill}% full`, 'high', binId);
            } else if (bins[index].fill >= 70) {
                bins[index].status = 'warning';
            } else {
                bins[index].status = 'normal';
            }
            
            // Check temperature
            if (bins[index].temperature > 60) {
                bins[index].status = 'fire-risk';
                this.addAlert('fire_risk', `High temperature detected at bin ${binId}: ${bins[index].temperature}C`, 'critical', binId);
            }
            
            this.setData('bins', bins);
            console.log('Bin updated:', bins[index]);
            return bins[index];
        }
        return null;
    }

    deleteBin(binId) {
        let bins = this.getBins();
        bins = bins.filter(b => b.id !== binId);
        this.setData('bins', bins);
        this.addSystemLog(`Bin removed: ${binId}`, 'warning');
        console.log('Bin deleted:', binId);
    }

    // Route Management
    getRoutes() {
        return this.getData('routes') || [];
    }

    addRoute(route) {
        const routes = this.getRoutes();
        route.id = this.generateId('RTE');
        route.createdAt = new Date().toISOString();
        route.status = route.status || 'pending';
        routes.push(route);
        this.setData('routes', routes);
        console.log('Route added:', route);
        return route;
    }

    updateRoute(routeId, updates) {
        const routes = this.getRoutes();
        const index = routes.findIndex(r => r.id === routeId);
        if (index !== -1) {
            routes[index] = { ...routes[index], ...updates };
            this.setData('routes', routes);
            console.log('Route updated:', routes[index]);
            return routes[index];
        }
        return null;
    }

    getDriverRoutes(driverId) {
        const routes = this.getRoutes();
        const filteredRoutes = routes.filter(r => r.driverId === driverId && r.status !== 'completed');
        console.log(`📋 Found ${filteredRoutes.length} active routes for driver ${driverId} out of ${routes.length} total routes`);
        return filteredRoutes;
    }

    // Bin History Management
    getBinHistory(binId) {
        const allHistory = this.getData('binHistory') || {};
        return allHistory[binId] || [];
    }

    addBinHistoryEntry(binId, entry) {
        const allHistory = this.getData('binHistory') || {};
        if (!allHistory[binId]) {
            allHistory[binId] = [];
        }
        
        entry.id = this.generateId('BH');
        entry.timestamp = entry.timestamp || new Date().toISOString();
        allHistory[binId].unshift(entry); // Add to beginning for newest first
        
        // Keep only last 50 entries per bin
        if (allHistory[binId].length > 50) {
            allHistory[binId] = allHistory[binId].slice(0, 50);
        }
        
        this.setData('binHistory', allHistory);
        console.log(`Bin history entry added for ${binId}:`, entry);
        return entry;
    }

    getAllBinHistory() {
        return this.getData('binHistory') || {};
    }

    // Collection Management
    getCollections() {
        return this.getData('collections') || [];
    }

    addCollection(collection) {
        const collections = this.getCollections();
        collection.id = this.generateId('COL');
        collection.timestamp = new Date().toISOString();
        
        // Get current bin data for better collection recording
        const currentBin = this.getBinById(collection.binId);
        if (currentBin) {
            // Ensure we always have meaningful data
            collection.originalFill = collection.originalFill || currentBin.fill || 75; // Default to 75% if no data
            collection.temperature = collection.temperature || currentBin.temperature || 22; // Default temp
            collection.binLocation = collection.binLocation || currentBin.location;
            collection.weight = collection.weight || Math.round((collection.originalFill * 0.6)); // Estimate weight from fill
        } else {
            // Fallback values if bin not found
            collection.originalFill = collection.originalFill || 75;
            collection.temperature = collection.temperature || 22;
            collection.weight = collection.weight || 45;
        }
        
        collections.push(collection);
        this.setData('collections', collections);
        
        // Update bin and record collection in history
        this.updateBin(collection.binId, { 
            fill: 0, 
            lastCollection: new Date().toLocaleString(),
            collectedBy: collection.driverName || collection.driverId,
            status: 'normal'  // Reset status after collection
        });
        
        // Update analytics
        this.updateAnalytics('collection', collection);
        
        // Add to driver history
        this.addDriverHistoryEntry(collection.driverId, {
            action: 'collection',
            binId: collection.binId,
            binLocation: collection.binLocation,
            weight: collection.weight,
            originalFill: collection.originalFill,
            temperature: collection.temperature,
            timestamp: collection.timestamp,
            vehicleId: collection.vehicleId,
            route: collection.routeId || 'Direct Collection',
            routeName: collection.routeName
        });
        
        this.addSystemLog(`Collection completed: ${collection.binId} by ${collection.driverId}`, 'success');
        console.log('Collection added:', collection);
        return collection;
    }

    getTodayCollections() {
        const collections = this.getCollections();
        const today = new Date().toDateString();
        return collections.filter(c => new Date(c.timestamp).toDateString() === today);
    }

    getDriverCollections(driverId) {
        const collections = this.getCollections();
        return collections.filter(c => c.driverId === driverId);
    }

    // Driver History Management
    getDriverHistory(driverId) {
        const allHistory = this.getData('driverHistory') || {};
        return allHistory[driverId] || [];
    }

    addDriverHistoryEntry(driverId, entry) {
        const allHistory = this.getData('driverHistory') || {};
        if (!allHistory[driverId]) {
            allHistory[driverId] = [];
        }
        
        entry.id = this.generateId('DH');
        entry.timestamp = entry.timestamp || new Date().toISOString();
        allHistory[driverId].unshift(entry); // Add to beginning for newest first
        
        // Keep only last 100 entries per driver
        if (allHistory[driverId].length > 100) {
            allHistory[driverId] = allHistory[driverId].slice(0, 100);
        }
        
        this.setData('driverHistory', allHistory);
        console.log(`Driver history entry added for ${driverId}:`, entry);
        return entry;
    }

    getAllDriverHistory() {
        return this.getData('driverHistory') || {};
    }

    // Complaint Management
    getComplaints() {
        return this.getData('complaints') || [];
    }

    addComplaint(complaint) {
        const complaints = this.getComplaints();
        complaint.id = this.generateId('CMP');
        complaint.createdAt = new Date().toISOString();
        complaint.status = 'open';
        complaints.push(complaint);
        this.setData('complaints', complaints);
        this.addSystemLog(`New complaint: ${complaint.type} at ${complaint.location}`, 'warning');
        console.log('Complaint added:', complaint);
        return complaint;
    }

    updateComplaint(complaintId, updates) {
        const complaints = this.getComplaints();
        const index = complaints.findIndex(c => c.id === complaintId);
        if (index !== -1) {
            complaints[index] = { ...complaints[index], ...updates };
            this.setData('complaints', complaints);
            console.log('Complaint updated:', complaints[index]);
            return complaints[index];
        }
        return null;
    }

    getActiveComplaints() {
        const complaints = this.getComplaints();
        return complaints.filter(c => c.status !== 'resolved');
    }

    // Alert Management
    getAlerts() {
        return this.getData('alerts') || [];
    }

    addAlert(type, message, priority, relatedId = null) {
        const alerts = this.getAlerts();
        const alert = {
            id: this.generateId('ALT'),
            type,
            message,
            priority,
            relatedId,
            timestamp: new Date().toISOString(),
            status: 'active'
        };
        alerts.push(alert);
        this.setData('alerts', alerts);
        console.log('Alert added:', alert);
        return alert;
    }

    getActiveAlerts() {
        const alerts = this.getAlerts();
        return alerts.filter(a => a.status === 'active');
    }

    dismissAlert(alertId) {
        const alerts = this.getAlerts();
        const index = alerts.findIndex(a => a.id === alertId);
        if (index !== -1) {
            alerts[index].status = 'dismissed';
            this.setData('alerts', alerts);
            console.log('Alert dismissed:', alertId);
        }
    }

    // Registration Management - Fixed
    getPendingRegistrations() {
        const registrations = this.getData('pendingRegistrations') || [];
        // Filter out any that have been there too long (optional)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return registrations.filter(r => 
            r.status === 'pending' && 
            new Date(r.submittedAt) > thirtyDaysAgo
        );
    }

    addPendingRegistration(registration) {
        const pending = this.getData('pendingRegistrations') || [];
        registration.id = this.generateId('REG');
        registration.submittedAt = new Date().toISOString();
        registration.status = 'pending';
        pending.push(registration);
        this.setData('pendingRegistrations', pending);
        this.addSystemLog(`New registration pending: ${registration.name} (${registration.userType})`, 'info');
        console.log('Pending registration added:', registration);
        return registration;
    }

    // Enhanced Driver Location Management
    updateDriverLocation(driverId, latitude, longitude, additionalData = {}) {
        const locations = this.getData('driverLocations') || {};
        const previousLocation = locations[driverId];
        
        // Calculate speed if previous location exists
        let speed = 0;
        if (previousLocation) {
            const distance = this.calculateDistance(
                previousLocation.lat, previousLocation.lng,
                latitude, longitude
            );
            const timeDiff = (new Date() - new Date(previousLocation.timestamp)) / 1000 / 3600; // hours
            speed = timeDiff > 0 ? distance / timeDiff : 0; // km/h
        }
        
        locations[driverId] = {
            lat: latitude,
            lng: longitude,
            timestamp: new Date().toISOString(),
            speed: Math.round(speed * 100) / 100, // Round to 2 decimal places
            accuracy: additionalData.accuracy || null,
            heading: additionalData.heading || null,
            altitude: additionalData.altitude || null,
            previousLocation: previousLocation || null
        };
        
        this.setData('driverLocations', locations);
        
        // Update driver status based on movement
        this.updateDriverMovementStatus(driverId, speed);
        
        // Log location update
        this.addSystemLog(`Driver ${driverId} location updated: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (${speed.toFixed(1)} km/h)`, 'info');
        
        return locations[driverId];
    }

    getDriverLocation(driverId) {
        const locations = this.getData('driverLocations') || {};
        return locations[driverId];
    }

    // Set driver location (alias for updateDriverLocation for compatibility)
    setDriverLocation(driverId, locationData) {
        const locations = this.getData('driverLocations') || {};
        
        // If locationData has lat/lng, use updateDriverLocation
        if (locationData.lat && locationData.lng) {
            return this.updateDriverLocation(driverId, locationData.lat, locationData.lng, locationData);
        }
        
        // Otherwise, directly set the location data
        locations[driverId] = {
            ...locationData,
            timestamp: locationData.timestamp || new Date().toISOString(),
            lastUpdate: locationData.lastUpdate || new Date().toISOString()
        };
        
        this.setData('driverLocations', locations);
        
        console.log(`📍 Driver ${driverId} location set:`, locations[driverId]);
        return locations[driverId];
    }

    getAllDriverLocations() {
        return this.getData('driverLocations') || {};
    }

    // Update driver movement status based on speed
    updateDriverMovementStatus(driverId, speed) {
        const users = this.getUsers();
        const driverIndex = users.findIndex(u => u.id === driverId);
        
        if (driverIndex !== -1) {
            const driver = users[driverIndex];
            let movementStatus = 'stationary';
            
            if (speed > 0.5) movementStatus = 'moving';
            if (speed > 30) movementStatus = 'driving';
            if (speed > 80) movementStatus = 'highway';
            
            // Update driver with movement status
            users[driverIndex] = {
                ...driver,
                movementStatus,
                lastSpeed: speed,
                lastLocationUpdate: new Date().toISOString()
            };
            
            this.setData('users', users);
        }
    }

    // Get drivers within a radius of a location
    getDriversNearLocation(lat, lng, radiusKm = 5) {
        const drivers = this.getUsers().filter(u => u.type === 'driver');
        const locations = this.getAllDriverLocations();
        
        return drivers.filter(driver => {
            const location = locations[driver.id];
            if (!location) return false;
            
            const distance = this.calculateDistance(lat, lng, location.lat, location.lng);
            return distance <= radiusKm;
        }).map(driver => ({
            ...driver,
            location: locations[driver.id],
            distance: this.calculateDistance(lat, lng, locations[driver.id].lat, locations[driver.id].lng)
        })).sort((a, b) => a.distance - b.distance);
    }

    // Get driver activity summary
    getDriverActivitySummary(driverId, days = 7) {
        const collections = this.getDriverCollections(driverId);
        const routes = this.getDriverRoutes(driverId);
        const location = this.getDriverLocation(driverId);
        
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const recentCollections = collections.filter(c => new Date(c.timestamp) > cutoffDate);
        
        return {
            driverId,
            totalCollections: recentCollections.length,
            pendingRoutes: routes.length,
            currentLocation: location,
            averageCollectionsPerDay: Math.round((recentCollections.length / days) * 100) / 100,
            lastActive: location ? location.timestamp : null,
            movementStatus: this.getUsers().find(u => u.id === driverId)?.movementStatus || 'unknown'
        };
    }

    // Analytics Management
    getAnalytics() {
        return this.getData('analytics') || {
            totalCollections: 0,
            totalPaperCollected: 0,
            totalComplaints: 0,
            avgResponseTime: 0,
            citizenSatisfaction: 0,
            costReduction: 0,
            carbonReduction: 0
        };
    }

    updateAnalytics(type, data) {
        const analytics = this.getAnalytics();
        
        switch(type) {
            case 'collection':
                analytics.totalCollections++;
                analytics.totalPaperCollected += data.weight || 50;
                break;
            case 'complaint':
                analytics.totalComplaints++;
                break;
            case 'response':
                // Update average response time
                const currentAvg = analytics.avgResponseTime || 0;
                const count = analytics.totalCollections || 1;
                analytics.avgResponseTime = ((currentAvg * count) + data.responseTime) / (count + 1);
                break;
        }
        
        // Calculate derived metrics
        analytics.citizenSatisfaction = Math.min(100, 100 - (analytics.totalComplaints * 2));
        analytics.costReduction = Math.min(50, analytics.totalCollections * 0.02);
        analytics.carbonReduction = Math.min(60, (analytics.totalPaperCollected / 1000) * 2);
        
        this.setData('analytics', analytics);
        return analytics;
    }

    // System Logs
    getSystemLogs() {
        return this.getData('systemLogs') || [];
    }

    addSystemLog(message, type = 'info') {
        const logs = this.getSystemLogs();
        logs.push({
            id: this.generateId('LOG'),
            message,
            type,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 1000 logs
        if (logs.length > 1000) {
            logs.shift();
        }
        
        this.setData('systemLogs', logs);
    }

    // Utility Functions
    generateId(prefix) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `${prefix}-${timestamp}-${random}`;
    }

    clearAllData() {
        console.log('Clearing all data...');
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.storagePrefix)) {
                localStorage.removeItem(key);
            }
        });
        this.initializeDefaultData();
        console.log('All data cleared and reinitialized');
    }
    
    // Fix corrupted user accounts
    fixCorruptedAccounts() {
        console.log('Checking for corrupted accounts...');
        const users = this.getUsers();
        let fixed = false;
        
        users.forEach(user => {
            // Fix invalid status values
            if (!['active', 'inactive', 'pending'].includes(user.status)) {
                console.log(`Fixing corrupted status for ${user.username}: ${user.status} -> active`);
                user.status = 'active';
                fixed = true;
            }
            
            // Ensure required fields exist
            if (!user.type) {
                console.log(`Fixing missing type for ${user.username}`);
                user.type = 'driver'; // Default to driver
                fixed = true;
            }
            
            if (!user.email) {
                console.log(`Adding missing email for ${user.username}`);
                user.email = `${user.username}@autonautics.com`;
                fixed = true;
            }
        });
        
        if (fixed) {
            this.setData('users', users);
            console.log('Corrupted accounts fixed');
        } else {
            console.log('No corrupted accounts found');
        }
        
        return fixed;
    }

    exportData() {
        const data = {};
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.storagePrefix)) {
                const cleanKey = key.replace(this.storagePrefix, '');
                data[cleanKey] = this.getData(cleanKey);
            }
        });
        return data;
    }

    importData(data) {
        Object.keys(data).forEach(key => {
            this.setData(key, data[key]);
        });
        this.addSystemLog('Data imported successfully', 'success');
        console.log('Data imported successfully');
    }

    // Statistics Functions
    getSystemStats() {
        const users = this.getUsers();
        const bins = this.getBins();
        const activeAlerts = this.getActiveAlerts();
        const pendingRegistrations = this.getPendingRegistrations();
        const todayCollections = this.getTodayCollections();
        const activeComplaints = this.getActiveComplaints();
        
        return {
            totalUsers: users.length,
            totalBins: bins.length,
            activeDrivers: users.filter(u => u.type === 'driver' && u.status === 'active').length,
            activeAlerts: activeAlerts.length,
            pendingRegistrations: pendingRegistrations.length,
            todayCollections: todayCollections.length,
            activeComplaints: activeComplaints.length
        };
    }

    // ML Predictions (Simulated)
    predictBinFillTime(binId) {
        const bin = this.getBinById(binId);
        if (!bin) return null;
        
        // Simple prediction based on current fill rate
        const fillRate = Math.random() * 5 + 2; // 2-7% per hour
        const remainingCapacity = 100 - bin.fill;
        const hoursToFull = remainingCapacity / fillRate;
        
        return {
            hoursToFull: Math.round(hoursToFull),
            fillRate: fillRate.toFixed(1),
            optimalCollection: hoursToFull < 6 ? 'Urgent' : hoursToFull < 24 ? 'Today' : 'Tomorrow'
        };
    }

    optimizeRoutes(driverId) {
        const bins = this.getBins();
        const driverLocation = this.getDriverLocation(driverId);
        
        if (!driverLocation) {
            return [];
        }
        
        // Simple optimization: sort by fill level and distance
        const prioritizedBins = bins
            .filter(b => b.fill >= 70)
            .map(bin => {
                const distance = this.calculateDistance(
                    driverLocation.lat,
                    driverLocation.lng,
                    bin.lat,
                    bin.lng
                );
                const priority = (bin.fill / 100) * 0.7 + (1 / (distance + 1)) * 0.3;
                return { ...bin, distance, priority };
            })
            .sort((a, b) => b.priority - a.priority)
            .slice(0, 5);
        
        return prioritizedBins;
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // Driver Route Management
    addDriverRoute(route) {
        const routes = this.getDriverRoutes(route.driverId);
        routes.push(route);
        localStorage.setItem(`driverRoutes_${route.driverId}`, JSON.stringify(routes));
        return route;
    }
    
    updateDriverRoute(routeId, updates) {
        const allRoutes = this.getAllDriverRoutes();
        const route = allRoutes.find(r => r.id === routeId);
        if (route) {
            Object.assign(route, updates);
            const driverRoutes = allRoutes.filter(r => r.driverId === route.driverId);
            localStorage.setItem(`driverRoutes_${route.driverId}`, JSON.stringify(driverRoutes));
        }
        return route;
    }
    
    getAllDriverRoutes() {
        const drivers = this.getUsers().filter(u => u.type === 'driver');
        let allRoutes = [];
        drivers.forEach(driver => {
            const routes = this.getDriverRoutes(driver.id);
            allRoutes = allRoutes.concat(routes);
        });
        return allRoutes;
    }
    
    getDriverRoutesFromStorage(driverId) {
        const stored = localStorage.getItem(`driverRoutes_${driverId}`);
        const routes = stored ? JSON.parse(stored) : [];
        // Filter out completed routes for consistency
        return routes.filter(r => r.status !== 'completed');
    }
    
    addDriverCollection(driverId, binId) {
        const collections = this.getDriverCollections(driverId);
        collections.push({
            binId,
            timestamp: new Date().toISOString(),
            driverId
        });
        localStorage.setItem(`driverCollections_${driverId}`, JSON.stringify(collections));
        return collections;
    }
    
    getDriverCollections(driverId) {
        const stored = localStorage.getItem(`driverCollections_${driverId}`);
        return stored ? JSON.parse(stored) : [];
    }

    // Vehicle Management
    addVehicle(vehicleData) {
        const vehicles = this.getVehicles();
        
        // Check if vehicle ID already exists
        if (vehicles.find(v => v.id === vehicleData.id)) {
            throw new Error(`Vehicle with ID ${vehicleData.id} already exists`);
        }
        
        // Generate unique ID if not provided
        if (!vehicleData.id) {
            vehicleData.id = this.generateId('VEH');
        }
        
        // Set defaults
        const vehicle = {
            ...vehicleData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        vehicles.push(vehicle);
        this.setData('vehicles', vehicles);
        
        this.addSystemLog(`Vehicle ${vehicle.id} registered`, 'success');
        return vehicle;
    }

    getVehicles() {
        return this.getData('vehicles') || [];
    }

    updateVehicle(vehicleId, updates) {
        const vehicles = this.getVehicles();
        const index = vehicles.findIndex(v => v.id === vehicleId);
        
        if (index === -1) {
            throw new Error(`Vehicle ${vehicleId} not found`);
        }
        
        vehicles[index] = {
            ...vehicles[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        this.setData('vehicles', vehicles);
        this.addSystemLog(`Vehicle ${vehicleId} updated`, 'info');
        return vehicles[index];
    }

    removeVehicle(vehicleId) {
        const vehicles = this.getVehicles();
        const index = vehicles.findIndex(v => v.id === vehicleId);
        
        if (index === -1) {
            throw new Error(`Vehicle ${vehicleId} not found`);
        }
        
        const removedVehicle = vehicles.splice(index, 1)[0];
        this.setData('vehicles', vehicles);
        
        this.addSystemLog(`Vehicle ${vehicleId} removed`, 'warning');
        return removedVehicle;
    }

    // Enhanced Bin Management
    removeBin(binId) {
        const bins = this.getBins();
        const index = bins.findIndex(b => b.id === binId);
        
        if (index === -1) {
            throw new Error(`Bin ${binId} not found`);
        }
        
        const removedBin = bins.splice(index, 1)[0];
        this.setData('bins', bins);
        
        // Also remove related data
        const collections = this.getCollections().filter(c => c.binId !== binId);
        this.setData('collections', collections);
        
        const binHistory = this.getData('binHistory') || {};
        delete binHistory[binId];
        this.setData('binHistory', binHistory);
        
        this.addSystemLog(`Bin ${binId} removed`, 'warning');
        return removedBin;
    }

    // Issue Management
    addIssue(issueData) {
        const issues = this.getIssues();
        
        // Generate unique ID if not provided
        if (!issueData.id) {
            issueData.id = this.generateId('ISSUE');
        }
        
        // Set defaults
        const issue = {
            status: 'open',
            priority: 'medium',
            assignedTo: null,
            resolvedAt: null,
            resolution: null,
            ...issueData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        issues.push(issue);
        this.setData('issues', issues);
        
        this.addSystemLog(`Issue ${issue.id} reported: ${issue.type}`, 'warning');
        return issue;
    }

    getIssues() {
        return this.getData('issues') || [];
    }

    updateIssue(issueId, updates) {
        const issues = this.getIssues();
        const index = issues.findIndex(i => i.id === issueId);
        
        if (index === -1) {
            throw new Error(`Issue ${issueId} not found`);
        }
        
        issues[index] = {
            ...issues[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        // If issue is being resolved
        if (updates.status === 'resolved' && !issues[index].resolvedAt) {
            issues[index].resolvedAt = new Date().toISOString();
        }
        
        this.setData('issues', issues);
        this.addSystemLog(`Issue ${issueId} updated`, 'info');
        return issues[index];
    }

    removeIssue(issueId) {
        const issues = this.getIssues();
        const index = issues.findIndex(i => i.id === issueId);
        
        if (index === -1) {
            throw new Error(`Issue ${issueId} not found`);
        }
        
        const removedIssue = issues.splice(index, 1)[0];
        this.setData('issues', issues);
        
        this.addSystemLog(`Issue ${issueId} removed`, 'warning');
        return removedIssue;
    }

    // User Management Enhancement
    removeUser(userId) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === userId);
        
        if (index === -1) {
            throw new Error(`User ${userId} not found`);
        }
        
        const removedUser = users.splice(index, 1)[0];
        this.setData('users', users);
        
        // Clean up related data
        if (removedUser.type === 'driver') {
            // Remove driver from vehicles
            const vehicles = this.getVehicles();
            vehicles.forEach(vehicle => {
                if (vehicle.assignedDriver === userId) {
                    vehicle.assignedDriver = null;
                }
            });
            this.setData('vehicles', vehicles);
            
            // Remove driver history
            const driverHistory = this.getData('driverHistory') || {};
            delete driverHistory[userId];
            this.setData('driverHistory', driverHistory);
        }
        
        this.addSystemLog(`User ${removedUser.username} (${removedUser.type}) removed`, 'warning');
        return removedUser;
    }

    // Error Logging System
    addErrorLog(error, context = {}) {
        const errorLogs = this.getErrorLogs();
        
        // Safe access to authManager
        let currentUser = null;
        try {
            if (typeof window !== 'undefined' && window.authManager && typeof window.authManager.getCurrentUser === 'function') {
                currentUser = window.authManager.getCurrentUser();
            }
        } catch (e) {
            console.warn('Could not get current user for error logging:', e.message);
        }
        
        const errorLog = {
            id: this.generateId('ERR'),
            message: error?.message || (error ? error.toString() : 'Unknown error occurred'),
            stack: error?.stack || 'Stack trace not available',
            context: context || {},
            userId: currentUser?.id || 'unknown',
            userType: currentUser?.type || 'unknown',
            userName: currentUser?.name || 'unknown',
            url: typeof window !== 'undefined' ? window.location.href : 'unknown',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
            timestamp: new Date().toISOString()
        };
        
        errorLogs.push(errorLog);
        
        // Keep only last 500 error logs
        if (errorLogs.length > 500) {
            errorLogs.splice(0, errorLogs.length - 500);
        }
        
        this.setData('errorLogs', errorLogs);
        
        console.error('Error logged:', errorLog);
        return errorLog;
    }

    getErrorLogs() {
        return this.getData('errorLogs') || [];
    }

    clearErrorLogs() {
        this.setData('errorLogs', []);
        this.addSystemLog('Error logs cleared', 'info');
    }

    // Enhanced utility function for export/import
    exportSystemData() {
        return {
            users: this.getUsers(),
            bins: this.getBins(),
            vehicles: this.getVehicles(),
            routes: this.getRoutes(),
            collections: this.getCollections(),
            complaints: this.getComplaints(),
            alerts: this.getAlerts(),
            issues: this.getIssues(),
            binHistory: this.getAllBinHistory(),
            driverHistory: this.getAllDriverHistory(),
            analytics: this.getAnalytics(),
            systemLogs: this.getSystemLogs(),
            errorLogs: this.getErrorLogs(),
            exportedAt: new Date().toISOString(),
            exportedBy: (typeof window !== 'undefined' && window.authManager) ? window.authManager.getCurrentUser()?.id : null
        };
    }
}

// Create global instance
window.dataManager = new DataManager();

// Global error handler
window.addEventListener('error', function(event) {
    if (window.dataManager && typeof window.dataManager.addErrorLog === 'function') {
        window.dataManager.addErrorLog(event.error, {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            type: 'javascript_error'
        });
    } else {
        console.error('Global error (DataManager not available):', event.error);
    }
});

// Promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
    if (window.dataManager && typeof window.dataManager.addErrorLog === 'function') {
        window.dataManager.addErrorLog(event.reason, {
            type: 'unhandled_promise_rejection'
        });
    } else {
        console.error('Unhandled promise rejection (DataManager not available):', event.reason);
    }
});

// Log initialization
console.log('DataManager initialized');

// Utility function to reset demo accounts (can be called from console)
window.resetDemoAccounts = function() {
    console.log('Resetting demo accounts...');
    dataManager.fixCorruptedAccounts();
    dataManager.ensureDemoAccounts();
    console.log('Demo accounts reset successfully!');
    console.log('You can now login with:');
    console.log('Admin: admin / admin123');
    console.log('Manager: manager1 / manager123');  
    console.log('Driver: driver1 / driver123');
};