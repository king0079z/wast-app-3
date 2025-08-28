// map-manager.js - FIXED Complete Map and Location Management with Driver Markers

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
        this.initRetryCount = 0;
        this.maxRetries = 5;
    }

    // Initialize main monitoring map
    async initializeMainMap(elementId = 'map') {
        const mapElement = document.getElementById(elementId);
        if (!mapElement) {
            console.error('❌ Map element not found:', elementId);
            return null;
        }
        
        if (this.map) {
            console.log('ℹ️ Map already initialized, skipping...');
            return this.map;
        }

        // Check if container has proper dimensions
        const rect = mapElement.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            // Increment retry counter
            this.initRetryCount++;
            
            if (this.initRetryCount > this.maxRetries) {
                console.warn(`⚠️ Map initialization abandoned after ${this.maxRetries} attempts. Container may not be visible.`);
                this.initRetryCount = 0; // Reset for future attempts
                return null;
            }
            
            console.warn(`⚠️ Map container has invalid dimensions (attempt ${this.initRetryCount}/${this.maxRetries})`, rect);
            
            // Check if the container is actually supposed to be visible
            const containerParent = mapElement.parentElement;
            const isContainerVisible = mapElement.offsetParent !== null || 
                                     (containerParent && containerParent.offsetParent !== null);
            
            if (!isContainerVisible) {
                console.warn('⚠️ Map container or its parent is not visible, skipping initialization');
                this.initRetryCount = 0; // Reset counter since we're not retrying
                return null;
            }
            
            // Try to force container dimensions
            mapElement.style.width = '100%';
            mapElement.style.height = '400px';
            mapElement.style.minHeight = '400px';
            mapElement.style.display = 'block';
            mapElement.style.visibility = 'visible';
            
            // Wait a bit for CSS to apply, then check again
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const newRect = mapElement.getBoundingClientRect();
            if (newRect.width === 0 || newRect.height === 0) {
                console.error(`❌ Cannot fix map container dimensions (attempt ${this.initRetryCount}/${this.maxRetries}):`, newRect);
                
                // Only retry if we haven't exceeded max attempts
                if (this.initRetryCount < this.maxRetries) {
                    setTimeout(() => {
                        console.log(`🔄 Retrying map initialization (${this.initRetryCount + 1}/${this.maxRetries})...`);
                        this.initializeMainMap(elementId).catch(error => {
                            console.error('❌ Map retry failed:', error);
                        });
                    }, 2000); // Increase delay between retries
                } else {
                    console.warn(`⚠️ Map initialization failed after ${this.maxRetries} attempts`);
                    this.initRetryCount = 0; // Reset for future attempts
                }
                
                return null;
            }
            
            console.log('✅ Map container dimensions fixed:', newRect.width, 'x', newRect.height);
        }

        const finalRect = mapElement.getBoundingClientRect();
        console.log('🗺️ Initializing map with container size:', finalRect.width, 'x', finalRect.height);

        try {
            // Create map with better error handling
            this.map = L.map(elementId, {
                center: this.defaultCenter,
                zoom: this.defaultZoom,
                zoomControl: true,
                preferCanvas: false,
                renderer: L.svg()
            });

            // Add tile layer with error handling
            const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap contributors © CARTO',
                subdomains: 'abcd',
                maxZoom: 20,
                errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
            });

            tileLayer.on('tileerror', function(error) {
                console.warn('Tile loading error:', error);
            });

            tileLayer.addTo(this.map);

            // Create layer groups
            this.layers.bins = L.layerGroup().addTo(this.map);
            this.layers.drivers = L.layerGroup().addTo(this.map);
            this.layers.routes = L.layerGroup().addTo(this.map);

            // Add map event listeners
            this.map.on('load', () => {
                console.log('✅ Map tiles loaded successfully');
            });

            this.map.on('error', (error) => {
                console.error('❌ Map error:', error);
            });

            // Force initial size calculation
            setTimeout(() => {
                if (this.map) {
                    this.map.invalidateSize();
                }
            }, 100);

            // Load existing data with delay
            setTimeout(() => {
                this.loadBinsOnMap();
            this.initializeAllDrivers();
            
                // Process any pending driver markers
                this.processPendingDriverMarkers();
                
            this.startMapUpdates();
            }, 200);

            console.log('✅ Map initialized successfully');
            this.initRetryCount = 0; // Reset retry counter on success
            return this.map;
        } catch (error) {
            console.error('❌ Error initializing map:', error);
            this.map = null;
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
                console.log(`Initialized location for driver ${driver.name}: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
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
    
    // Process any driver markers that were queued before map initialization
    processPendingDriverMarkers() {
        if (!this.pendingDriverMarkers || this.pendingDriverMarkers.length === 0) {
            return;
        }
        
        console.log(`📍 Processing ${this.pendingDriverMarkers.length} pending driver markers...`);
        
        this.pendingDriverMarkers.forEach(({ driver, location }) => {
            this.addDriverMarker(driver, location);
        });
        
        // Clear the pending markers
        this.pendingDriverMarkers = [];
        
        console.log('✅ All pending driver markers processed');
    }
    
    // Reset initialization retry counter (useful when changing pages)
    resetRetryCounter() {
        this.initRetryCount = 0;
        console.log('🔄 Map initialization retry counter reset');
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
        // Detailed validation and error reporting
        if (!this.map) {
            console.warn('⚠️ Cannot add driver marker - map not initialized yet, will retry when map is ready');
            
            // Queue this marker to be added when map is ready
            if (!this.pendingDriverMarkers) {
                this.pendingDriverMarkers = [];
            }
            this.pendingDriverMarkers.push({ driver, location });
            
            // Only try to initialize map if we haven't exceeded retry attempts and the element exists
            const mapElement = document.getElementById('map');
            if (mapElement && this.initRetryCount < this.maxRetries) {
                // Check if we're on a page that should show the map (monitoring page)
                const isMonitoringPage = document.querySelector('.monitoring-section, #monitoring, .map-container');
                if (isMonitoringPage) {
                    this.initializeMainMap('map').catch(error => {
                        console.error('❌ Failed to initialize map:', error);
                    });
                } else {
                    console.log('ℹ️ Not on monitoring page, skipping map initialization for driver marker');
                }
            }
            
            return;
        }
        
        if (!driver) {
            console.error('❌ Cannot add driver marker - driver is null/undefined');
            return;
        }
        
        if (!driver.id) {
            console.error('❌ Cannot add driver marker - driver has no ID:', driver);
            return;
        }
        
        if (!location) {
            console.error('❌ Cannot add driver marker - location is null/undefined for driver:', driver.name || driver.id);
            return;
        }
        
        if (!location.lat || !location.lng) {
            console.error('❌ Cannot add driver marker - location missing lat/lng for driver:', driver.name || driver.id, 'Location:', location);
            return;
        }
        
        if (typeof location.lat !== 'number' || typeof location.lng !== 'number') {
            console.error('❌ Cannot add driver marker - lat/lng are not numbers for driver:', driver.name || driver.id, 'Location:', location);
            return;
        }
        
        console.log(`✅ Adding driver marker for ${driver.name || driver.id} at valid location:`, { lat: location.lat, lng: location.lng });

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

        // Enhanced driver status indicators
        const driverMovementStatus = driver.movementStatus || 'stationary';
        let statusIcon = '🚛';
        statusText = ''; // Reuse the statusText variable declared above
        let statusBadgeColor = '#6b7280';
        
        switch(driverMovementStatus) {
            case 'on-route':
                statusIcon = '🚚';
                statusText = 'ON ROUTE';
                statusBadgeColor = '#f59e0b';
                break;
            case 'on-break':
                statusIcon = '☕';
                statusText = 'BREAK';
                statusBadgeColor = '#8b5cf6';
                break;
            case 'off-duty':
                statusIcon = '🛑';
                statusText = 'OFF DUTY';
                statusBadgeColor = '#ef4444';
                break;
            case 'stationary':
            default:
                statusIcon = '🚛';
                statusText = 'READY';
                statusBadgeColor = '#10b981';
                break;
        }

        const icon = L.divIcon({
            className: 'custom-div-icon',
            html: `
                <div style="
                    background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}dd 100%); 
                    width: ${isCurrentDriver ? '55px' : '50px'}; 
                    height: ${isCurrentDriver ? '55px' : '50px'}; 
                    border-radius: 50%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    color: white; 
                    font-size: ${isCurrentDriver ? '24px' : '22px'}; 
                    box-shadow: 0 6px 25px rgba(0,0,0,0.4); 
                    cursor: pointer; 
                    position: relative;
                    border: ${isCurrentDriver ? '3px' : '2px'} solid rgba(255, 255, 255, 0.4);
                    ${isCurrentDriver ? 'animation: pulse-glow 2s infinite;' : ''}
                    overflow: hidden;
                ">
                    <!-- Status glow effect -->
                    <div style="
                        position: absolute;
                        top: 0; left: 0; right: 0; bottom: 0;
                        border-radius: 50%;
                        background: radial-gradient(circle, ${statusBadgeColor}30 0%, transparent 70%);
                        ${driverMovementStatus === 'on-route' ? 'animation: pulse 1.5s infinite;' : ''}
                    "></div>
                    
                    <!-- Main icon -->
                    <span style="
                        font-size: ${isCurrentDriver ? '26px' : '24px'}; 
                        z-index: 2;
                        position: relative;
                        text-shadow: 0 2px 6px rgba(0,0,0,0.5);
                    ">${statusIcon}</span>
                    
                    <!-- Collections count badge -->
                    ${todayCollections > 0 ? `
                        <span style="
                            position: absolute; 
                            top: -8px; 
                            right: -8px; 
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                            color: white; 
                            font-size: 0.75rem; 
                            padding: 3px 7px; 
                            border-radius: 12px; 
                            font-weight: bold;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                            z-index: 3;
                        ">${todayCollections}</span>
                    ` : ''}
                    
                    <!-- Status badge -->
                        <span style="
                            position: absolute; 
                        top: -10px; 
                        left: -5px; 
                        background: linear-gradient(135deg, ${statusBadgeColor} 0%, ${statusBadgeColor}dd 100%); 
                            color: white; 
                            font-size: 0.6rem; 
                        padding: 2px 6px; 
                        border-radius: 8px; 
                            font-weight: bold;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                        z-index: 3;
                        white-space: nowrap;
                    ">${statusText}</span>
                    
                    <!-- Current user indicator -->
                    ${isCurrentDriver ? `
                        <span style="
                            position: absolute; 
                            bottom: -10px; 
                            left: 50%;
                            transform: translateX(-50%);
                            background: linear-gradient(135deg, #00d4ff 0%, #0ea5e9 100%); 
                            color: white; 
                            font-size: 0.65rem; 
                            padding: 2px 8px; 
                            border-radius: 10px; 
                            font-weight: bold;
                            white-space: nowrap;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                            z-index: 3;
                        ">YOU</span>
                    ` : ''}
                    
                    <!-- Fuel level indicator -->
                    ${driver.fuelLevel !== undefined ? `
                        <div style="
                            position: absolute;
                            bottom: 3px;
                            right: 3px;
                            width: 12px;
                            height: 12px;
                            border-radius: 50%;
                            background: ${(driver.fuelLevel || 75) > 50 ? '#10b981' : (driver.fuelLevel || 75) > 25 ? '#f59e0b' : '#ef4444'};
                            border: 1px solid rgba(255,255,255,0.5);
                            z-index: 3;
                        "></div>
                    ` : ''}
                </div>
            `,
            iconSize: [isCurrentDriver ? 55 : 50, isCurrentDriver ? 55 : 50],
            iconAnchor: [isCurrentDriver ? 27 : 25, isCurrentDriver ? 27 : 25]
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
        
        console.log(`Added marker for driver ${driver.name} at: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
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
            gpsStatus.innerHTML = `
                <span style="color: #10b981;">
                    <i class="fas fa-check-circle"></i> Connected
                </span>
                <br>
                <span style="font-size: 0.75rem;">
                    ${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}
                </span>
            `;
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
            gpsStatus.innerHTML = `
                <span style="color: #10b981;">
                    <i class="fas fa-check-circle"></i> Connected ${this.simulatedGPS ? '(Simulated)' : ''}
                </span>
                <br>
                <span style="font-size: 0.75rem;">
                    ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
                    ${accuracy ? ` (±${accuracy.toFixed(0)}m)` : ''}
                </span>
            `;
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

    // Create driver popup content - ENHANCED VERSION WITH REAL-TIME DATA
    createDriverPopup(driver, location, todayCollections, isCurrentDriver = false, statusText = 'Active') {
        
        // Get real-time data
        const routes = dataManager.getRoutes();
        const activeRoutes = routes.filter(r => r.driverId === driver.id && r.status !== 'completed').length;
        const activeRoute = routes.find(r => r.driverId === driver.id && r.status === 'in-progress');
        
        // Get fuel level from multiple sources (Driver System V3 priority)
        let fuelLevel = 75; // Default
        if (driver.fuelLevel !== undefined) {
            fuelLevel = driver.fuelLevel; // From Driver System V3 updates
        } else {
            const fuelData = dataManager.getData('driverFuelLevels') || {};
            fuelLevel = fuelData[driver.id] || 75;
        }
        
        // Determine real-time status with enhanced logic (Driver System V3 priority)
        let driverStatus = { text: 'Active', color: '#10b981' };
        
        // Check driver movement status first (updated by Driver System V3)
        if (driver.movementStatus === 'on-route') {
            driverStatus = { text: 'On Route', color: '#f59e0b' };
        } else if (driver.movementStatus === 'stationary') {
            driverStatus = { text: 'Stationary', color: '#6b7280' };
        } else if (activeRoute) {
            driverStatus = { text: 'On Route', color: '#f59e0b' };
        } else {
            // Enhanced driver location checking
            const driverLocation = dataManager.getDriverLocation(driver.id);
            console.log(`🔍 Checking status for driver ${driver.id}:`, { driverLocation, driver });
            
            let lastUpdate = null;
            
            // Check multiple timestamp fields
            if (driverLocation) {
                if (driverLocation.lastUpdate) {
                    lastUpdate = new Date(driverLocation.lastUpdate);
                } else if (driverLocation.timestamp) {
                    lastUpdate = new Date(driverLocation.timestamp);
                } else if (location && location.timestamp) {
                    lastUpdate = new Date(location.timestamp);
                }
            }
            
            const now = new Date();
            
            // If no location data at all, create default location for active drivers
            if (!driverLocation && driver.status !== 'inactive') {
                console.log(`📍 Creating default location for active driver: ${driver.name}`);
                const defaultLocation = {
                    lat: 25.2858 + (Math.random() - 0.5) * 0.01, // Small random offset
                    lng: 51.5264 + (Math.random() - 0.5) * 0.01,
                    timestamp: new Date().toISOString(),
                    lastUpdate: new Date().toISOString(),
                    status: 'active'
                };
                
                dataManager.setDriverLocation(driver.id, defaultLocation);
                driverStatus = { text: 'Active', color: '#10b981' };
            } else if (lastUpdate) {
                const timeDiff = now - lastUpdate;
                console.log(`⏰ Time since last update for ${driver.name}: ${Math.round(timeDiff / 60000)} minutes`);
                
                if (timeDiff < 3600000) { // Less than 1 hour
                    driverStatus = { text: 'Active', color: '#10b981' };
                } else if (timeDiff < 14400000) { // Less than 4 hours
                    driverStatus = { text: 'On Break', color: '#f59e0b' };
                } else {
                    driverStatus = { text: 'Offline', color: '#6b7280' };
                }
            } else {
                // No timestamp available, use driver's general status
                if (driver.status === 'inactive') {
                    driverStatus = { text: 'Offline', color: '#6b7280' };
                } else {
                    // Default to active for drivers without location data
                    driverStatus = { text: 'Active', color: '#10b981' };
                }
            }
        }
        
        // Format last update time
        let lastUpdateText = 'Never';
        if (location && location.timestamp) {
            const updateTime = new Date(location.timestamp);
            const now = new Date();
            const diffMinutes = Math.floor((now - updateTime) / 60000);
            
            if (diffMinutes < 1) {
                lastUpdateText = 'Just now';
            } else if (diffMinutes < 60) {
                lastUpdateText = `${diffMinutes} min ago`;
            } else if (diffMinutes < 1440) {
                lastUpdateText = `${Math.floor(diffMinutes/60)}h ago`;
            } else {
                lastUpdateText = updateTime.toLocaleDateString();
            }
        }
        
        return `
            <div style="min-width: 380px; background: linear-gradient(145deg, rgba(15, 23, 42, 0.97) 0%, rgba(30, 41, 59, 0.97) 100%); border-radius: 20px; padding: 0; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4); backdrop-filter: blur(20px); border: 2px solid rgba(59, 130, 246, 0.3); overflow: hidden;">
                
                <!-- Animated Header -->
                <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(99, 102, 241, 0.2) 50%, rgba(139, 92, 246, 0.3) 100%); padding: 1.5rem; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%); animation: shimmer 3s ease-in-out infinite;"></div>
                    
                    <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="
                            width: 70px; 
                            height: 70px; 
                            background: linear-gradient(135deg, ${isCurrentDriver ? '#00d4ff' : '#3b82f6'} 0%, ${isCurrentDriver ? '#0ea5e9' : '#7c3aed'} 100%); 
                        border-radius: 50%; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        color: white;
                        position: relative;
                            box-shadow: 0 10px 30px rgba(59, 130, 246, 0.5);
                            font-size: 1.75rem;
                            font-weight: bold;
                            animation: avatarPulse 3s ease-in-out infinite;
                    ">
                            ${driver.name.split(' ').map(n => n[0]).join('')}
                            ${isCurrentDriver ? '<span style="position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%); font-size: 0.65rem; background: linear-gradient(135deg, #00d4ff 0%, #0ea5e9 100%); padding: 3px 8px; border-radius: 6px; white-space: nowrap; box-shadow: 0 4px 12px rgba(0, 212, 255, 0.4);">YOU</span>' : ''}
                            <div style="position: absolute; top: -6px; right: -6px; width: 20px; height: 20px; background: ${driverStatus.color}; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); animation: statusPulse 2s infinite;"></div>
                    </div>
                        <div style="flex: 1;">
                            <h3 style="margin: 0 0 0.5rem 0; color: #f1f5f9; font-size: 1.35rem; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                                ${driver.name}
                            </h3>
                            <div style="color: #cbd5e1; font-size: 0.9rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-truck" style="color: #60a5fa;"></i>${driver.vehicleId || 'No Vehicle'} • 
                                <i class="fas fa-id-badge" style="color: #60a5fa;"></i>${driver.id}
                        </div>
                            <div style="color: ${driverStatus.color}; font-size: 0.9rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                                <i class="fas fa-circle" style="font-size: 0.7rem; animation: statusPulse 2s infinite;"></i>
                                ${driverStatus.text}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Enhanced Stats Grid -->
                <div style="padding: 1.5rem;">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
                        <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%); padding: 1.2rem; border-radius: 16px; border: 1px solid rgba(16, 185, 129, 0.3); text-align: center; transition: transform 0.3s ease; position: relative; overflow: hidden;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                            <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent 0%, #10b981 50%, transparent 100%); animation: shimmer 2s ease-in-out infinite;"></div>
                            <div style="color: #6ee7b7; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.5rem; letter-spacing: 0.5px;">COLLECTIONS TODAY</div>
                            <div style="color: #f1f5f9; font-size: 1.8rem; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${todayCollections}</div>
                        </div>
                        <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(180, 83, 9, 0.1) 100%); padding: 1.2rem; border-radius: 16px; border: 1px solid rgba(245, 158, 11, 0.3); text-align: center; transition: transform 0.3s ease; position: relative; overflow: hidden;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                            <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent 0%, #f59e0b 50%, transparent 100%); animation: shimmer 2s ease-in-out infinite;"></div>
                            <div style="color: #fcd34d; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.5rem; letter-spacing: 0.5px;">ACTIVE ROUTES</div>
                            <div style="color: #f1f5f9; font-size: 1.8rem; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${activeRoutes}</div>
                        </div>
                        <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.1) 100%); padding: 1.2rem; border-radius: 16px; border: 1px solid rgba(139, 92, 246, 0.3); text-align: center; transition: transform 0.3s ease; position: relative; overflow: hidden;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                            <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent 0%, #8b5cf6 50%, transparent 100%); animation: shimmer 2s ease-in-out infinite;"></div>
                            <div style="color: #c4b5fd; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.5rem; letter-spacing: 0.5px;">FUEL LEVEL</div>
                            <div style="color: #f1f5f9; font-size: 1.8rem; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${fuelLevel}%</div>
                        </div>
                        <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%); padding: 1.2rem; border-radius: 16px; border: 1px solid rgba(59, 130, 246, 0.3); text-align: center; transition: transform 0.3s ease; position: relative; overflow: hidden;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                            <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent 0%, #3b82f6 50%, transparent 100%); animation: shimmer 2s ease-in-out infinite;"></div>
                            <div style="color: #93c5fd; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.5rem; letter-spacing: 0.5px;">LAST UPDATE</div>
                            <div style="color: #f1f5f9; font-size: 1.1rem; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${lastUpdateText}</div>
                    </div>
                </div>
                
                    <!-- Action Buttons -->
                    <div style="display: flex; gap: 1rem;">
                    ${!isCurrentDriver ? `
                            <button onclick="window.assignRouteToDriver('${driver.id}')" style="
                                flex: 1;
                                background: linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%);
                                color: white;
                                border: none;
                                padding: 1rem 1.25rem;
                                border-radius: 16px;
                                font-size: 0.9rem;
                                font-weight: 700;
                                cursor: pointer;
                                transition: all 0.3s ease;
                                box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
                                position: relative;
                                overflow: hidden;
                                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                            " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 12px 35px rgba(59, 130, 246, 0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 25px rgba(59, 130, 246, 0.4)'">
                                <i class="fas fa-brain" style="margin-right: 0.5rem;"></i>🤖 Smart Assign
                        </button>
                    ` : ''}
                        <button onclick="window.viewDriverDetails('${driver.id}')" style="
                            flex: 1;
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                            color: white;
                            border: none;
                            padding: 1rem 1.25rem;
                            border-radius: 16px;
                            font-size: 0.9rem;
                            font-weight: 700;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
                            position: relative;
                            overflow: hidden;
                            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 12px 35px rgba(16, 185, 129, 0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 25px rgba(16, 185, 129, 0.4)'">
                            <i class="fas fa-chart-line" style="margin-right: 0.5rem;"></i>Full Details & History
                    </button>
                </div>
            </div>
            </div>
            <style>
                @keyframes statusPulse {
                    0%, 100% { opacity: 0.6; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.1); }
                }
                @keyframes avatarPulse {
                    0%, 100% { transform: scale(1); box-shadow: 0 10px 30px rgba(59, 130, 246, 0.5); }
                    50% { transform: scale(1.05); box-shadow: 0 15px 40px rgba(59, 130, 246, 0.7); }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            </style>
        `;
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

        console.log(`Loaded ${bins.length} bins on map`);
    }

    // Add bin marker with enhanced visual fill level indication
    addBinMarker(bin) {
        if (!this.map || !bin.lat || !bin.lng) return;

        const fillLevel = bin.fill || 0;
        const color = this.getBinColor(bin);
        const pulseClass = (bin.status === 'critical' || bin.status === 'fire-risk') ? 'pulse-danger' : '';
        
        // Calculate fill height for visual indicator
        const fillHeight = Math.max(10, (fillLevel / 100) * 40); // Min 10px, max 40px
        const emptyHeight = 40 - fillHeight;
        
        // Status icon based on fill level
        let statusIcon = '🗑️';
        if (fillLevel >= 90) statusIcon = '🚨';
        else if (fillLevel >= 75) statusIcon = '⚠️';
        else if (fillLevel <= 25) statusIcon = '✅';

        const icon = L.divIcon({
            className: 'custom-div-icon',
            html: `
                <div class="${pulseClass}" style="
                    width: 55px; 
                    height: 55px; 
                    border-radius: 50%; 
                    display: flex; 
                    flex-direction: column;
                    align-items: center; 
                    justify-content: center; 
                    color: white; 
                    font-weight: bold; 
                    box-shadow: 0 6px 25px rgba(0,0,0,0.4); 
                    cursor: pointer; 
                    position: relative;
                    border: 3px solid rgba(255, 255, 255, 0.4);
                    transition: all 0.3s ease;
                    background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, ${color} 100%);
                    overflow: hidden;
                ">
                    <!-- Fill Level Visual Indicator -->
                    <div style="
                        position: absolute;
                        bottom: 3px;
                        left: 3px;
                        right: 3px;
                        height: ${fillHeight}px;
                        background: linear-gradient(180deg, ${color} 0%, rgba(255,255,255,0.2) 100%);
                        border-radius: 0 0 25px 25px;
                        transition: height 0.3s ease;
                        z-index: 1;
                    "></div>
                    
                    <!-- Content -->
                    <div style="
                        position: relative;
                        z-index: 2;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        text-shadow: 0 2px 6px rgba(0,0,0,0.8);
                    ">
                        <span style="font-size: 1.2rem; margin-bottom: -2px;">${statusIcon}</span>
                        <span style="font-size: 0.75rem; font-weight: bold;">${fillLevel}%</span>
                    </div>
                    
                    <!-- Glow effect for high priority -->
                    ${fillLevel >= 85 ? `
                        <div style="
                            position: absolute;
                            top: -2px; left: -2px; right: -2px; bottom: -2px;
                            border-radius: 50%;
                            background: radial-gradient(circle, ${color}40 0%, transparent 70%);
                            animation: pulse 2s infinite;
                            z-index: 0;
                        "></div>
                    ` : ''}
                </div>
            `,
            iconSize: [55, 55],
            iconAnchor: [27, 27]
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
        
        return `
            <div style="min-width: 250px;">
                <h4 style="margin: 0 0 0.5rem 0; color: #e2e8f0;">
                    ${bin.id} - ${bin.location}
                </h4>
                <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 0.75rem; margin-bottom: 1rem;">
                    <div style="display: grid; gap: 0.5rem;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #94a3b8;">Fill Level:</span>
                            <span style="font-weight: bold; color: ${color};">${bin.fill || 0}%</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #94a3b8;">Status:</span>
                            <span style="font-weight: bold; text-transform: capitalize;">${bin.status}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #94a3b8;">Last Collection:</span>
                            <span style="font-weight: bold;">${bin.lastCollection}</span>
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-danger btn-sm" onclick="assignJob('${bin.id}')">
                        <i class="fas fa-user-plus"></i> Assign
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="showBinDetails('${bin.id}')">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                </div>
            </div>
        `;
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
                        html: `
                            <div style="
                                background: ${this.getBinColor(bin)}; 
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
                            ">${bin.fill || 0}%</div>
                        `,
                        iconSize: [40, 40],
                        iconAnchor: [20, 20]
                    })
                }).addTo(this.driverMap);
                
                marker.bindPopup(`
                    <div>
                        <strong>${bin.id}</strong><br>
                        ${bin.location}<br>
                        Fill: ${bin.fill || 0}%<br>
                        <button class="btn btn-success btn-sm" onclick="navigateToBin('${bin.id}', ${bin.lat}, ${bin.lng})">
                            Navigate
                        </button>
                    </div>
                `);
                
                this.driverBinMarkers[bin.id] = marker;
            }
        });
    }

    // Update driver status on map - ENHANCED WITH POPUP REFRESH
    updateDriverStatus(driverId, status) {
        console.log(`Updating driver ${driverId} status to: ${status}`);
        
        const driver = dataManager.getUserById(driverId);
        if (!driver) {
            console.error('Driver not found:', driverId);
            return;
        }
        
        // Update driver's movement status in dataManager
        driver.movementStatus = status;
        driver.lastStatusUpdate = new Date().toISOString();
        dataManager.updateUser(driverId, { 
            movementStatus: status,
            lastStatusUpdate: new Date().toISOString()
        });
        
        // Force update the driver's location timestamp
        let location = dataManager.getDriverLocation(driverId);
        
        // Validate and fix location data
        if (!location || !location.lat || !location.lng) {
            console.warn(`⚠️ Invalid location for driver ${driverId}, creating default location`);
            // Create default location in Doha
            location = {
                lat: 25.2854 + (Math.random() * 0.01 - 0.005), // Small random offset
                lng: 51.5310 + (Math.random() * 0.01 - 0.005),
                timestamp: new Date().toISOString(),
                status: status || 'active'
            };
            
            // Save the default location
            dataManager.setDriverLocation(driverId, location);
        } else {
            // Update existing location timestamp and status
            location.timestamp = new Date().toISOString();
            location.status = status || location.status || 'active';
            dataManager.updateDriverLocation(driverId, location.lat, location.lng, location);
        }
        
        // Remove and recreate marker with new status
        if (this.markers.drivers[driverId] && this.layers.drivers) {
            this.layers.drivers.removeLayer(this.markers.drivers[driverId]);
            delete this.markers.drivers[driverId];
        }
        
        // Recreate marker with updated status - ensure location is valid
        if (location && location.lat && location.lng) {
            console.log(`📍 Adding driver marker for ${driver.name} at ${location.lat}, ${location.lng}`);
            this.addDriverMarker(driver, location);
        } else {
            console.error(`❌ Cannot create marker - invalid location for driver ${driver.name}:`, location);
        }
        
        console.log(`Driver ${driver.name} status updated to: ${status}`);
    }

    // NEW: Refresh driver popup content with live data
    refreshDriverPopup(driverId) {
        const marker = this.markers.drivers[driverId];
        if (!marker) {
            console.log(`No marker found for driver ${driverId}`);
            return;
        }

        const driver = dataManager.getUserById(driverId);
        if (!driver) {
            console.error('Driver not found for popup refresh:', driverId);
            return;
        }

        const location = dataManager.getDriverLocation(driverId);
        if (!location) {
            console.warn('No location found for driver popup refresh:', driverId);
            return;
        }

        // Get fresh data for popup
        const todayCollections = dataManager.getTodayCollections().filter(c => c.driverId === driverId).length;
        const isCurrentDriver = window.authManager && window.authManager.getCurrentUser()?.id === driverId;
        
        // Generate fresh popup content
        const newPopupContent = this.createDriverPopup(driver, location, todayCollections, isCurrentDriver);
        
        // Update the popup content
        marker.setPopupContent(newPopupContent);
        
        console.log(`🔄 Refreshed popup content for driver ${driver.name}`);
    }

    // NEW: Update all driver-related UI components
    updateDriverDataUI(driverId) {
        console.log(`🔄 Updating all UI components for driver ${driverId}`);
        
        // 1. Refresh map popup
        this.refreshDriverPopup(driverId);
        
        // 2. Refresh Driver Details modal if it's open for this driver
        if (window.currentDriverDetailsId === driverId) {
            const driver = dataManager.getUserById(driverId);
            if (driver && typeof populateDriverDetailsModal === 'function') {
                console.log('🔄 Refreshing Driver Details modal');
                populateDriverDetailsModal(driver);
            }
        }
        
        // 3. Trigger fleet management refresh if visible
        if (window.app && window.app.currentSection === 'fleet') {
            setTimeout(() => {
                if (window.app.refreshAllDriverData) {
                    window.app.refreshAllDriverData();
                }
            }, 100);
        }
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
    console.log('🚛 Opening enhanced route assignment for driver:', driverId);
    
    try {
        const driver = dataManager.getUserById(driverId);
        if (!driver) {
            console.error('❌ Driver not found:', driverId);
    if (window.app) {
                window.app.showAlert('Error', 'Driver not found', 'error');
            }
            return;
        }

        // Get driver location
        const driverLocation = dataManager.getDriverLocation(driverId);
        
        if (!driverLocation || !driverLocation.lat || !driverLocation.lng) {
            console.warn('⚠️ Driver location not available, using default location');
            // Use default location in Doha
            const defaultLocation = {
                lat: 25.2858,
                lng: 51.5264,
                lastUpdate: new Date().toISOString()
            };
            
            // Set default location for driver
            dataManager.setDriverLocation(driverId, defaultLocation);
            window.assignRouteToDriver(driverId); // Retry with default location
            return;
        }

        // Get available bins that need collection
        const bins = dataManager.getBins();
        const routes = dataManager.getRoutes();
        
        // Filter bins that are not already assigned to active routes
        const assignedBinIds = new Set();
        routes.forEach(route => {
            if (route.status !== 'completed' && route.status !== 'cancelled') {
                (route.bins || []).forEach(binId => assignedBinIds.add(binId));
            }
        });

        const availableBins = bins
            .filter(bin => !assignedBinIds.has(bin.id) && (bin.fill || 0) >= 25) // Not assigned and has some fill
            .map(bin => {
                const distance = dataManager.calculateDistance(
                    driverLocation.lat, driverLocation.lng,
                    bin.lat || 25.3682, bin.lng || 51.5511
                );
                
                // Enhanced AI Priority Score: fill level + urgency + distance
                const fillScore = (bin.fill || 0) / 100;
                const urgencyScore = getUrgencyScore(bin);
                const distanceScore = 1 / (distance + 0.1);
                const priorityScore = (fillScore * 0.4) + (urgencyScore * 0.4) + (distanceScore * 0.2);
                
                return {
                    ...bin,
                    distance: Math.round(distance * 100) / 100,
                    priorityScore: priorityScore,
                    estimatedTime: Math.ceil(distance * 2 + 10) // Travel time + collection time
                };
            })
            .sort((a, b) => b.priorityScore - a.priorityScore) // Sort by AI priority
            .slice(0, 15); // Take top 15 for variety

        console.log(`📦 Found ${availableBins.length} available bins for assignment`);

        if (availableBins.length === 0) {
            if (window.app) {
                window.app.showAlert('No Bins Available', 
                    'No bins currently need collection or all bins are already assigned to other drivers.', 
                    'info');
            }
            return;
        }

        console.log('🔍 Debug info:', {
            showRouteAssignmentModal: typeof showRouteAssignmentModal,
            modalElement: document.getElementById('routeAssignmentModal') ? 'EXISTS' : 'NOT FOUND',
            binModalManager: typeof window.binModalManager,
            availableBinsCount: availableBins.length
        });

        // Check if showRouteAssignmentModal function exists
        if (typeof showRouteAssignmentModal === 'function') {
            console.log('✅ Calling showRouteAssignmentModal with:', {
                driver: driver.name,
                binsCount: availableBins.length,
                location: driverLocation
            });
            
            showRouteAssignmentModal(driver, availableBins, driverLocation);
            
            console.log('✅ showRouteAssignmentModal called successfully');
        
        // Refresh driver data after showing modal
        if (typeof window.refreshAllDriverData === 'function') {
            setTimeout(() => {
                window.refreshAllDriverData();
            }, 1000);
        }
        } else {
            console.error('❌ showRouteAssignmentModal function not found');
            console.log('🔍 Available functions:', Object.keys(window).filter(key => key.includes('Modal')));
            
            if (window.app) {
                window.app.showAlert('System Error', 
                    'Route assignment feature is not available. Please refresh the page.', 
                    'error');
            }
        }
        
    } catch (error) {
        console.error('❌ Error in assignRouteToDriver:', error);
        if (window.app) {
            window.app.showAlert('Assignment Error', 
                `Failed to open route assignment: ${error.message}`, 'error');
        }
    }
};

