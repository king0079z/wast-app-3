// direct-fix.js - Direct fixes for map-manager.js driver issues
const fs = require('fs');
const path = require('path');

console.log('🔧 Starting Direct Map Manager Fix...\n');

// Fix 1: Update map-manager.js with working driver status updates
const fixMapManager = () => {
    console.log('📍 Directly fixing map-manager.js...');
    
    const mapManagerPath = path.join(__dirname, 'map-manager.js');
    let content = fs.readFileSync(mapManagerPath, 'utf8');
    
    // Find and replace the updateDriverStatus method
    const updateDriverStatusFixed = `    // Update driver status on map - FIXED VERSION
    updateDriverStatus(driverId, status) {
        console.log(\`Updating driver \${driverId} status to: \${status}\`);
        
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
        const location = dataManager.getDriverLocation(driverId);
        if (location) {
            location.timestamp = new Date().toISOString();
            dataManager.updateDriverLocation(driverId, location.lat, location.lng);
        }
        
        // Remove and recreate marker with new status
        if (this.markers.drivers[driverId] && this.layers.drivers) {
            this.layers.drivers.removeLayer(this.markers.drivers[driverId]);
            delete this.markers.drivers[driverId];
        }
        
        // Recreate marker with updated status
        if (location) {
            this.addDriverMarker(driver, location);
        }
        
        console.log(\`Driver \${driver.name} status updated to: \${status}\`);
    }`;
    
    // Replace the updateDriverStatus method
    content = content.replace(
        /updateDriverStatus\(driverId, status\) {[\s\S]*?^    }/m,
        updateDriverStatusFixed
    );
    
    // Fix the createDriverPopup to show correct last update time
    const createDriverPopupFixed = `    // Create driver popup content - FIXED VERSION
    createDriverPopup(driver, location, todayCollections, isCurrentDriver = false, statusText = 'Active') {
        const routes = dataManager.getDriverRoutes(driver.id);
        
        // Use the actual last update time from location or driver object
        let lastUpdate = 'Unknown';
        if (location && location.timestamp) {
            const updateTime = new Date(location.timestamp);
            const now = new Date();
            const diffMinutes = Math.floor((now - updateTime) / 60000);
            
            if (diffMinutes < 1) {
                lastUpdate = 'Just now';
            } else if (diffMinutes < 60) {
                lastUpdate = \`\${diffMinutes} min ago\`;
            } else {
                lastUpdate = updateTime.toLocaleTimeString();
            }
        }
        
        // Determine actual status
        if (driver.movementStatus === 'on-route') {
            statusText = 'On Route';
        } else if (driver.status === 'inactive') {
            statusText = 'Inactive';
        } else {
            statusText = 'Active';
        }
        
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
                        <button class="btn btn-primary btn-sm" onclick="window.assignRouteToDriver('\${driver.id}')">
                            <i class="fas fa-route"></i> Assign Route
                        </button>
                    \` : ''}
                    <button class="btn btn-secondary btn-sm" onclick="window.viewDriverDetails('\${driver.id}')">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                </div>
            </div>
        \`;
    }`;
    
    // Replace the createDriverPopup method
    content = content.replace(
        /createDriverPopup\(driver, location, todayCollections, isCurrentDriver = false, statusText = 'Active'\) {[\s\S]*?^    }/m,
        createDriverPopupFixed
    );
    
    fs.writeFileSync(mapManagerPath, content);
    console.log('✅ map-manager.js fixed!\n');
};

