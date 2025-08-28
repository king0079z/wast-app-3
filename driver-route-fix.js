// driver-route-fix.js - Complete fix for driver route system
const fs = require('fs');
const path = require('path');

console.log('🚛 Starting Driver Route System Fix...\n');

// Fix 1: Update event-handlers.js for proper route start/stop
const fixEventHandlers = () => {
    console.log('🎯 Fixing event-handlers.js for route management...');
    
    const eventHandlersPath = path.join(__dirname, 'event-handlers.js');
    let content = fs.readFileSync(eventHandlersPath, 'utf8');
    
    // Add the comprehensive route management code
    const routeManagementCode = `
// ==================== DRIVER ROUTE MANAGEMENT ====================
// Handle Start/Stop Route Button
const startRouteBtn = document.getElementById('startRouteBtn');
if (startRouteBtn) {
    startRouteBtn.addEventListener('click', function() {
        const currentUser = authManager.getCurrentUser();
        if (!currentUser) return;
        
        const isStarting = this.textContent.includes('Start');
        
        if (isStarting) {
            // Start route
            this.innerHTML = '<i class="fas fa-stop-circle" style="font-size: 1.5rem;"></i><span>End Route</span>';
            this.classList.remove('btn-success');
            this.classList.add('btn-danger');
            
            // Update driver status in dataManager
            dataManager.updateUser(currentUser.id, {
                movementStatus: 'on-route',
                routeStartTime: new Date().toISOString(),
                lastStatusUpdate: new Date().toISOString()
            });
            
            // Update driver location timestamp
            const location = dataManager.getDriverLocation(currentUser.id);
            if (location) {
                dataManager.updateDriverLocation(currentUser.id, location.lat, location.lng);
            }
            
            // Update driver marker on map immediately
            if (window.mapManager) {
                window.mapManager.updateDriverStatus(currentUser.id, 'on-route');
                // Force refresh driver markers
                window.mapManager.loadDriversOnMap();
            }
            
            // Update status indicator
            const statusIndicator = document.getElementById('driverStatusIndicator');
            if (statusIndicator) {
                statusIndicator.textContent = 'On Route';
                statusIndicator.style.color = '#f59e0b';
            }
            
            // Show notification
            if (window.app) {
                window.app.showAlert('Route Started', 'Navigation started. Drive safely!', 'success');
            }
            
            console.log('Route started for driver:', currentUser.name);
        } else {
            // End route
            this.innerHTML = '<i class="fas fa-play-circle" style="font-size: 1.5rem;"></i><span>Start Route</span>';
            this.classList.remove('btn-danger');
            this.classList.add('btn-success');
            
            // Update driver status
            dataManager.updateUser(currentUser.id, {
                movementStatus: 'active',
                routeEndTime: new Date().toISOString(),
                lastStatusUpdate: new Date().toISOString()
            });
            
            // Update driver marker on map
            if (window.mapManager) {
                window.mapManager.updateDriverStatus(currentUser.id, 'active');
                // Force refresh driver markers
                window.mapManager.loadDriversOnMap();
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
            
            console.log('Route ended for driver:', currentUser.name);
        }
    });
}
`;

    // Replace or add the route management code
    if (content.includes('// ==================== DRIVER ROUTE MANAGEMENT')) {
        content = content.replace(
            /\/\/ ==================== DRIVER ROUTE MANAGEMENT[\s\S]*?(?=\/\/ ====================|$)/,
            routeManagementCode
        );
    } else {
        // Add before the closing of DOMContentLoaded
        content = content.replace(
            '});  // End of DOMContentLoaded',
            routeManagementCode + '\n\n});  // End of DOMContentLoaded'
        );
    }
    
    fs.writeFileSync(eventHandlersPath, content);
    console.log('✅ event-handlers.js fixed!\n');
};