// Helper function for urgency scoring
function getUrgencyScore(bin) {
    const fill = bin.fill || 0;
    if (fill >= 90) return 1.0; // Critical
    if (fill >= 75) return 0.8; // High
    if (fill >= 50) return 0.6; // Medium
    if (fill >= 25) return 0.4; // Low
    return 0.2; // Very low
}

window.viewDriverDetails = function(driverId) {
    console.log('👤 Opening comprehensive driver details for:', driverId);
    
    if (typeof showDriverDetailsModal === 'function') {
        showDriverDetailsModal(driverId);
    } else {
        // Fallback to old behavior if modal function not available
    const driver = dataManager.getUserById(driverId);
    if (driver && window.app) {
        window.app.showAlert('Driver Details', 
            `${driver.name}\nVehicle: ${driver.vehicleId || 'None'}\nPhone: ${driver.phone || 'None'}`, 
            'info');
        }
    }
};

// Route Assignment Modal Function
window.showRouteAssignmentModal = function(driver, availableBins, driverLocation) {
    console.log('🎯 Showing route assignment modal for:', driver.name);
    console.log('📦 Available bins:', availableBins.length);
    console.log('📍 Driver location:', driverLocation);
    
    // Store data globally for modal functions
    window.selectedDriverForRoute = driver.id;
    window.selectedBinsForRoute = [];
    window.recommendedBinsForRoute = availableBins.slice(0, 5).map(b => b.id);
    
    // Populate driver info
    const driverInfo = document.getElementById('routeAssignmentDriverInfo');
    if (driverInfo) {
        driverInfo.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div class="driver-avatar" style="
                    width: 60px; 
                    height: 60px; 
                    background: linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%); 
                    border-radius: 50%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    color: white; 
                    font-weight: bold; 
                    font-size: 1.25rem;
                ">${driver.name.split(' ').map(n => n[0]).join('')}</div>
                <div>
                    <div style="font-weight: bold; font-size: 1.125rem; color: #e2e8f0;">${driver.name}</div>
                    <div style="color: #94a3b8; margin-top: 0.25rem;">
                        <i class="fas fa-truck"></i> Vehicle: ${driver.vehicleId || 'Not Assigned'} • 
                        <i class="fas fa-id-badge"></i> ID: ${driver.id}
                    </div>
                    <div style="color: #94a3b8; margin-top: 0.25rem;">
                        <i class="fas fa-map-marker-alt"></i> Current Location: ${driverLocation.lat.toFixed(4)}, ${driverLocation.lng.toFixed(4)}
                    </div>
                    <div style="color: #10b981; margin-top: 0.25rem; font-weight: bold;">
                        <i class="fas fa-check-circle"></i> Available for Assignment
                    </div>
                </div>
            </div>
        `;
    }
    
    // Show AI recommendation
    if (availableBins.length > 0) {
        const recommendation = document.getElementById('routeAIRecommendation');
        const text = document.getElementById('routeRecommendationText');
        if (recommendation && text) {
            const topBins = availableBins.slice(0, 3);
            const avgDistance = (topBins.reduce((sum, bin) => sum + bin.distance, 0) / topBins.length).toFixed(1);
            
            text.innerHTML = `
                <strong>AI Recommends:</strong> ${topBins.map(b => b.id).join(', ')} 
                - High priority bins within ${avgDistance}km (Estimated time: ${Math.ceil(avgDistance * 3)} mins)
            `;
            recommendation.style.display = 'flex';
        }
    }
    
    // Load available bins
    const binsList = document.getElementById('availableBinsList');
    if (binsList) {
        binsList.innerHTML = availableBins.map((bin, index) => {
            const priorityColor = bin.fill >= 85 ? '#ef4444' : bin.fill >= 70 ? '#f59e0b' : '#10b981';
            const isRecommended = index < 5; // Top 5 are recommended
            const priorityText = bin.fill >= 85 ? 'URGENT' : bin.fill >= 70 ? 'HIGH' : 'MEDIUM';
            
            return `
                <div class="bin-selection-card" data-bin-id="${bin.id}" style="
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid ${isRecommended ? 'rgba(0, 212, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)'};
                    border-radius: 12px;
                    padding: 1rem;
                    margin-bottom: 0.75rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    position: relative;
                " onclick="toggleBinSelection('${bin.id}')">
                    ${isRecommended ? `
                        <div style="
                            position: absolute;
                            top: -8px;
                            right: 10px;
                            background: linear-gradient(135deg, #00d4ff 0%, #0ea5e9 100%);
                            color: white;
                            padding: 2px 8px;
                            border-radius: 10px;
                            font-size: 0.75rem;
                            font-weight: bold;
                        ">
                            ⭐ AI RECOMMENDED
                        </div>
                    ` : ''}
                    
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; font-size: 1.1rem; color: #e2e8f0;">
                                ${bin.id}
                                <span style="
                                    margin-left: 0.5rem;
                                    padding: 2px 8px;
                                    background: ${priorityColor};
                                    color: white;
                                    border-radius: 12px;
                                    font-size: 0.75rem;
                                    font-weight: bold;
                                ">${priorityText}</span>
                            </div>
                            <div style="color: #94a3b8; font-size: 0.875rem; margin-top: 0.25rem;">
                                <i class="fas fa-map-marker-alt"></i> ${bin.location}
                            </div>
                            
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-top: 0.75rem;">
                                <div style="text-align: center; background: rgba(0, 0, 0, 0.2); padding: 0.5rem; border-radius: 6px;">
                                    <div style="color: ${priorityColor}; font-weight: bold; font-size: 1.1rem;">
                                        ${bin.fill}%
                                    </div>
                                    <div style="color: #94a3b8; font-size: 0.75rem;">Fill Level</div>
                                </div>
                                <div style="text-align: center; background: rgba(0, 0, 0, 0.2); padding: 0.5rem; border-radius: 6px;">
                                    <div style="color: #3b82f6; font-weight: bold; font-size: 1.1rem;">
                                        ${bin.distance.toFixed(1)} km
                                    </div>
                                    <div style="color: #94a3b8; font-size: 0.75rem;">Distance</div>
                                </div>
                                <div style="text-align: center; background: rgba(0, 0, 0, 0.2); padding: 0.5rem; border-radius: 6px;">
                                    <div style="color: #10b981; font-weight: bold; font-size: 1.1rem;">
                                        ${bin.estimatedTime}m
                                    </div>
                                    <div style="color: #94a3b8; font-size: 0.75rem;">ETA</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bin-checkbox" style="
                            width: 30px;
                            height: 30px;
                            border: 2px solid rgba(255, 255, 255, 0.3);
                            border-radius: 6px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin-left: 1rem;
                        ">
                            <i class="fas fa-check" style="display: none; color: #10b981; font-size: 1.2rem;"></i>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Reset selected bins list
    if (typeof updateSelectedBinsList === 'function') {
        updateSelectedBinsList();
    } else {
        // Initialize selected bins list if function doesn't exist
        const selectedList = document.getElementById('selectedBinsList');
        if (selectedList) {
            selectedList.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 1rem;">No bins selected yet</p>';
        }
    }
    
    // Show the modal
    const modal = document.getElementById('routeAssignmentModal');
    if (modal) {
        modal.style.display = 'block';
        console.log('✅ Route assignment modal displayed');
        
        // Debug: Log which elements were found/not found
        const driverInfo = document.getElementById('routeAssignmentDriverInfo');
        const binsList = document.getElementById('availableBinsList');
        const selectedList = document.getElementById('selectedBinsList');
        const recommendation = document.getElementById('routeAIRecommendation');
        
        console.log('🔍 Modal elements check:');
        console.log('  - Driver Info:', driverInfo ? '✅ FOUND' : '❌ NOT FOUND');
        console.log('  - Bins List:', binsList ? '✅ FOUND' : '❌ NOT FOUND');
        console.log('  - Selected List:', selectedList ? '✅ FOUND' : '❌ NOT FOUND');
        console.log('  - AI Recommendation:', recommendation ? '✅ FOUND' : '❌ NOT FOUND');
    } else {
        console.error('❌ Route assignment modal not found in DOM');
        
        // Fallback: show a simple alert with bin list
        const binList = availableBins.slice(0, 5).map(bin => 
            `${bin.id} (${bin.fill}%, ${bin.distance.toFixed(1)}km)`
        ).join('\n');
        
        if (window.app) {
            window.app.showAlert(
                'Available Bins for ' + driver.name, 
                'Top recommended bins:\n' + binList + '\n\nModal not available - using fallback display.', 
                'info', 
                8000
            );
        }
        
        // Also create a simple assignment function as emergency fallback
        window.quickAssignBin = function(binId) {
            const bin = dataManager.getBinById(binId);
            if (bin && driver) {
                // Use the bin modal manager for assignment
                if (typeof binModalManager !== 'undefined') {
                    binModalManager.currentBin = bin;
                    binModalManager.selectedDriver = driver;
                    binModalManager.confirmAssignment();
                    console.log('🚀 Emergency assignment completed via binModalManager');
                } else {
                    console.error('❌ No assignment method available');
                }
            }
        };
        
        console.log('💡 Emergency assignment function created: quickAssignBin(binId)');
    }
};

