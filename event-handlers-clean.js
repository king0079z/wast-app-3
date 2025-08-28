// Event Handlers - Cleaned Version (Driver buttons moved to enhanced-driver-buttons.js)

function setupEventHandlers() {
    console.log('Setting up event handlers...');
    
    // Setup sync status updates
    setupSyncStatusUpdates();
    
    // Main navigation
    const sections = document.querySelectorAll('.nav-item');
    sections.forEach(section => {
        section.addEventListener('click', function(e) {
            e.preventDefault();
            if (this.dataset.section && window.app) {
                window.app.showSection(this.dataset.section);
            }
        });
    });

    // FAB Menu Buttons (Enhanced)
    const fabVehicleBtn = document.getElementById('fabVehicleBtn');
    if (fabVehicleBtn) {
        fabVehicleBtn.addEventListener('click', function() {
            console.log('📋 Vehicle Registration FAB clicked');
            if (typeof showVehicleRegistrationModal === 'function') {
                showVehicleRegistrationModal();
            } else {
                console.error('showVehicleRegistrationModal function not available');
                if (window.app) {
                    window.app.showAlert('Feature Error', 'Vehicle registration not available', 'error');
                }
            }
        });
    }

    const fabBinBtn = document.getElementById('fabBinBtn');
    if (fabBinBtn) {
        fabBinBtn.addEventListener('click', function() {
            console.log('🗑️ Bin Registration FAB clicked');
            if (typeof showBinRegistrationModal === 'function') {
                showBinRegistrationModal();
            } else {
                console.error('showBinRegistrationModal function not available');
                if (window.app) {
                    window.app.showAlert('Feature Error', 'Bin registration not available', 'error');
                }
            }
        });
    }

    const fabIssueBtn = document.getElementById('fabIssueBtn');
    if (fabIssueBtn) {
        fabIssueBtn.addEventListener('click', function() {
            console.log('🚨 Issue Reporting FAB clicked');
            if (typeof showIssueReportingModal === 'function') {
                showIssueReportingModal();
            } else {
                console.error('showIssueReportingModal function not available');
                if (window.app) {
                    window.app.showAlert('Feature Error', 'Issue reporting not available', 'error');
                }
            }
        });
    }

    const fabErrorBtn = document.getElementById('fabErrorBtn');
    if (fabErrorBtn) {
        fabErrorBtn.addEventListener('click', function() {
            console.log('📊 Error Logs FAB clicked');
            if (typeof showErrorLogsModal === 'function') {
                showErrorLogsModal();
            } else {
                console.error('showErrorLogsModal function not available');
                if (window.app) {
                    window.app.showAlert('Feature Error', 'Error logs not available', 'error');
                }
            }
        });
    }

    // Dashboard Quick Actions
    const optimizeBtn = document.getElementById('optimizeAllRoutesBtn');
    if (optimizeBtn) {
        optimizeBtn.addEventListener('click', function() {
            console.log('🎯 Optimize All Routes clicked');
            if (typeof performComprehensiveRouteOptimization === 'function') {
                performComprehensiveRouteOptimization();
            } else {
                console.log('⚠️ performComprehensiveRouteOptimization function not available, using fallback');
                if (window.app) {
                    window.app.showAlert('Route Optimization', 'Optimizing all routes across the system...', 'info');
                }
            }
        });
    }

    const analyticsBtn = document.getElementById('viewAnalyticsBtn');
    if (analyticsBtn) {
        analyticsBtn.addEventListener('click', function() {
            console.log('📊 View Analytics clicked');
            if (window.app) {
                window.app.showSection('analytics');
            }
        });
    }

    const reportBtn = document.getElementById('generateReportBtn');
    if (reportBtn) {
        reportBtn.addEventListener('click', function() {
            console.log('📊 Generating comprehensive report...');
            
            // Call the PDF report generation function
            if (typeof generateComprehensiveReport === 'function') {
                generateComprehensiveReport();
            } else {
                // Fallback if function not available
                if (window.app) {
                    window.app.showAlert('Report Generation', 
                        'PDF report generation initiated. Please wait...', 'info');
                }
                console.log('⚠️ generateComprehensiveReport function not available');
            }
        });
    }
    
    // Driver Interface Buttons (Non-Action Buttons)
    const refreshGPSBtn = document.getElementById('refreshGPSBtn');
    if (refreshGPSBtn) {
        refreshGPSBtn.addEventListener('click', function() {
            if (typeof mapManager !== 'undefined') {
                mapManager.stopDriverTracking();
                mapManager.startDriverTracking();
            }
            if (window.app) {
                window.app.showAlert('GPS Refresh', 'Refreshing GPS location...', 'info');
            }
        });
    }
    
    // Note: Main Driver Action Buttons (Start Route, Register Pickup, Report Issue, Update Fuel) 
    // are now handled by enhanced-driver-buttons.js for better UI and functionality
    
    const openMapBtn = document.getElementById('openDriverMapBtn');
    if (openMapBtn) {
        openMapBtn.addEventListener('click', function() {
            if (window.app) window.app.openDriverMap();
        });
    }
    
    // Driver Quick Actions
    const scanQRBtn = document.getElementById('scanBinQRBtn');
    if (scanQRBtn) {
        scanQRBtn.addEventListener('click', function() {
            if (window.app) {
                window.app.showAlert('QR Scanner', 'Camera access required for QR scanning', 'info');
            }
        });
    }
    
    const callDispatchBtn = document.getElementById('callDispatchBtn');
    if (callDispatchBtn) {
        callDispatchBtn.addEventListener('click', function() {
            if (window.app) {
                window.app.showAlert('Calling Dispatch', 'Connecting to dispatch center...', 'info');
            }
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'm':
                    e.preventDefault();
                    if (window.app) window.app.showSection('map');
                    break;
                case 'd':
                    e.preventDefault();
                    if (window.app) window.app.showSection('dashboard');
                    break;
                case 'f':
                    e.preventDefault();
                    if (window.app) window.app.showSection('fleet');
                    break;
                case 'a':
                    e.preventDefault();
                    if (window.app) window.app.showSection('analytics');
                    break;
            }
        }
    });

    // Enhanced Quick Action Functions (for route optimization)
    console.log('✅ Event handlers setup complete (driver buttons handled separately)');
}

