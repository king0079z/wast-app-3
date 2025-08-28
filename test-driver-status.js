// test-driver-status.js - Test script to verify driver status updates

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
console.log('To force status update, run: forceStatusUpdate("on-route") or forceStatusUpdate("active")');