// Fix 2: Add global helper functions for bin assignment
const addGlobalHelpers = () => {
    console.log('🌍 Adding global helper functions...');
    
    const globalHelpersCode = `// global-helpers.js - Global helper functions for driver route management

// Assign route to driver with AI recommendations
window.assignRouteToDriver = function(driverId) {
    const driver = dataManager.getUserById(driverId);
    if (!driver) return;
    
    const driverLocation = dataManager.getDriverLocation(driverId);
    if (!driverLocation) {
        if (window.app) {
            window.app.showAlert('Error', 'Driver location not available', 'error');
        }
        return;
    }
    
    // Get all bins with their distances
    const bins = dataManager.getBins();
    const binsWithDistance = bins.map(bin => {
        const distance = mapManager.calculateDistance(
            driverLocation.lat, 
            driverLocation.lng, 
            bin.lat, 
            bin.lng
        );
        return { ...bin, distance };
    }).sort((a, b) => a.distance - b.distance);
    
    // Get AI recommendations (nearest critical bins)
    const criticalBins = binsWithDistance.filter(b => 
        b.status === 'critical' || b.status === 'fire-risk' || b.fill >= 80
    );
    const warningBins = binsWithDistance.filter(b => 
        b.status === 'warning' || b.fill >= 70
    );
    const normalBins = binsWithDistance.filter(b => 
        b.fill < 70 && b.status !== 'critical' && b.status !== 'fire-risk'
    );
    
    // Create modal content
    const modalContent = \`
        <div class="bin-assignment-modal" style="max-height: 500px; overflow-y: auto;">
            <h3 style="margin-bottom: 1rem;">Assign Bins to \${driver.name}</h3>
            
            <!-- AI Recommendations -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <h4 style="color: white; margin: 0 0 0.5rem 0;">
                    <i class="fas fa-robot"></i> AI Recommendations
                </h4>
                <p style="color: rgba(255,255,255,0.9); font-size: 0.875rem; margin: 0;">
                    Based on proximity and urgency, we recommend prioritizing these bins:
                </p>
            </div>
            
            <!-- Critical Bins -->
            \${criticalBins.length > 0 ? \`
                <div class="bin-category" style="margin-bottom: 1.5rem;">
                    <h5 style="color: #ef4444; margin-bottom: 0.5rem;">
                        <i class="fas fa-exclamation-triangle"></i> Critical Priority (\${criticalBins.slice(0, 3).length})
                    </h5>
                    <div class="bin-list">
                        \${criticalBins.slice(0, 3).map((bin, index) => \`
                            <div class="bin-item" style="
                                background: rgba(239, 68, 68, 0.1); 
                                border: 2px solid #ef4444;
                                padding: 0.75rem; 
                                margin-bottom: 0.5rem; 
                                border-radius: 8px;
                                cursor: pointer;
                                transition: all 0.3s ease;
                                \${index === 0 ? 'box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);' : ''}
                            " onclick="assignBinToDriver('\${driverId}', '\${bin.id}')">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <strong>\${bin.id}</strong> - \${bin.location}
                                        \${index === 0 ? '<span style="background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; margin-left: 0.5rem; font-size: 0.75rem;">NEAREST</span>' : ''}
                                        <div style="font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem;">
                                            Fill: \${bin.fill}% | Distance: \${bin.distance.toFixed(1)} km
                                        </div>
                                    </div>
                                    <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); assignBinToDriver('\${driverId}', '\${bin.id}')">
                                        <i class="fas fa-plus"></i> Assign
                                    </button>
                                </div>
                            </div>
                        \`).join('')}
                    </div>
                </div>
            \` : ''}
            
            <!-- Warning Bins -->
            \${warningBins.length > 0 ? \`
                <div class="bin-category" style="margin-bottom: 1.5rem;">
                    <h5 style="color: #f59e0b; margin-bottom: 0.5rem;">
                        <i class="fas fa-exclamation"></i> High Priority (\${warningBins.slice(0, 3).length})
                    </h5>
                    <div class="bin-list">
                        \${warningBins.slice(0, 3).map(bin => \`
                            <div class="bin-item" style="
                                background: rgba(245, 158, 11, 0.1); 
                                border: 1px solid #f59e0b;
                                padding: 0.75rem; 
                                margin-bottom: 0.5rem; 
                                border-radius: 8px;
                                cursor: pointer;
                                transition: all 0.3s ease;
                            " onclick="assignBinToDriver('\${driverId}', '\${bin.id}')">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <strong>\${bin.id}</strong> - \${bin.location}
                                        <div style="font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem;">
                                            Fill: \${bin.fill}% | Distance: \${bin.distance.toFixed(1)} km
                                        </div>
                                    </div>
                                    <button class="btn btn-warning btn-sm" onclick="event.stopPropagation(); assignBinToDriver('\${driverId}', '\${bin.id}')">
                                        <i class="fas fa-plus"></i> Assign
                                    </button>
                                </div>
                            </div>
                        \`).join('')}
                    </div>
                </div>
            \` : ''}
            
            <!-- Normal Bins -->
            \${normalBins.length > 0 ? \`
                <div class="bin-category">
                    <h5 style="color: #10b981; margin-bottom: 0.5rem;">
                        <i class="fas fa-check"></i> Normal Priority (\${normalBins.slice(0, 5).length})
                    </h5>
                    <div class="bin-list">
                        \${normalBins.slice(0, 5).map(bin => \`
                            <div class="bin-item" style="
                                background: rgba(16, 185, 129, 0.05); 
                                border: 1px solid #10b981;
                                padding: 0.75rem; 
                                margin-bottom: 0.5rem; 
                                border-radius: 8px;
                                cursor: pointer;
                                transition: all 0.3s ease;
                            " onclick="assignBinToDriver('\${driverId}', '\${bin.id}')">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <strong>\${bin.id}</strong> - \${bin.location}
                                        <div style="font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem;">
                                            Fill: \${bin.fill}% | Distance: \${bin.distance.toFixed(1)} km
                                        </div>
                                    </div>
                                    <button class="btn btn-success btn-sm" onclick="event.stopPropagation(); assignBinToDriver('\${driverId}', '\${bin.id}')">
                                        <i class="fas fa-plus"></i> Assign
                                    </button>
                                </div>
                            </div>
                        \`).join('')}
                    </div>
                </div>
            \` : ''}
            
            <!-- Summary -->
            <div style="background: #1f2937; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>Total Bins Available:</strong> \${bins.length}
                    </div>
                    <button class="btn btn-primary" onclick="autoAssignRoute('\${driverId}')">
                        <i class="fas fa-magic"></i> Auto-Assign Optimal Route
                    </button>
                </div>
            </div>
        </div>
    \`;
    
    // Show modal
    const modal = document.getElementById('customModal');
    const modalBody = document.getElementById('modalBody');
    if (modal && modalBody) {
        modalBody.innerHTML = modalContent;
        modal.style.display = 'flex';
    }
};

// Assign specific bin to driver
window.assignBinToDriver = function(driverId, binId) {
    const driver = dataManager.getUserById(driverId);
    const bin = dataManager.getBinById(binId);
    
    if (!driver || !bin) return;
    
    // Add bin to driver's route
    const existingRoutes = dataManager.getDriverRoutes(driverId);
    const routeExists = existingRoutes.some(r => r.binId === binId);
    
    if (!routeExists) {
        const route = {
            id: 'ROUTE-' + Date.now(),
            driverId: driverId,
            binId: binId,
            status: 'assigned',
            assignedAt: new Date().toISOString(),
            priority: bin.status === 'critical' ? 'high' : bin.status === 'warning' ? 'medium' : 'normal'
        };
        
        dataManager.addDriverRoute(route);
        
        // Update bin status
        dataManager.updateBin(binId, { 
            assignedTo: driverId,
            assignedAt: new Date().toISOString()
        });
        
        // Show success message
        if (window.app) {
            window.app.showAlert('Success', \`Bin \${binId} assigned to \${driver.name}\`, 'success');
        }
        
        // Refresh driver's route list if they're logged in
        if (authManager.getCurrentUser()?.id === driverId && window.app) {
            window.app.loadDriverRoutes();
        }
        
        // Update map markers
        if (window.mapManager) {
            window.mapManager.updateBinMarker(binId);
        }
    } else {
        if (window.app) {
            window.app.showAlert('Info', 'This bin is already assigned to this driver', 'info');
        }
    }
};

// Auto-assign optimal route
window.autoAssignRoute = function(driverId) {
    const driver = dataManager.getUserById(driverId);
    if (!driver) return;
    
    const driverLocation = dataManager.getDriverLocation(driverId);
    if (!driverLocation) {
        if (window.app) {
            window.app.showAlert('Error', 'Driver location not available', 'error');
        }
        return;
    }
    
    // Get bins sorted by priority and distance
    const bins = dataManager.getBins();
    const priorityBins = bins
        .filter(b => !b.assignedTo) // Only unassigned bins
        .map(bin => {
            const distance = mapManager.calculateDistance(
                driverLocation.lat, 
                driverLocation.lng, 
                bin.lat, 
                bin.lng
            );
            
            // Calculate priority score (higher = more urgent)
            let priorityScore = 0;
            if (bin.status === 'critical' || bin.status === 'fire-risk') {
                priorityScore = 100 - distance; // Critical bins get highest priority minus distance
            } else if (bin.status === 'warning' || bin.fill >= 70) {
                priorityScore = 70 - distance;
            } else {
                priorityScore = 40 - distance;
            }
            
            return { ...bin, distance, priorityScore };
        })
        .sort((a, b) => b.priorityScore - a.priorityScore)
        .slice(0, 5); // Assign top 5 bins
    
    // Assign bins to driver
    let assignedCount = 0;
    priorityBins.forEach(bin => {
        assignBinToDriver(driverId, bin.id);
        assignedCount++;
    });
    
    // Close modal
    const modal = document.getElementById('customModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Show success message
    if (window.app) {
        window.app.showAlert('Route Assigned', \`Assigned \${assignedCount} bins to \${driver.name} based on AI optimization\`, 'success');
    }
    
    // Refresh map
    if (window.mapManager) {
        window.mapManager.loadBinsOnMap();
        window.mapManager.loadDriversOnMap();
    }
};

// Navigate to bin (for driver interface)
window.navigateToBin = function(binId, lat, lng) {
    const bin = dataManager.getBinById(binId);
    if (!bin) return;
    
    // Open navigation in Google Maps or system maps
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Try to open in Google Maps app first, fallback to web
        window.open(\`https://www.google.com/maps/dir/?api=1&destination=\${lat},\${lng}&travelmode=driving\`, '_blank');
    } else {
        // Open in new tab for desktop
        window.open(\`https://www.google.com/maps/dir/?api=1&destination=\${lat},\${lng}&travelmode=driving\`, '_blank');
    }
    
    // Mark bin as being collected
    dataManager.updateBin(binId, {
        collectionStatus: 'in-progress',
        collectionStartTime: new Date().toISOString()
    });
    
    // Update route status
    const currentUser = authManager.getCurrentUser();
    if (currentUser) {
        const routes = dataManager.getDriverRoutes(currentUser.id);
        const route = routes.find(r => r.binId === binId);
        if (route) {
            dataManager.updateDriverRoute(route.id, {
                status: 'in-progress',
                startedAt: new Date().toISOString()
            });
        }
    }
    
    if (window.app) {
        window.app.showAlert('Navigation Started', \`Navigating to bin \${binId}\`, 'info');
    }
};

// Mark bin as collected
window.markBinCollected = function(binId) {
    const bin = dataManager.getBinById(binId);
    if (!bin) return;
    
    const currentUser = authManager.getCurrentUser();
    if (!currentUser) return;
    
    // Update bin
    dataManager.updateBin(binId, {
        fill: 0,
        status: 'empty',
        lastCollection: new Date().toLocaleDateString(),
        collectionStatus: 'completed',
        collectionEndTime: new Date().toISOString(),
        collectedBy: currentUser.id
    });
    
    // Update route
    const routes = dataManager.getDriverRoutes(currentUser.id);
    const route = routes.find(r => r.binId === binId);
    if (route) {
        dataManager.updateDriverRoute(route.id, {
            status: 'completed',
            completedAt: new Date().toISOString()
        });
    }
    
    // Add to collection history
    dataManager.addDriverCollection(currentUser.id, binId);
    
    // Update driver stats
    const collections = dataManager.getDriverCollections(currentUser.id);
    const todayCollections = collections.filter(c => 
        new Date(c.timestamp).toDateString() === new Date().toDateString()
    ).length;
    
    // Update UI
    const todayElement = document.getElementById('collectionsToday');
    if (todayElement) {
        todayElement.textContent = todayCollections;
    }
    
    // Refresh route list
    if (window.app) {
        window.app.loadDriverRoutes();
        window.app.showAlert('Success', \`Bin \${binId} marked as collected\`, 'success');
    }
    
    // Update map
    if (window.mapManager) {
        window.mapManager.updateBinMarker(binId);
        window.mapManager.loadDriversOnMap();
    }
};

console.log('Global helper functions loaded');
`;

    fs.writeFileSync('global-helpers.js', globalHelpersCode);
    console.log('✅ global-helpers.js created!\n');
};

