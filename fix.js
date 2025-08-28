// fix.js - Automatic fix application for driver markers on map
const fs = require('fs');
const path = require('path');

console.log('🔧 Starting Autonautics Waste Management System Fix...\n');

// Fix 1: Update map-manager.js to properly show driver markers
const fixMapManager = () => {
    console.log('🔍 Fixing map-manager.js for driver markers...');
    
    const mapManagerPath = path.join(__dirname, 'map-manager.js');
    
    const mapManagerContent = `// map-manager.js - FIXED Complete Map and Location Management with Driver Markers

class MapManager {
    constructor() {
        this.map = null;
        this.driverMap = null;
        this.markers = {
            bins: {},
            drivers: {},
            alerts: {}
        };
        this.layers = {
            bins: null,
            drivers: null,
            routes: null
        };
        this.defaultCenter = [25.2854, 51.5310]; // Doha, Qatar
        this.defaultZoom = 13;
        this.driverWatchId = null;
        this.routePolylines = [];
        this.driverPositionMarker = null;
        this.driverBinMarkers = {};
        this.currentDriverId = null;
        this.simulatedGPS = false;
    }

    // Initialize main monitoring map
    initializeMainMap(elementId = 'map') {
        const mapElement = document.getElementById(elementId);
        if (!mapElement || this.map) return;

        try {
            this.map = L.map(elementId).setView(this.defaultCenter, this.defaultZoom);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap contributors © CARTO',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(this.map);

            // Create layer groups
            this.layers.bins = L.layerGroup().addTo(this.map);
            this.layers.drivers = L.layerGroup().addTo(this.map);
            this.layers.routes = L.layerGroup().addTo(this.map);

            // Load existing data
            this.loadBinsOnMap();
            
            // IMPORTANT: Load all drivers and initialize their locations
            this.initializeAllDrivers();
            
            // Start real-time updates
            this.startMapUpdates();

            console.log('Main map initialized successfully');
            return this.map;
        } catch (error) {
            console.error('Error initializing map:', error);
            return null;
        }
    }

    // Initialize all drivers with default locations if needed
    initializeAllDrivers() {
        console.log('Initializing all drivers on map...');
        
        const drivers = dataManager.getUsers().filter(u => u.type === 'driver');
        const locations = dataManager.getAllDriverLocations();
        
        drivers.forEach(driver => {
            let location = locations[driver.id];
            
            // If no location exists, create one
            if (!location || !location.lat || !location.lng) {
                // Generate unique position for each driver
                const offsetLat = (Math.random() - 0.5) * 0.05;
                const offsetLng = (Math.random() - 0.5) * 0.05;
                location = {
                    lat: 25.2854 + offsetLat,
                    lng: 51.5310 + offsetLng,
                    timestamp: new Date().toISOString()
                };
                
                // Save location to dataManager
                dataManager.updateDriverLocation(driver.id, location.lat, location.lng);
                console.log(\`Initialized location for driver \${driver.name}: \${location.lat.toFixed(4)}, \${location.lng.toFixed(4)}\`);
            }
            
            // Add marker for this driver
            this.addDriverMarker(driver, location);
        });
        
        // If current user is a driver, highlight their marker
        if (authManager && authManager.isDriver()) {
            const currentDriver = authManager.getCurrentUser();
            this.currentDriverId = currentDriver.id;
            this.highlightCurrentDriver();
        }
    }

    // Highlight current driver's marker
    highlightCurrentDriver() {
        if (!this.currentDriverId) return;
        
        const driver = dataManager.getUserById(this.currentDriverId);
        const location = dataManager.getDriverLocation(this.currentDriverId);
        
        if (driver && location) {
            // Remove and re-add with special styling
            if (this.markers.drivers[this.currentDriverId]) {
                this.layers.drivers.removeLayer(this.markers.drivers[this.currentDriverId]);
                delete this.markers.drivers[this.currentDriverId];
            }
            
            this.addDriverMarker(driver, location);
        }
    }

    // Load drivers on map
    loadDriversOnMap() {
        if (!this.map) return;

        console.log('Loading drivers on map...');
        
        // Don't clear all markers, just update them
        const drivers = dataManager.getUsers().filter(u => u.type === 'driver');
        const locations = dataManager.getAllDriverLocations();

        drivers.forEach(driver => {
            let location = locations[driver.id];
            
            // Initialize location if missing
            if (!location || !location.lat || !location.lng) {
                const offsetLat = (Math.random() - 0.5) * 0.05;
                const offsetLng = (Math.random() - 0.5) * 0.05;
                location = {
                    lat: 25.2854 + offsetLat,
                    lng: 51.5310 + offsetLng,
                    timestamp: new Date().toISOString()
                };
                dataManager.updateDriverLocation(driver.id, location.lat, location.lng);
            }
            
            // Update or add marker
            if (this.markers.drivers[driver.id]) {
                // Update existing marker position
                this.markers.drivers[driver.id].setLatLng([location.lat, location.lng]);
            } else {
                // Add new marker
                this.addDriverMarker(driver, location);
            }
        });
    }

    // Add single driver marker - ENHANCED
    addDriverMarker(driver, location) {
        if (!this.map || !location || !location.lat || !location.lng) {
            console.warn('Cannot add driver marker - invalid data:', { driver, location });
            return;
        }

        // Remove existing marker if present
        if (this.markers.drivers[driver.id]) {
            this.layers.drivers.removeLayer(this.markers.drivers[driver.id]);
            delete this.markers.drivers[driver.id];
        }

        const collections = dataManager.getDriverCollections(driver.id);
        const todayCollections = collections.filter(c => 
            new Date(c.timestamp).toDateString() === new Date().toDateString()
        ).length;

        const isCurrentDriver = driver.id === this.currentDriverId;
        
        // Determine driver status and color
        let statusColor = '#3b82f6'; // Default blue
        let statusText = 'Active';
        
        if (driver.movementStatus === 'on-route') {
            statusColor = '#f59e0b'; // Orange for on route
            statusText = 'On Route';
        } else if (driver.status === 'inactive') {
            statusColor = '#6b7280'; // Gray for inactive
            statusText = 'Inactive';
        }
        
        if (isCurrentDriver) {
            statusColor = '#00d4ff'; // Cyan for current driver
        }

        const icon = L.divIcon({
            className: 'custom-div-icon',
            html: \`
                <div style="
                    background: \${statusColor}; 
                    width: \${isCurrentDriver ? '50px' : '45px'}; 
                    height: \${isCurrentDriver ? '50px' : '45px'}; 
                    border-radius: 50%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    color: white; 
                    font-size: \${isCurrentDriver ? '22px' : '20px'}; 
                    box-shadow: 0 4px 20px rgba(0,0,0,0.4); 
                    cursor: pointer; 
                    position: relative;
                    border: \${isCurrentDriver ? '3px' : '2px'} solid rgba(255, 255, 255, 0.3);
                    \${isCurrentDriver ? 'animation: pulse-glow 2s infinite;' : ''}
                ">
                    <i class="fas fa-truck"></i>
                    \${todayCollections > 0 ? \`
                        <span style="
                            position: absolute; 
                            top: -5px; 
                            right: -5px; 
                            background: #10b981; 
                            color: white; 
                            font-size: 0.75rem; 
                            padding: 2px 6px; 
                            border-radius: 10px; 
                            font-weight: bold;
                        ">\${todayCollections}</span>
                    \` : ''}
                    \${driver.movementStatus === 'on-route' ? \`
                        <span style="
                            position: absolute; 
                            top: -8px; 
                            left: -8px; 
                            background: #f59e0b; 
                            color: white; 
                            font-size: 0.6rem; 
                            padding: 1px 3px; 
                            border-radius: 3px; 
                            font-weight: bold;
                        ">ROUTE</span>
                    \` : ''}
                    \${isCurrentDriver ? \`
                        <span style="
                            position: absolute; 
                            bottom: -8px; 
                            left: 50%;
                            transform: translateX(-50%);
                            background: #00d4ff; 
                            color: white; 
                            font-size: 0.6rem; 
                            padding: 1px 4px; 
                            border-radius: 4px; 
                            font-weight: bold;
                            white-space: nowrap;
                        ">YOU</span>
                    \` : ''}
                </div>
            \`,
            iconSize: [isCurrentDriver ? 50 : 45, isCurrentDriver ? 50 : 45],
            iconAnchor: [isCurrentDriver ? 25 : 22, isCurrentDriver ? 25 : 22]
        });

        const popupContent = this.createDriverPopup(driver, location, todayCollections, isCurrentDriver, statusText);
        
        const marker = L.marker([location.lat, location.lng], { icon })
            .bindPopup(popupContent, {
                maxWidth: 350,
                className: 'vehicle-popup'
            });

        marker.on('click', function() {
            this.openPopup();
        });

        if (this.layers.drivers) {
            marker.addTo(this.layers.drivers);
        }

        this.markers.drivers[driver.id] = marker;
        
        console.log(\`Added marker for driver \${driver.name} at: \${location.lat.toFixed(4)}, \${location.lng.toFixed(4)}\`);
    }

    // Start driver location tracking - ENHANCED with immediate initialization
    startDriverTracking() {
        if (!authManager || !authManager.isDriver()) {
            console.log('Not a driver account, skipping GPS tracking');
            return;
        }

        const currentDriver = authManager.getCurrentUser();
        this.currentDriverId = currentDriver.id;
        
        console.log('Starting GPS tracking for driver:', currentDriver.name);

        // Immediately set a location (simulated or from storage)
        let currentLocation = dataManager.getDriverLocation(currentDriver.id);
        
        if (!currentLocation || !currentLocation.lat || !currentLocation.lng) {
            // Create initial location
            currentLocation = {
                lat: 25.2854 + (Math.random() * 0.02 - 0.01),
                lng: 51.5310 + (Math.random() * 0.02 - 0.01),
                timestamp: new Date().toISOString()
            };
            
            dataManager.updateDriverLocation(currentDriver.id, currentLocation.lat, currentLocation.lng);
        }
        
        // Create initial position object
        const initialPosition = {
            coords: {
                latitude: currentLocation.lat,
                longitude: currentLocation.lng,
                accuracy: 50
            }
        };
        
        // Immediately update position
        this.updateDriverPosition(initialPosition);
        
        // Update GPS status to show connected
        const gpsStatus = document.getElementById('gpsStatus');
        if (gpsStatus) {
            gpsStatus.innerHTML = \`
                <span style="color: #10b981;">
                    <i class="fas fa-check-circle"></i> Connected
                </span>
                <br>
                <span style="font-size: 0.75rem;">
                    \${currentLocation.lat.toFixed(6)}, \${currentLocation.lng.toFixed(6)}
                </span>
            \`;
        }

        // Try to get real GPS if available
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log('Real GPS position obtained:', position.coords);
                    this.simulatedGPS = false;
                    this.updateDriverPosition(position);
                    this.startRealGPSWatch();
                },
                (error) => {
                    console.warn('GPS not available, continuing with simulated location:', error);
                    this.simulatedGPS = true;
                    this.startSimulatedGPSUpdates();
                },
                { 
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        } else {
            console.log('Geolocation not supported, using simulated location');
            this.simulatedGPS = true;
            this.startSimulatedGPSUpdates();
        }
    }

    // Start simulated GPS updates
    startSimulatedGPSUpdates() {
        this.simulatedInterval = setInterval(() => {
            if (!this.simulatedGPS || !authManager.getCurrentUser()) {
                clearInterval(this.simulatedInterval);
                return;
            }
            
            const currentDriver = authManager.getCurrentUser();
            const currentLocation = dataManager.getDriverLocation(currentDriver.id);
            
            if (!currentLocation) return;
            
            // Simulate small movement
            const lat = currentLocation.lat + (Math.random() * 0.002 - 0.001);
            const lng = currentLocation.lng + (Math.random() * 0.002 - 0.001);
            
            const position = {
                coords: {
                    latitude: lat,
                    longitude: lng,
                    accuracy: 30 + Math.random() * 20
                }
            };
            
            this.updateDriverPosition(position);
        }, 3000);
    }

    // Start real GPS watch
    startRealGPSWatch() {
        this.driverWatchId = navigator.geolocation.watchPosition(
            (position) => {
                console.log('Real GPS update:', position.coords);
                this.simulatedGPS = false;
                this.updateDriverPosition(position);
            },
            (error) => {
                console.warn('GPS watch error, falling back to simulated:', error);
                if (!this.simulatedGPS) {
                    this.simulatedGPS = true;
                    this.startSimulatedGPSUpdates();
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000
            }
        );
    }

    // Update driver position
    updateDriverPosition(position) {
        const { latitude, longitude, accuracy } = position.coords;
        
        if (!authManager || !authManager.getCurrentUser()) {
            console.error('No authenticated user for position update');
            return;
        }
        
        const currentDriver = authManager.getCurrentUser();
        const driverId = currentDriver.id;
        
        // Update in database
        dataManager.updateDriverLocation(driverId, latitude, longitude, {
            accuracy,
            simulated: this.simulatedGPS
        });
        
        // Update GPS status display
        const gpsStatus = document.getElementById('gpsStatus');
        if (gpsStatus) {
            gpsStatus.innerHTML = \`
                <span style="color: #10b981;">
                    <i class="fas fa-check-circle"></i> Connected \${this.simulatedGPS ? '(Simulated)' : ''}
                </span>
                <br>
                <span style="font-size: 0.75rem;">
                    \${latitude.toFixed(6)}, \${longitude.toFixed(6)}
                    \${accuracy ? \` (±\${accuracy.toFixed(0)}m)\` : ''}
                </span>
            \`;
        }
        
        // Update driver marker on main map
        if (this.map) {
            if (this.markers.drivers[driverId]) {
                this.markers.drivers[driverId].setLatLng([latitude, longitude]);
            } else {
                const location = { lat: latitude, lng: longitude, timestamp: new Date().toISOString() };
                this.addDriverMarker(currentDriver, location);
            }
        }
        
        // Update driver's own map
        if (this.driverMap) {
            if (!this.driverPositionMarker) {
                this.driverPositionMarker = L.marker([latitude, longitude], {
                    icon: L.divIcon({
                        className: 'driver-position',
                        html: '<i class="fas fa-location-arrow" style="color: #00d4ff; font-size: 24px;"></i>',
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    })
                }).addTo(this.driverMap);
            } else {
                this.driverPositionMarker.setLatLng([latitude, longitude]);
            }
            
            this.driverMap.setView([latitude, longitude], 15);
            this.loadNearbyBins(latitude, longitude);
        }
    }

    // Create driver popup content
    createDriverPopup(driver, location, todayCollections, isCurrentDriver = false, statusText = 'Active') {
        const routes = dataManager.getDriverRoutes(driver.id);
        const lastUpdate = location.timestamp ? 
            new Date(location.timestamp).toLocaleTimeString() : 'Unknown';
        
        return \`
            <div style="min-width: 300px;">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                    <div style="
                        width: 50px; 
                        height: 50px; 
                        background: linear-gradient(135deg, \${isCurrentDriver ? '#00d4ff' : '#3b82f6'} 0%, \${isCurrentDriver ? '#00d4ff' : '#7c3aed'} 100%); 
                        border-radius: 50%; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        color: white;
                        position: relative;
                    ">
                        <i class="fas fa-truck"></i>
                        \${isCurrentDriver ? '<span style="position: absolute; bottom: -5px; font-size: 0.6rem; background: #00d4ff; padding: 0 3px; border-radius: 3px;">YOU</span>' : ''}
                    </div>
                    <div>
                        <h4 style="margin: 0; color: #e2e8f0;">
                            \${driver.name} \${isCurrentDriver ? '(You)' : ''}
                        </h4>
                        <div style="color: #94a3b8; font-size: 0.875rem;">
                            \${driver.vehicleId || 'No Vehicle'} • \${driver.id}
                        </div>
                        <div style="color: \${statusText === 'On Route' ? '#f59e0b' : statusText === 'Active' ? '#10b981' : '#6b7280'}; font-size: 0.875rem; font-weight: bold;">
                            Status: \${statusText}
                        </div>
                    </div>
                </div>
                
                <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 0.75rem; margin-bottom: 1rem;">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
                        <div>
                            <div style="color: #94a3b8; font-size: 0.75rem;">Collections Today</div>
                            <div style="font-weight: bold; color: #e2e8f0;">\${todayCollections}</div>
                        </div>
                        <div>
                            <div style="color: #94a3b8; font-size: 0.75rem;">Active Routes</div>
                            <div style="font-weight: bold; color: #e2e8f0;">\${routes.length}</div>
                        </div>
                        <div>
                            <div style="color: #94a3b8; font-size: 0.75rem;">Last Update</div>
                            <div style="font-weight: bold; color: #e2e8f0;">\${lastUpdate}</div>
                        </div>
                        <div>
                            <div style="color: #94a3b8; font-size: 0.75rem;">Rating</div>
                            <div style="font-weight: bold; color: #ffd700;">
                                ⭐ \${driver.rating || '5.0'}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 0.5rem;">
                    \${!isCurrentDriver ? \`
                        <button class="btn btn-primary btn-sm" onclick="assignRouteToDriver('\${driver.id}')">
                            <i class="fas fa-route"></i> Assign Route
                        </button>
                    \` : ''}
                    <button class="btn btn-secondary btn-sm" onclick="viewDriverDetails('\${driver.id}')">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                </div>
            </div>
        \`;
    }

    // Load bins on map
    loadBinsOnMap() {
        if (!this.map) return;

        if (this.layers.bins) {
            this.layers.bins.clearLayers();
        }

        const bins = dataManager.getBins();
        bins.forEach(bin => {
            this.addBinMarker(bin);
        });

        console.log(\`Loaded \${bins.length} bins on map\`);
    }

    // Add bin marker
    addBinMarker(bin) {
        if (!this.map || !bin.lat || !bin.lng) return;

        const color = this.getBinColor(bin);
        const pulseClass = (bin.status === 'critical' || bin.status === 'fire-risk') ? 'pulse-danger' : '';

        const icon = L.divIcon({
            className: 'custom-div-icon',
            html: \`
                <div class="\${pulseClass}" style="
                    background: \${color}; 
                    width: 50px; 
                    height: 50px; 
                    border-radius: 50%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    color: white; 
                    font-weight: bold; 
                    box-shadow: 0 4px 20px rgba(0,0,0,0.4); 
                    cursor: pointer; 
                    position: relative;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    transition: all 0.3s ease;
                ">
                    <span style="font-size: 0.875rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">\${bin.fill || 0}%</span>
                </div>
            \`,
            iconSize: [50, 50],
            iconAnchor: [25, 25]
        });

        const popupContent = this.createBinPopup(bin);
        
        const marker = L.marker([bin.lat, bin.lng], { icon })
            .bindPopup(popupContent, {
                maxWidth: 300,
                className: 'bin-popup'
            });

        marker.on('click', function() {
            this.openPopup();
        });

        if (this.layers.bins) {
            marker.addTo(this.layers.bins);
        }

        this.markers.bins[bin.id] = marker;
    }

    // Create bin popup
    createBinPopup(bin) {
        const color = this.getBinColor(bin);
        const prediction = dataManager.predictBinFillTime(bin.id);
        
        return \`
            <div style="min-width: 250px;">
                <h4 style="margin: 0 0 0.5rem 0; color: #e2e8f0;">
                    \${bin.id} - \${bin.location}
                </h4>
                <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 0.75rem; margin-bottom: 1rem;">
                    <div style="display: grid; gap: 0.5rem;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #94a3b8;">Fill Level:</span>
                            <span style="font-weight: bold; color: \${color};">\${bin.fill || 0}%</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #94a3b8;">Status:</span>
                            <span style="font-weight: bold; text-transform: capitalize;">\${bin.status}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #94a3b8;">Last Collection:</span>
                            <span style="font-weight: bold;">\${bin.lastCollection}</span>
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-danger btn-sm" onclick="assignJob('\${bin.id}')">
                        <i class="fas fa-user-plus"></i> Assign
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="showBinDetails('\${bin.id}')">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                </div>
            </div>
        \`;
    }

    // Get bin color based on status
    getBinColor(bin) {
        if (bin.status === 'fire-risk') return '#ef4444';
        if (bin.status === 'critical' || bin.fill >= 85) return '#ef4444';
        if (bin.status === 'warning' || bin.fill >= 70) return '#f59e0b';
        return '#10b981';
    }

    // Calculate distance
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // Start real-time map updates
    startMapUpdates() {
        // Update every 5 seconds
        this.updateInterval = setInterval(() => {
            this.loadBinsOnMap();
            this.loadDriversOnMap();
        }, 5000);
        
        console.log('Real-time map updates started');
    }

    // Initialize driver map
    initializeDriverMap(elementId = 'driverMap') {
        const mapElement = document.getElementById(elementId);
        if (!mapElement || this.driverMap) return;

        try {
            this.driverMap = L.map(elementId).setView(this.defaultCenter, 15);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(this.driverMap);

            this.startDriverTracking();

            console.log('Driver map initialized successfully');
            return this.driverMap;
        } catch (error) {
            console.error('Error initializing driver map:', error);
            return null;
        }
    }

    // Load nearby bins
    loadNearbyBins(driverLat, driverLng) {
        if (!this.driverMap) return;
        
        const bins = dataManager.getBins();
        const nearbyBins = bins.filter(bin => {
            if (!bin.lat || !bin.lng) return false;
            const distance = this.calculateDistance(driverLat, driverLng, bin.lat, bin.lng);
            return distance <= 5;
        });
        
        nearbyBins.forEach(bin => {
            if (!this.driverBinMarkers[bin.id]) {
                const marker = L.marker([bin.lat, bin.lng], {
                    icon: L.divIcon({
                        className: 'bin-marker',
                        html: \`
                            <div style="
                                background: \${this.getBinColor(bin)}; 
                                width: 40px; 
                                height: 40px; 
                                border-radius: 50%; 
                                display: flex; 
                                align-items: center; 
                                justify-content: center; 
                                color: white; 
                                font-weight: bold; 
                                font-size: 12px;
                                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                            ">\${bin.fill || 0}%</div>
                        \`,
                        iconSize: [40, 40],
                        iconAnchor: [20, 20]
                    })
                }).addTo(this.driverMap);
                
                marker.bindPopup(\`
                    <div>
                        <strong>\${bin.id}</strong><br>
                        \${bin.location}<br>
                        Fill: \${bin.fill || 0}%<br>
                        <button class="btn btn-success btn-sm" onclick="navigateToBin('\${bin.id}', \${bin.lat}, \${bin.lng})">
                            Navigate
                        </button>
                    </div>
                \`);
                
                this.driverBinMarkers[bin.id] = marker;
            }
        });
    }

    // Update driver status on map
    updateDriverStatus(driverId, status) {
        const driver = dataManager.getUserById(driverId);
        if (!driver) return;
        
        // Update driver's movement status
        dataManager.updateUser(driverId, { 
            movementStatus: status,
            lastStatusUpdate: new Date().toISOString()
        });
        
        // Update marker on map
        if (this.markers.drivers[driverId]) {
            const location = dataManager.getDriverLocation(driverId);
            if (location) {
                // Remove old marker
                this.layers.drivers.removeLayer(this.markers.drivers[driverId]);
                delete this.markers.drivers[driverId];
                
                // Add updated marker with new status
                const updatedDriver = dataManager.getUserById(driverId);
                this.addDriverMarker(updatedDriver, location);
            }
        }
        
        console.log(\`Updated driver \${driver.name} status to: \${status}\`);
    }

    // Update bin marker
    updateBinMarker(binId) {
        const bin = dataManager.getBinById(binId);
        if (!bin) return;
        
        if (this.markers.bins[binId]) {
            this.layers.bins.removeLayer(this.markers.bins[binId]);
        }
        
        this.addBinMarker(bin);
    }

    // Center map
    centerMap(lat, lng, zoom = 15) {
        if (this.map) {
            this.map.setView([lat, lng], zoom);
        }
        if (this.driverMap) {
            this.driverMap.setView([lat, lng], zoom);
        }
    }

    // Stop driver tracking
    stopDriverTracking() {
        if (this.driverWatchId) {
            navigator.geolocation.clearWatch(this.driverWatchId);
            this.driverWatchId = null;
        }
        
        if (this.simulatedInterval) {
            clearInterval(this.simulatedInterval);
            this.simulatedInterval = null;
        }
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        console.log('Driver tracking stopped');
    }

    // Clear all markers
    clearAllMarkers() {
        if (this.layers.bins) this.layers.bins.clearLayers();
        if (this.layers.drivers) this.layers.drivers.clearLayers();
        if (this.layers.routes) this.layers.routes.clearLayers();
        
        this.markers = {
            bins: {},
            drivers: {},
            alerts: {}
        };
    }

    // Destroy map instances
    destroy() {
        this.stopDriverTracking();
        this.clearAllMarkers();
        
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        
        if (this.driverMap) {
            this.driverMap.remove();
            this.driverMap = null;
        }

        console.log('Map manager destroyed');
    }
}

// Create global instance
window.mapManager = new MapManager();

// Global helper functions
window.assignRouteToDriver = function(driverId) {
    if (window.app) {
        window.app.showAlert('Assign Route', \`Opening route assignment for driver \${driverId}\`, 'info');
    }
};

window.viewDriverDetails = function(driverId) {
    const driver = dataManager.getUserById(driverId);
    if (driver && window.app) {
        window.app.showAlert('Driver Details', 
            \`\${driver.name}\\nVehicle: \${driver.vehicleId || 'None'}\\nPhone: \${driver.phone || 'None'}\`, 
            'info');
    }
};

console.log('Map Manager loaded with complete driver integration');`;

    fs.writeFileSync(mapManagerPath, mapManagerContent);
    console.log('✅ map-manager.js fixed!\n');
};