// Sync Status Updates
function setupSyncStatusUpdates() {
    if (typeof syncManager !== 'undefined') {
        // Update sync status indicator
        setInterval(() => {
            const status = syncManager.getSyncStatus();
            const indicator = document.getElementById('syncStatus');
            if (indicator) {
                indicator.textContent = status.connected ? 'Connected' : 'Offline';
                indicator.className = status.connected ? 'sync-connected' : 'sync-disconnected';
            }
        }, 5000);
    }
}

// Route Optimization Functions
async function performComprehensiveRouteOptimization() {
    try {
        console.log('🎯 Starting comprehensive route optimization...');
        
        if (!dataManager) {
            throw new Error('DataManager not available');
        }

        const bins = dataManager.getBins();
        const drivers = dataManager.getUsers().filter(u => u.type === 'driver');
        
        if (bins.length === 0 || drivers.length === 0) {
            if (window.app) {
                window.app.showAlert('Optimization Error', 'No bins or drivers available for optimization', 'warning');
            }
            return;
        }

        // Clear existing routes
        drivers.forEach(driver => {
            const existingRoutes = dataManager.getDriverRoutes(driver.id);
            existingRoutes.forEach(route => {
                if (route.status === 'pending') {
                    dataManager.deleteRoute(route.id);
                }
            });
        });

        // Group bins by urgency and location
        const urgentBins = bins.filter(bin => bin.fill >= 80);
        const mediumBins = bins.filter(bin => bin.fill >= 50 && bin.fill < 80);
        const lowBins = bins.filter(bin => bin.fill < 50);

        let routeCounter = 1;
        const assignedBins = new Set();

        // Assign urgent bins first
        for (const driver of drivers) {
            if (urgentBins.length === 0) break;
            
            const nearestBins = urgentBins
                .filter(bin => !assignedBins.has(bin.id))
                .slice(0, 3); // Max 3 urgent bins per driver
                
            if (nearestBins.length > 0) {
                const route = {
                    id: `ROUTE-${Date.now()}-${routeCounter++}`,
                    driverId: driver.id,
                    binIds: nearestBins.map(bin => bin.id),
                    binDetails: nearestBins,
                    status: 'pending',
                    priority: 'high',
                    estimatedTime: nearestBins.length * 15, // 15 min per bin
                    createdAt: new Date().toISOString()
                };
                
                dataManager.addRoute(route);
                nearestBins.forEach(bin => assignedBins.add(bin.id));
                console.log(`✅ Assigned urgent route to ${driver.name}: ${nearestBins.length} bins`);
            }
        }

        // Assign medium priority bins
        for (const driver of drivers) {
            const availableMediumBins = mediumBins.filter(bin => !assignedBins.has(bin.id));
            if (availableMediumBins.length === 0) continue;
            
            const assignedBinsForDriver = availableMediumBins.slice(0, 4); // Max 4 medium bins
            
            if (assignedBinsForDriver.length > 0) {
                const route = {
                    id: `ROUTE-${Date.now()}-${routeCounter++}`,
                    driverId: driver.id,
                    binIds: assignedBinsForDriver.map(bin => bin.id),
                    binDetails: assignedBinsForDriver,
                    status: 'pending',
                    priority: 'medium',
                    estimatedTime: assignedBinsForDriver.length * 12, // 12 min per bin
                    createdAt: new Date().toISOString()
                };
                
                dataManager.addRoute(route);
                assignedBinsForDriver.forEach(bin => assignedBins.add(bin.id));
                console.log(`✅ Assigned medium route to ${driver.name}: ${assignedBinsForDriver.length} bins`);
            }
        }

        // Update all driver accounts
        await updateAllDriverAccounts();

        // Sync to server
        if (typeof syncManager !== 'undefined') {
            await syncManager.syncToServer();
        }

        const totalAssigned = assignedBins.size;
        const totalBins = bins.length;
        
        if (window.app) {
            window.app.showAlert(
                'Route Optimization Complete',
                `🎯 Successfully optimized routes!\n\nAssigned: ${totalAssigned}/${totalBins} bins\nDrivers: ${drivers.length}\nRoutes created: ${routeCounter - 1}`,
                'success'
            );
        }

        console.log(`🎯 Route optimization complete: ${totalAssigned}/${totalBins} bins assigned`);
        
    } catch (error) {
        console.error('❌ Route optimization failed:', error);
        if (window.app) {
            window.app.showAlert('Optimization Error', `Failed to optimize routes: ${error.message}`, 'error');
        }
    }
}