// Route Assignment Modal Functions
window.toggleBinSelection = function(binId) {
    console.log('Toggle bin selection:', binId);
    
    if (!window.selectedBinsForRoute) {
        window.selectedBinsForRoute = [];
    }
    
    const binCard = document.querySelector(`[data-bin-id="${binId}"]`);
    const checkIcon = binCard?.querySelector('.fas.fa-check');
    
    if (window.selectedBinsForRoute.includes(binId)) {
        // Deselect bin
        window.selectedBinsForRoute = window.selectedBinsForRoute.filter(id => id !== binId);
        if (binCard) {
            binCard.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            binCard.style.background = 'rgba(255, 255, 255, 0.05)';
        }
        if (checkIcon) {
            checkIcon.style.display = 'none';
        }
    } else {
        // Select bin
        window.selectedBinsForRoute.push(binId);
        if (binCard) {
            binCard.style.border = '2px solid #10b981';
            binCard.style.background = 'rgba(16, 185, 129, 0.1)';
        }
        if (checkIcon) {
            checkIcon.style.display = 'block';
        }
    }
    
    updateSelectedBinsList();
};

window.updateSelectedBinsList = function() {
    const selectedList = document.getElementById('selectedBinsList');
    if (!selectedList) return;
    
    if (!window.selectedBinsForRoute || window.selectedBinsForRoute.length === 0) {
        selectedList.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 1rem;">No bins selected yet</p>';
        return;
    }
    
    const bins = dataManager.getBins();
    const selectedBins = bins.filter(bin => window.selectedBinsForRoute.includes(bin.id));
    
    selectedList.innerHTML = selectedBins.map(bin => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: rgba(16, 185, 129, 0.1); border-radius: 8px; margin-bottom: 0.5rem;">
            <div>
                <strong>${bin.id}</strong> - ${bin.location}<br>
                <small style="color: #6b7280;">${bin.fill}% full</small>
            </div>
            <button onclick="toggleBinSelection('${bin.id}')" style="background: #ef4444; color: white; border: none; border-radius: 4px; padding: 0.25rem 0.5rem; cursor: pointer;">
                Remove
            </button>
        </div>
    `).join('');
};

window.confirmRouteAssignment = function() {
    console.log('Confirming route assignment');
    
    if (!window.selectedDriverForRoute || !window.selectedBinsForRoute || window.selectedBinsForRoute.length === 0) {
        if (window.app) {
            window.app.showAlert('Selection Required', 'Please select at least one bin to assign.', 'warning');
        }
        return;
    }
    
    const driver = dataManager.getUserById(window.selectedDriverForRoute);
    const bins = dataManager.getBins().filter(bin => window.selectedBinsForRoute.includes(bin.id));
    
    if (!driver || bins.length === 0) {
        if (window.app) {
            window.app.showAlert('Error', 'Invalid driver or bin selection.', 'danger');
        }
        return;
    }
    
    // Create route with multiple bins
    const priority = Math.max(...bins.map(bin => bin.fill)) >= 85 ? 'high' : 
                    Math.max(...bins.map(bin => bin.fill)) >= 70 ? 'medium' : 'low';
    
    const route = {
        id: dataManager.generateId('RTE'),
        driverId: driver.id,
        driverName: driver.name,
        binIds: bins.map(bin => bin.id),
        binDetails: bins.map(bin => ({
            id: bin.id,
            location: bin.location,
            fill: bin.fill,
            status: bin.status,
            lat: bin.lat,
            lng: bin.lng
        })),
        priority: priority,
        status: 'pending',
        assignedBy: authManager.getCurrentUser()?.id || 'system',
        assignedByName: authManager.getCurrentUser()?.name || 'System',
        assignedAt: new Date().toISOString(),
        estimatedDuration: bins.length * 15, // 15 minutes per bin
        createdAt: new Date().toISOString()
    };
    
    // Add route
    const savedRoute = dataManager.addRoute(route);
    
    // Update bins as assigned
    bins.forEach(bin => {
        dataManager.updateBin(bin.id, {
            assignedDriver: driver.id,
            assignedDriverName: driver.name,
            assignedAt: new Date().toISOString(),
            status: 'assigned'
        });
    });
    
    // Sync to server
    if (typeof syncManager !== 'undefined' && syncManager.syncEnabled) {
        syncManager.syncToServer({ routes: [savedRoute] }, 'partial');
    }
    
    // Show success message
    if (window.app) {
        window.app.showAlert(
            'Assignment Successful', 
            `Driver ${driver.name} has been assigned to ${bins.length} bin(s). Route ID: ${savedRoute.id}`,
            'success'
        );
    }
    
    // Close modal
    closeRouteAssignmentModal();
    
    // Refresh UI
    if (typeof mapManager !== 'undefined') {
        mapManager.loadDriversOnMap();
        mapManager.loadBinsOnMap();
    }
    
    // Refresh driver routes if current user is the assigned driver
    const currentUser = authManager.getCurrentUser();
    if (currentUser && currentUser.id === driver.id && window.app) {
        setTimeout(() => {
            window.app.loadDriverRoutes();
        }, 1000);
    }
    
    console.log('✅ Route assignment completed:', savedRoute);
};

window.closeRouteAssignmentModal = function() {
    const modal = document.getElementById('routeAssignmentModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Clear selections
    window.selectedDriverForRoute = null;
    window.selectedBinsForRoute = [];
    window.recommendedBinsForRoute = [];
};

window.selectAllRecommended = function() {
    if (window.recommendedBinsForRoute) {
        window.selectedBinsForRoute = [...window.recommendedBinsForRoute];
        
        // Update UI for all bins
        document.querySelectorAll('[data-bin-id]').forEach(card => {
            const binId = card.getAttribute('data-bin-id');
            const checkIcon = card.querySelector('.fas.fa-check');
            
            if (window.selectedBinsForRoute.includes(binId)) {
                card.style.border = '2px solid #10b981';
                card.style.background = 'rgba(16, 185, 129, 0.1)';
                if (checkIcon) checkIcon.style.display = 'block';
            }
        });
        
        updateSelectedBinsList();
    }
};

window.assignRecommendedBins = function() {
    console.log('🚀 Auto-assigning recommended bins');
    
    // Select all recommended bins
    selectAllRecommended();
    
    // Small delay to ensure UI updates, then confirm assignment
    setTimeout(() => {
        confirmRouteAssignment();
    }, 300);
};

// DOM Elements Check for Route Assignment
window.checkRouteAssignmentElements = function() {
    const elements = {
        'routeAssignmentModal': document.getElementById('routeAssignmentModal'),
        'routeAssignmentDriverInfo': document.getElementById('routeAssignmentDriverInfo'),
        'availableBinsList': document.getElementById('availableBinsList'),
        'selectedBinsList': document.getElementById('selectedBinsList'),
        'routeAIRecommendation': document.getElementById('routeAIRecommendation'),
        'driverRouteList': document.getElementById('driverRouteList')
    };
    
    console.log('🔍 DOM Elements Check for Route Assignment:');
    Object.keys(elements).forEach(key => {
        console.log(`  - ${key}: ${elements[key] ? '✅ FOUND' : '❌ NOT FOUND'}`);
    });
    
    return elements;
};

// Auto-check on load
setTimeout(() => {
    console.log('🔧 Performing automatic DOM elements check...');
    checkRouteAssignmentElements();
}, 2000);

// Create global instance
window.mapManager = new MapManager();

// Global helper to reset map retry counter
window.resetMapRetryCounter = function() {
    if (window.mapManager) {
        window.mapManager.resetRetryCounter();
    }
};

console.log('Map Manager loaded with complete driver integration');