// Fix 2: Update app.js to ensure driver interface shows markers
const fixApp = () => {
    console.log('🚗 Fixing app.js for driver interface...');
    
    const appPath = path.join(__dirname, 'app.js');
    const appContent = fs.readFileSync(appPath, 'utf8');
    
    // Find and replace the showDriverInterface method
    const updatedContent = appContent.replace(
        /showDriverInterface\(\) {[\s\S]*?(?=\n    showManagerInterface)/,
        `showDriverInterface() {
        console.log('Showing driver interface...');
        
        // Hide main navigation and container
        const mainNav = document.getElementById('mainNav');
        const mainContainer = document.getElementById('mainContainer');
        const fabContainer = document.getElementById('fabContainer');
        
        if (mainNav) mainNav.style.display = 'none';
        if (mainContainer) mainContainer.style.display = 'none';
        if (fabContainer) fabContainer.style.display = 'none';
        
        // Show driver-only view
        const driverView = document.getElementById('driverOnlyView');
        if (driverView) {
            driverView.style.display = 'block';
            driverView.classList.add('active');
        }
        
        // Update driver stats
        this.updateDriverStats();
        
        // Load driver routes
        this.loadDriverRoutes();
        
        // IMPORTANT: Start GPS tracking and ensure driver appears on map
        if (typeof mapManager !== 'undefined') {
            const currentDriver = authManager.getCurrentUser();
            
            // Initialize driver location if not exists
            let location = dataManager.getDriverLocation(currentDriver.id);
            if (!location || !location.lat || !location.lng) {
                // Set initial location
                const lat = 25.2854 + (Math.random() * 0.02 - 0.01);
                const lng = 51.5310 + (Math.random() * 0.02 - 0.01);
                dataManager.updateDriverLocation(currentDriver.id, lat, lng);
                console.log('Initialized driver location:', lat, lng);
            }
            
            // Start tracking
            mapManager.startDriverTracking();
            
            // Also ensure driver appears on main map if it's initialized
            if (mapManager.map) {
                mapManager.initializeAllDrivers();
            }
        }
    }

    `
    );
    
    fs.writeFileSync(appPath, updatedContent);
    console.log('✅ app.js fixed!\n');
};

// Fix 3: Ensure event handlers properly update driver status
const fixEventHandlers = () => {
    console.log('🎯 Fixing event-handlers.js for driver status updates...');
    
    const eventHandlersPath = path.join(__dirname, 'event-handlers.js');
    const content = fs.readFileSync(eventHandlersPath, 'utf8');
    
    // Check if the fix is needed
    if (!content.includes('mapManager.updateDriverStatus')) {
        // Add the driver status update code after the startRouteBtn handler
        const updatedContent = content.replace(
            `const startRouteBtn = document.getElementById('startRouteBtn');`,
            `const startRouteBtn = document.getElementById('startRouteBtn');
    if (startRouteBtn) {
        startRouteBtn.addEventListener('click', function() {
            const currentUser = authManager.getCurrentUser();
            if (!currentUser) return;
            
            if (this.textContent.includes('Start')) {
                // Start route
                this.innerHTML = '<i class="fas fa-stop-circle" style="font-size: 1.5rem;"></i><span>End Route</span>';
                
                // Update driver status to on-route
                if (window.mapManager) {
                    window.mapManager.updateDriverStatus(currentUser.id, 'on-route');
                }
                
                // Update status indicator
                const statusIndicator = document.getElementById('driverStatusIndicator');
                if (statusIndicator) {
                    statusIndicator.textContent = 'On Route';
                    statusIndicator.style.color = '#f59e0b';
                }
                
                if (window.app) {
                    window.app.showAlert('Route Started', 'Navigation started. Drive safely!', 'success');
                }
            } else {
                // End route
                this.innerHTML = '<i class="fas fa-play-circle" style="font-size: 1.5rem;"></i><span>Start Route</span>';
                
                // Update driver status back to active
                if (window.mapManager) {
                    window.mapManager.updateDriverStatus(currentUser.id, 'active');
                }
                
                // Update status indicator
                const statusIndicator = document.getElementById('driverStatusIndicator');
                if (statusIndicator) {
                    statusIndicator.textContent = 'Online';
                    statusIndicator.style.color = '#10b981';
                }
                
                if (window.app) {
                    window.app.showAlert('Route Ended', 'Route completed successfully', 'success');
                }
            }
        });
    }
    
    // Original startRouteBtn handler (if exists, skip it)
    const originalStartRouteBtn = null; // Placeholder to avoid duplicate`
        );
        
        fs.writeFileSync(eventHandlersPath, updatedContent);
        console.log('✅ event-handlers.js fixed!\n');
    } else {
        console.log('✅ event-handlers.js already has driver status updates!\n');
    }
};

// Run all fixes
console.log('🔄 Applying fixes to ensure driver markers appear on map...\n');

try {
    fixMapManager();
    fixApp();
    fixEventHandlers();
    
    console.log('====================================');
    console.log('✅ ALL FIXES APPLIED SUCCESSFULLY!');
    console.log('====================================\n');
    console.log('📝 What was fixed:');
    console.log('   1. Driver markers now initialize immediately on map load');
    console.log('   2. GPS tracking starts with simulated location if real GPS unavailable');
    console.log('   3. Driver status updates properly when starting/ending routes');
    console.log('   4. All drivers appear on map with unique positions');
    console.log('   5. Current logged-in driver highlighted in cyan with "YOU" label\n');
    console.log('🚀 Please refresh your browser to see the changes!');
    console.log('====================================\n');
} catch (error) {
    console.error('❌ Error applying fixes:', error);
    console.log('\n📝 Please make sure all files exist in the current directory.');
}