// Fix 2: Create a simple inline script for immediate functionality
const createInlineScript = () => {
    console.log('📝 Creating inline script for immediate functionality...');
    
    const inlineScript = `<!-- Add this script directly to your index.html before the closing </body> tag -->
<script>
// Immediate fix for driver route functionality
(function() {
    // Override the assignRouteToDriver function
    window.assignRouteToDriver = function(driverId) {
        const driver = dataManager.getUserById(driverId);
        if (!driver) {
            alert('Driver not found');
            return;
        }
        
        const driverLocation = dataManager.getDriverLocation(driverId);
        if (!driverLocation) {
            alert('Driver location not available. Please wait for GPS to initialize.');
            return;
        }
        
        // Get all bins with distances
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
        
        // Categorize bins
        const criticalBins = binsWithDistance.filter(b => b.fill >= 80);
        const warningBins = binsWithDistance.filter(b => b.fill >= 60 && b.fill < 80);
        const normalBins = binsWithDistance.filter(b => b.fill < 60);
        
        // Create simple modal content
        let modalHTML = '<div style="padding: 20px; max-height: 500px; overflow-y: auto;">';
        modalHTML += '<h3>Assign Bins to ' + driver.name + '</h3>';
        
        // AI Recommendation
        modalHTML += '<div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 15px; border-radius: 8px; margin: 15px 0; color: white;">';
        modalHTML += '<h4>🤖 AI Recommendations</h4>';
        modalHTML += '<p>Nearest critical bins are highlighted for optimal routing</p>';
        modalHTML += '</div>';
        
        // Critical Bins
        if (criticalBins.length > 0) {
            modalHTML += '<h4 style="color: #ef4444;">⚠️ Critical Priority</h4>';
            criticalBins.slice(0, 3).forEach((bin, index) => {
                modalHTML += '<div style="background: rgba(239, 68, 68, 0.1); border: 2px solid #ef4444; padding: 10px; margin: 10px 0; border-radius: 8px;">';
                modalHTML += '<strong>' + bin.id + '</strong> - ' + bin.location;
                if (index === 0) modalHTML += ' <span style="background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; margin-left: 10px;">NEAREST</span>';
                modalHTML += '<br>Fill: ' + bin.fill + '% | Distance: ' + bin.distance.toFixed(1) + ' km';
                modalHTML += '<br><button class="btn btn-danger btn-sm" style="margin-top: 5px;" onclick="assignSingleBin(\\'' + driverId + '\\', \\'' + bin.id + '\\')">Assign This Bin</button>';
                modalHTML += '</div>';
            });
        }
        
        // Warning Bins
        if (warningBins.length > 0) {
            modalHTML += '<h4 style="color: #f59e0b;">⚠️ High Priority</h4>';
            warningBins.slice(0, 3).forEach(bin => {
                modalHTML += '<div style="background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; padding: 10px; margin: 10px 0; border-radius: 8px;">';
                modalHTML += '<strong>' + bin.id + '</strong> - ' + bin.location;
                modalHTML += '<br>Fill: ' + bin.fill + '% | Distance: ' + bin.distance.toFixed(1) + ' km';
                modalHTML += '<br><button class="btn btn-warning btn-sm" style="margin-top: 5px;" onclick="assignSingleBin(\\'' + driverId + '\\', \\'' + bin.id + '\\')">Assign This Bin</button>';
                modalHTML += '</div>';
            });
        }
        
        // Normal Bins
        if (normalBins.length > 0) {
            modalHTML += '<h4 style="color: #10b981;">✓ Normal Priority</h4>';
            normalBins.slice(0, 5).forEach(bin => {
                modalHTML += '<div style="background: rgba(16, 185, 129, 0.05); border: 1px solid #10b981; padding: 10px; margin: 10px 0; border-radius: 8px;">';
                modalHTML += '<strong>' + bin.id + '</strong> - ' + bin.location;
                modalHTML += '<br>Fill: ' + bin.fill + '% | Distance: ' + bin.distance.toFixed(1) + ' km';
                modalHTML += '<br><button class="btn btn-success btn-sm" style="margin-top: 5px;" onclick="assignSingleBin(\\'' + driverId + '\\', \\'' + bin.id + '\\')">Assign This Bin</button>';
                modalHTML += '</div>';
            });
        }
        
        modalHTML += '</div>';
        
        // Show in modal
        const modal = document.getElementById('customModal');
        const modalBody = document.getElementById('modalBody');
        if (modal && modalBody) {
            modalBody.innerHTML = modalHTML;
            modal.style.display = 'flex';
        } else {
            // Fallback to alert if modal not found
            alert('Bins available for assignment:\\n' + 
                  'Critical: ' + criticalBins.length + '\\n' + 
                  'Warning: ' + warningBins.length + '\\n' + 
                  'Normal: ' + normalBins.length);
        }
    };
    
    // Function to assign a single bin
    window.assignSingleBin = function(driverId, binId) {
        const driver = dataManager.getUserById(driverId);
        const bin = dataManager.getBinById(binId);
        
        if (!driver || !bin) {
            alert('Error: Driver or bin not found');
            return;
        }
        
        // Create route
        const route = {
            id: 'ROUTE-' + Date.now(),
            driverId: driverId,
            binId: binId,
            status: 'assigned',
            assignedAt: new Date().toISOString()
        };
        
        // Store route
        const existingRoutes = JSON.parse(localStorage.getItem('driverRoutes_' + driverId) || '[]');
        existingRoutes.push(route);
        localStorage.setItem('driverRoutes_' + driverId, JSON.stringify(existingRoutes));
        
        // Update bin
        bin.assignedTo = driverId;
        dataManager.updateBin(binId, bin);
        
        alert('Bin ' + binId + ' assigned to ' + driver.name);
        
        // Close modal
        const modal = document.getElementById('customModal');
        if (modal) modal.style.display = 'none';
        
        // Refresh map
        if (window.mapManager) {
            mapManager.loadBinsOnMap();
        }
    };
    
    // Fix for Start Route button
    document.addEventListener('DOMContentLoaded', function() {
        // Wait a bit for everything to load
        setTimeout(function() {
            const startRouteBtn = document.getElementById('startRouteBtn');
            if (startRouteBtn) {
                // Remove existing listeners
                const newBtn = startRouteBtn.cloneNode(true);
                startRouteBtn.parentNode.replaceChild(newBtn, startRouteBtn);
                
                // Add new listener
                newBtn.addEventListener('click', function() {
                    const currentUser = authManager.getCurrentUser();
                    if (!currentUser) return;
                    
                    const isStarting = this.textContent.includes('Start');
                    
                    if (isStarting) {
                        // Start route
                        this.innerHTML = '<i class="fas fa-stop-circle" style="font-size: 1.5rem;"></i><span>End Route</span>';
                        this.classList.remove('btn-success');
                        this.classList.add('btn-danger');
                        
                        // Update driver data
                        currentUser.movementStatus = 'on-route';
                        dataManager.updateUser(currentUser.id, {
                            movementStatus: 'on-route',
                            lastStatusUpdate: new Date().toISOString()
                        });
                        
                        // Force update location timestamp
                        const location = dataManager.getDriverLocation(currentUser.id);
                        if (location) {
                            dataManager.updateDriverLocation(currentUser.id, location.lat, location.lng);
                        }
                        
                        // Update map
                        if (window.mapManager && mapManager.updateDriverStatus) {
                            mapManager.updateDriverStatus(currentUser.id, 'on-route');
                        }
                        
                        // Update status text
                        const statusElement = document.querySelector('#driverStatusIndicator');
                        if (statusElement) {
                            statusElement.textContent = 'On Route';
                            statusElement.style.color = '#f59e0b';
                        }
                        
                        alert('Route started! Your status is now "On Route"');
                    } else {
                        // End route
                        this.innerHTML = '<i class="fas fa-play-circle" style="font-size: 1.5rem;"></i><span>Start Route</span>';
                        this.classList.remove('btn-danger');
                        this.classList.add('btn-success');
                        
                        // Update driver data
                        currentUser.movementStatus = 'active';
                        dataManager.updateUser(currentUser.id, {
                            movementStatus: 'active',
                            lastStatusUpdate: new Date().toISOString()
                        });
                        
                        // Update map
                        if (window.mapManager && mapManager.updateDriverStatus) {
                            mapManager.updateDriverStatus(currentUser.id, 'active');
                        }
                        
                        // Update status text
                        const statusElement = document.querySelector('#driverStatusIndicator');
                        if (statusElement) {
                            statusElement.textContent = 'Online';
                            statusElement.style.color = '#10b981';
                        }
                        
                        alert('Route ended. Your status is now "Active"');
                    }
                });
            }
        }, 1000);
    });
    
    console.log('Driver route fixes applied inline');
})();
</script>`;

    fs.writeFileSync('inline-fix.html', inlineScript);
    console.log('✅ inline-fix.html created!\n');
};