// Fix 3: Update index.html to include global helpers
const updateIndexHtml = () => {
    console.log('📄 Updating index.html...');
    
    const indexPath = path.join(__dirname, 'index.html');
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Add global-helpers.js script if not already included
    if (!content.includes('global-helpers.js')) {
        content = content.replace(
            '<script src="app.js"></script>',
            '<script src="global-helpers.js"></script>\n    <script src="app.js"></script>'
        );
    }
    
    fs.writeFileSync(indexPath, content);
    console.log('✅ index.html updated!\n');
};

// Fix 4: Update app.js loadDriverRoutes method
const updateAppJs = () => {
    console.log('📱 Updating app.js for driver routes...');
    
    const appPath = path.join(__dirname, 'app.js');
    let content = fs.readFileSync(appPath, 'utf8');
    
    // Find and update loadDriverRoutes method
    const improvedLoadDriverRoutes = `    loadDriverRoutes() {
        const routesList = document.getElementById('driverRoutesList');
        const routesCount = document.getElementById('routesCount');
        const completedToday = document.getElementById('completedToday');
        
        if (!routesList) return;
        
        const currentUser = authManager.getCurrentUser();
        if (!currentUser) return;
        
        const routes = dataManager.getDriverRoutes(currentUser.id);
        const activeRoutes = routes.filter(r => r.status !== 'completed');
        const completedRoutes = routes.filter(r => 
            r.status === 'completed' && 
            new Date(r.completedAt).toDateString() === new Date().toDateString()
        );
        
        if (routesCount) routesCount.textContent = activeRoutes.length;
        if (completedToday) completedToday.textContent = completedRoutes.length;
        
        if (activeRoutes.length === 0) {
            routesList.innerHTML = \`
                <div style="text-align: center; padding: 2rem; color: #6b7280;">
                    <i class="fas fa-route" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No active routes assigned</p>
                    <p style="font-size: 0.875rem;">Routes will appear here when assigned by manager</p>
                </div>
            \`;
            return;
        }
        
        routesList.innerHTML = activeRoutes.map(route => {
            const bin = dataManager.getBinById(route.binId);
            if (!bin) return '';
            
            const priorityColor = route.priority === 'high' ? '#ef4444' : 
                                route.priority === 'medium' ? '#f59e0b' : '#10b981';
            
            const statusBadge = route.status === 'in-progress' ? 
                '<span style="background: #3b82f6; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">IN PROGRESS</span>' : '';
            
            return \`
                <div class="route-card" style="
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 1rem;
                    margin-bottom: 1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                " onclick="window.navigateToBin('\${bin.id}', \${bin.lat}, \${bin.lng})">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
                        <div>
                            <h4 style="margin: 0; color: #e2e8f0;">
                                \${bin.id} - \${bin.location}
                            </h4>
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem;">
                                <span style="color: \${priorityColor}; font-weight: bold; text-transform: uppercase; font-size: 0.75rem;">
                                    \${route.priority} PRIORITY
                                </span>
                                \${statusBadge}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.5rem; font-weight: bold; color: \${this.getBinStatusColor(bin)};">
                                \${bin.fill || 0}%
                            </div>
                            <div style="font-size: 0.75rem; color: #6b7280;">Fill Level</div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-bottom: 0.75rem;">
                        <div style="background: rgba(0, 0, 0, 0.2); padding: 0.5rem; border-radius: 6px;">
                            <div style="color: #94a3b8; font-size: 0.75rem;">Status</div>
                            <div style="color: #e2e8f0; font-weight: bold; text-transform: capitalize;">
                                \${bin.status}
                            </div>
                        </div>
                        <div style="background: rgba(0, 0, 0, 0.2); padding: 0.5rem; border-radius: 6px;">
                            <div style="color: #94a3b8; font-size: 0.75rem;">Assigned</div>
                            <div style="color: #e2e8f0; font-weight: bold;">
                                \${new Date(route.assignedAt).toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="event.stopPropagation(); window.navigateToBin('\${bin.id}', \${bin.lat}, \${bin.lng})">
                            <i class="fas fa-map-marked-alt"></i> Navigate
                        </button>
                        <button class="btn btn-success btn-sm" style="flex: 1;" onclick="event.stopPropagation(); window.markBinCollected('\${bin.id}')">
                            <i class="fas fa-check"></i> Mark Collected
                        </button>
                    </div>
                </div>
            \`;
        }).join('');
    }`;
    
    // Replace the loadDriverRoutes method
    content = content.replace(
        /loadDriverRoutes\(\) {[\s\S]*?^    }/m,
        improvedLoadDriverRoutes
    );
    
    fs.writeFileSync(appPath, content);
    console.log('✅ app.js updated!\n');
};