async function updateAllDriverAccounts() {
    console.log('🔄 Updating all driver accounts...');
    
    // Refresh driver interface if currently shown
    if (window.app && window.app.currentSection === 'driver') {
        window.app.loadDriverRoutes();
    }
    
    // Update AI suggestions for each driver
    const drivers = dataManager.getUsers().filter(u => u.type === 'driver');
    for (const driver of drivers) {
        await createAISuggestionForDriver(driver.id);
    }
    
    console.log('✅ All driver accounts updated');
}

async function createAISuggestionForDriver(driverId) {
    try {
        console.log(`🤖 Creating AI suggestion for driver ${driverId}`);
        
        // Get all bins, not just from routes
        const allBins = dataManager.getBins();
        if (!allBins || allBins.length === 0) {
            console.log('⚠️ No bins available for AI recommendation');
            return null;
        }

        // Filter out bins already assigned to active routes (any driver)
        const allRoutes = dataManager.getRoutes();
        const assignedBinIds = new Set();
        
        allRoutes.forEach(route => {
            if (route.status !== 'completed' && route.status !== 'cancelled') {
                if (route.binIds && Array.isArray(route.binIds)) {
                    route.binIds.forEach(binId => assignedBinIds.add(binId));
                }
                if (route.binId) {
                    assignedBinIds.add(route.binId);
                }
            }
        });

        // Filter available bins (>= 50% full, not assigned, not in maintenance)
        const availableBins = allBins.filter(bin => 
            !assignedBinIds.has(bin.id) &&
            (bin.fill || 0) >= 50 &&
            bin.status !== 'maintenance' &&
            bin.status !== 'offline'
        );

        console.log(`📦 Found ${availableBins.length} available bins for AI recommendation`);
        
        if (availableBins.length === 0) {
            console.log('⚠️ No available bins for AI recommendation');
            return null;
        }

        // Find best bin suggestion from available bins
        const suggestion = findBestBinSuggestion(availableBins, driverId);
        
        if (suggestion) {
            // Store suggestion
            const suggestions = dataManager.getData('aiSuggestions') || {};
            suggestions[driverId] = suggestion;
            dataManager.setData('aiSuggestions', suggestions);
            
            console.log(`✅ AI suggestion created for driver ${driverId}: ${suggestion.binId}`);
        }
        
        return suggestion;
        
    } catch (error) {
        console.error(`❌ Failed to create AI suggestion for driver ${driverId}:`, error);
        return null;
    }
}