// Fix 3: Create test script
const createTestScript = () => {
    console.log('🧪 Creating test script...');
    
    const testScript = `// test-driver-status.js - Test script to verify driver status updates

// Test 1: Check if mapManager exists
console.log('Test 1: mapManager exists?', typeof mapManager !== 'undefined');

// Test 2: Check current driver status
if (authManager && authManager.getCurrentUser()) {
    const user = authManager.getCurrentUser();
    console.log('Test 2: Current user:', user.name, 'Status:', user.movementStatus || 'active');
}

// Test 3: Check updateDriverStatus function
if (mapManager && mapManager.updateDriverStatus) {
    console.log('Test 3: updateDriverStatus function exists');
} else {
    console.log('Test 3: ERROR - updateDriverStatus function missing!');
}

// Test 4: Check driver location
if (authManager && authManager.getCurrentUser()) {
    const location = dataManager.getDriverLocation(authManager.getCurrentUser().id);
    console.log('Test 4: Driver location:', location);
}

// Test 5: Force status update
function forceStatusUpdate(status) {
    const user = authManager.getCurrentUser();
    if (!user) {
        console.log('No user logged in');
        return;
    }
    
    console.log('Forcing status to:', status);
    
    // Update in dataManager
    dataManager.updateUser(user.id, {
        movementStatus: status,
        lastStatusUpdate: new Date().toISOString()
    });
    
    // Update location timestamp
    const location = dataManager.getDriverLocation(user.id);
    if (location) {
        dataManager.updateDriverLocation(user.id, location.lat, location.lng);
    }
    
    // Update on map
    if (mapManager && mapManager.updateDriverStatus) {
        mapManager.updateDriverStatus(user.id, status);
    }
    
    console.log('Status update complete');
}

// Make function available globally
window.forceStatusUpdate = forceStatusUpdate;

console.log('=== Driver Status Test Complete ===');
console.log('To force status update, run: forceStatusUpdate("on-route") or forceStatusUpdate("active")');`;

    fs.writeFileSync('test-driver-status.js', testScript);
    console.log('✅ test-driver-status.js created!\n');
};

// Run all fixes
console.log('🔄 Applying direct fixes for driver functionality...\n');

try {
    fixMapManager();
    createInlineScript();
    createTestScript();
    
    console.log('====================================');
    console.log('✅ DIRECT FIXES APPLIED!');
    console.log('====================================\n');
    console.log('📋 Next Steps:\n');
    console.log('1. The map-manager.js has been directly fixed');
    console.log('2. Open inline-fix.html and copy the <script> content');
    console.log('3. Paste it into your index.html before </body>');
    console.log('4. Add test-driver-status.js to your index.html:');
    console.log('   <script src="test-driver-status.js"></script>');
    console.log('\n5. Refresh browser and open console');
    console.log('6. Login as driver and check console for test results');
    console.log('7. Try clicking "Start Route" - you should see alerts');
    console.log('8. In console, run: forceStatusUpdate("on-route")');
    console.log('\n🚨 If still not working, check console for errors!');
    console.log('====================================\n');
} catch (error) {
    console.error('❌ Error applying fixes:', error);
}