// Fix 5: Ensure dataManager has driver route methods
const updateDataManager = () => {
    console.log('💾 Updating data-manager.js...');
    
    const dataManagerPath = path.join(__dirname, 'data-manager.js');
    let content = fs.readFileSync(dataManagerPath, 'utf8');
    
    // Add driver route methods if they don't exist
    const driverRouteMethods = `
    // Driver Route Management
    addDriverRoute(route) {
        const routes = this.getDriverRoutes(route.driverId);
        routes.push(route);
        localStorage.setItem(\`driverRoutes_\${route.driverId}\`, JSON.stringify(routes));
        return route;
    }
    
    updateDriverRoute(routeId, updates) {
        const allRoutes = this.getAllDriverRoutes();
        const route = allRoutes.find(r => r.id === routeId);
        if (route) {
            Object.assign(route, updates);
            const driverRoutes = allRoutes.filter(r => r.driverId === route.driverId);
            localStorage.setItem(\`driverRoutes_\${route.driverId}\`, JSON.stringify(driverRoutes));
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
    
    getDriverRoutes(driverId) {
        const stored = localStorage.getItem(\`driverRoutes_\${driverId}\`);
        return stored ? JSON.parse(stored) : [];
    }
    
    addDriverCollection(driverId, binId) {
        const collections = this.getDriverCollections(driverId);
        collections.push({
            binId,
            timestamp: new Date().toISOString(),
            driverId
        });
        localStorage.setItem(\`driverCollections_\${driverId}\`, JSON.stringify(collections));
        return collections;
    }
    
    getDriverCollections(driverId) {
        const stored = localStorage.getItem(\`driverCollections_\${driverId}\`);
        return stored ? JSON.parse(stored) : [];
    }`;
    
    // Add methods before the closing brace of the class
    if (!content.includes('addDriverRoute')) {
        content = content.replace(
            /^}[\s]*\/\/ Create global instance/m,
            driverRouteMethods + '\n}\n\n// Create global instance'
        );
    }
    
    fs.writeFileSync(dataManagerPath, content);
    console.log('✅ data-manager.js updated!\n');
};

// Run all fixes
console.log('🔄 Applying comprehensive driver route fixes...\n');

try {
    fixEventHandlers();
    addGlobalHelpers();
    updateIndexHtml();
    updateAppJs();
    updateDataManager();
    
    console.log('====================================');
    console.log('✅ ALL DRIVER ROUTE FIXES APPLIED!');
    console.log('====================================\n');
    console.log('📝 What was fixed:');
    console.log('   1. Start/Stop Route button now properly updates driver status');
    console.log('   2. Driver status changes to "On Route" when route starts');
    console.log('   3. Last update time now shows correctly');
    console.log('   4. Assign Route button opens AI-powered bin assignment modal');
    console.log('   5. AI recommends nearest critical bins for optimal routing');
    console.log('   6. Drivers can navigate to assigned bins');
    console.log('   7. Drivers can mark bins as collected');
    console.log('   8. Route progress tracked in real-time\n');
    console.log('🚀 Please refresh your browser to see all changes!');
    console.log('====================================\n');
} catch (error) {
    console.error('❌ Error applying fixes:', error);
    console.log('\n📝 Please make sure all files exist in the current directory.');
}