function findBestBinSuggestion(bins, driverId) {
    if (!bins || bins.length === 0) return null;
    
    // Get driver location for distance calculation
    const driverLocation = dataManager.getDriverLocation(driverId);
    if (!driverLocation) {
        console.warn(`⚠️ Driver location not available for ${driverId}`);
    }
    
    // Enhanced scoring algorithm with distance calculation
    const scoredBins = bins.map(bin => {
        let score = 0;
        let distance = 0;
        
        // Calculate distance if driver location is available
        if (driverLocation && driverLocation.lat && driverLocation.lng) {
            distance = window.dataManager?.calculateDistance(
                driverLocation.lat, driverLocation.lng,
                bin.lat || 25.3682, bin.lng || 51.5511
            ) || 0;
            
            // Distance factor (closer = higher priority)
            if (distance < 2) score += 25;
            else if (distance < 5) score += 15;
            else if (distance < 10) score += 5;
        }
        
        // Fill level priority (higher fill = higher priority)
        score += bin.fill * 0.4;
        
        // Urgency based on fill level
        if (bin.fill >= 90) score += 30;
        else if (bin.fill >= 75) score += 20;
        else if (bin.fill >= 50) score += 10;
        
        // Temperature factor (higher temp = higher priority)
        if (bin.temperature && bin.temperature > 35) score += 15;
        else if (bin.temperature && bin.temperature > 30) score += 10;
        
        // Random factor for variety
        score += Math.random() * 5;
        
        return { ...bin, score, calculatedDistance: distance };
    });
    
    // Sort by score (highest first)
    scoredBins.sort((a, b) => b.score - a.score);
    
    const bestBin = scoredBins[0];
    
    return {
        binId: bestBin.id,
        binLocation: bestBin.location,
        fillLevel: bestBin.fill,
        distance: bestBin.calculatedDistance ? Math.round(bestBin.calculatedDistance * 100) / 100 : 'N/A', // Round to 2 decimal places
        priority: bestBin.fill >= 75 ? 'High' : bestBin.fill >= 50 ? 'Medium' : 'Low',
        reason: generateSuggestionReason(bestBin, bestBin.calculatedDistance),
        estimatedTime: Math.ceil(bestBin.calculatedDistance * 2 + bestBin.fill / 10) + 5, // Travel time + collection time
        timestamp: new Date().toISOString()
    };
}

function generateSuggestionReason(bin, distance) {
    const reasons = [];
    
    if (bin.fill >= 90) {
        reasons.push('Critical fill level');
    } else if (bin.fill >= 75) {
        reasons.push('High fill level');
    } else if (bin.fill >= 50) {
        reasons.push('Moderate fill level');
    }
    
    if (distance && distance < 2) {
        reasons.push('Very close to you');
    } else if (distance && distance < 5) {
        reasons.push('Nearby location');
    }
    
    if (bin.temperature && bin.temperature > 35) {
        reasons.push('High temperature detected');
    }
    
    if (reasons.length === 0) {
        reasons.push('Optimal collection opportunity');
    }
    
    return reasons.join(' • ');
}

// Initialize event handlers when DOM loads
document.addEventListener('DOMContentLoaded', setupEventHandlers);

// Export for global access
window.setupEventHandlers = setupEventHandlers;
window.performComprehensiveRouteOptimization = performComprehensiveRouteOptimization;

