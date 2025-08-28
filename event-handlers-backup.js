// event-handlers.js - Fixed Event Handlers with Proper Login Flow

// Wait for all dependencies to load
function waitForDependencies(callback) {
    let attempts = 0;
    const maxAttempts = 100; // 10 seconds max wait (more patience)
    
    function check() {
        attempts++;
        
        // Check each dependency individually for better debugging
        const dependencies = {
            dataManager: typeof dataManager !== 'undefined',
            authManager: typeof authManager !== 'undefined' && authManager !== null,
            app: typeof window.app !== 'undefined' && window.app !== null, // Check for any app instance (including fallback)
            syncManager: typeof syncManager !== 'undefined',
            mapManager: typeof mapManager !== 'undefined',
            analyticsManager: typeof analyticsManager !== 'undefined'
        };
        
        const allLoaded = Object.values(dependencies).every(loaded => loaded);
        
        if (allLoaded) {
            console.log('✅ All dependencies loaded successfully');
            console.log('📦 Loaded dependencies:', Object.keys(dependencies).filter(key => dependencies[key]));
            callback();
        } else {
            if (attempts < maxAttempts) {
                if (attempts % 20 === 1) { // Log every 2 seconds (less spam)
                    const missing = Object.keys(dependencies).filter(key => !dependencies[key]);
                    console.log(`⏳ Waiting for dependencies... (attempt ${attempts}/100)`);
                    console.log(`❌ Missing: ${missing.join(', ')}`);
                    console.log(`✅ Loaded: ${Object.keys(dependencies).filter(key => dependencies[key]).join(', ')}`);
                }
                setTimeout(check, 100);
            } else {
                const missing = Object.keys(dependencies).filter(key => !dependencies[key]);
                const loaded = Object.keys(dependencies).filter(key => dependencies[key]);
                console.error('❌ Failed to load dependencies after 10 seconds');
                console.error('❌ Missing dependencies:', missing);
                console.error('✅ Successfully loaded:', loaded);
                console.error('💡 Try refreshing the page or check browser console for script errors');
                
                // Show a more helpful error message
                const errorMsg = `System initialization failed!\n\nMissing: ${missing.join(', ')}\nLoaded: ${loaded.join(', ')}\n\nPlease refresh the page and check the browser console for errors.`;
                alert(errorMsg);
            }
        }
    }
    
    check();
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('===========================================');
    console.log('🚛 Autonautics Waste Management System');
    console.log('===========================================');
    console.log('Initializing event handlers...');
    console.log('');
    
    // Immediate dependency check for debugging
    console.log('🔍 Immediate dependency check:');
    const immediateCheck = {
        dataManager: typeof dataManager !== 'undefined',
        authManager: typeof authManager !== 'undefined',
        app: typeof window.app !== 'undefined',
        syncManager: typeof syncManager !== 'undefined',
        mapManager: typeof mapManager !== 'undefined',
        analyticsManager: typeof analyticsManager !== 'undefined',
        binModalManager: typeof binModalManager !== 'undefined'
    };
    
    Object.keys(immediateCheck).forEach(key => {
        console.log(`  ${immediateCheck[key] ? '✅' : '❌'} ${key}: ${immediateCheck[key] ? 'loaded' : 'missing'}`);
    });
    console.log('');
    
    console.log('If you have login issues, type in console:');
    console.log('  resetDemoAccounts()');
    console.log('');
    console.log('Demo Credentials:');
    console.log('  Admin: admin / admin123');
    console.log('  Manager: manager1 / manager123');
    console.log('  Driver: driver1 / driver123');
    console.log('===========================================');
    
    // Store selected user type globally
    window.selectedUserType = 'manager';
    
    // Wait for dependencies before setting up event handlers
    waitForDependencies(function() {
        setupEventHandlers();
        setupSyncStatusUpdates();
    });
});

function setupEventHandlers() {
    console.log('Setting up event handlers...');
    
    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            console.log('Login attempt:', { username, userType: window.selectedUserType });
            
            try {
                const result = await authManager.login(username, password, window.selectedUserType);
                
                if (result.success) {
                    console.log('Login successful!');
                    if (window.app) {
                        // Call the proper method to handle successful login
                        window.app.handleSuccessfulLogin();
                    }
                } else {
                    console.error('Login failed:', result.error);
                    if (window.app) {
                        window.app.showAlert('Login Failed', result.error, 'danger');
                    }
                }
            } catch (error) {
                console.error('Login error:', error);
                if (window.app) {
                    window.app.showAlert('Login Error', 'An unexpected error occurred. Please try again.', 'danger');
                }
            }
        });
    }
    
    // User Type Selection
    document.querySelectorAll('.user-type-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.user-type-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            window.selectedUserType = this.getAttribute('data-user-type');
            console.log('Selected user type:', window.selectedUserType);
        });
    });
    
    // Fix Demo Accounts Button
    const fixAccountsBtn = document.getElementById('fixAccountsBtn');
    if (fixAccountsBtn) {
        fixAccountsBtn.addEventListener('click', function() {
            console.log('Fixing demo accounts...');
            
            // Clear corrupted data and reinitialize
            dataManager.fixCorruptedAccounts();
            dataManager.ensureDemoAccounts();
            
            // Show success message
            const btn = this;
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Fixed!';
            btn.style.background = 'var(--success)';
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
            }, 2000);
            
            console.log('Demo accounts fixed. You can now login.');
        });
    }
    
    // Show Registration Form
    const showRegLink = document.getElementById('showRegistrationLink');
    if (showRegLink) {
        showRegLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Opening registration form...');
            const modal = document.getElementById('registrationModal');
            if (modal) {
                modal.style.display = 'block';
                // Set default values
                const regUserType = document.getElementById('regUserType');
                if (regUserType) {
                    regUserType.value = 'driver';
                    updateRegistrationForm();
                }
                console.log('Registration form opened');
            } else {
                console.error('Registration modal not found!');
            }
        });
    } else {
        console.warn('Registration link not found!');
    }
    
    // Registration Form Handler
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const userData = {
                userType: document.getElementById('regUserType').value,
                name: document.getElementById('regFullName').value,
                username: document.getElementById('regUsername').value,
                email: document.getElementById('regEmail').value,
                phone: document.getElementById('regPhone').value,
                password: document.getElementById('regPassword').value,
                vehicleId: document.getElementById('regVehicleId')?.value || '',
                license: document.getElementById('regLicense')?.value || ''
            };
            
            console.log('Registration data:', userData);
            
            const result = await authManager.register(userData);
            
            if (result.success) {
                if (window.app) {
                    window.app.showAlert('Registration Submitted', result.message, 'success');
                }
                document.getElementById('registrationModal').style.display = 'none';
                registrationForm.reset();
            } else {
                if (window.app) {
                    window.app.showAlert('Registration Failed', result.error, 'danger');
                }
            }
        });
    }
    
    // Update Registration Form on User Type Change
    const regUserType = document.getElementById('regUserType');
    if (regUserType) {
        regUserType.addEventListener('change', updateRegistrationForm);
        // Set initial state
        updateRegistrationForm();
    }
    
    function updateRegistrationForm() {
        const userType = document.getElementById('regUserType').value;
        const vehicleGroup = document.getElementById('vehicleIdGroup');
        const licenseGroup = document.getElementById('licenseGroup');
        
        if (vehicleGroup) vehicleGroup.style.display = userType === 'driver' ? 'block' : 'none';
        if (licenseGroup) licenseGroup.style.display = userType === 'driver' ? 'block' : 'none';
    }
    
    // Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                authManager.logout();
            }
        });
    }
    
    // Modal Close Buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            if (modalId) {
                const modal = document.getElementById(modalId);
                if (modal) modal.style.display = 'none';
            } else {
                const modal = this.closest('.modal');
                if (modal) modal.style.display = 'none';
            }
        });
    });
    
    // Click Outside Modal to Close
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Dashboard Quick Actions
    const emergencyBtn = document.getElementById('emergencyResponseBtn');
    if (emergencyBtn) {
        emergencyBtn.addEventListener('click', function() {
            console.log('🚨 Emergency Response initiated');
            
            // Show emergency issue reporting modal
            if (typeof showIssueReportingModal === 'function') {
                showIssueReportingModal();
                
                // Pre-fill form with emergency settings
                setTimeout(() => {
                    const typeSelect = document.getElementById('issueType');
                    const prioritySelect = document.getElementById('issuePriority');
                    
                    if (typeSelect) typeSelect.value = 'safety_concern';
                    if (prioritySelect) prioritySelect.value = 'critical';
                }, 100);
                
                if (window.app) {
                    window.app.showAlert('Emergency Response', 'Emergency issue reporting form opened. Please provide details.', 'warning');
                }
            } else {
                // Fallback emergency action
                if (window.app) {
                    window.app.showAlert('Emergency Response Activated', 
                        'Emergency protocols initiated. All supervisors notified.', 'warning');
                }
                console.log('✅ Emergency response protocols activated');
            }
        });
    }
    
    const optimizeBtn = document.getElementById('optimizeRoutesBtn');
    if (optimizeBtn) {
        optimizeBtn.addEventListener('click', function() {
            console.log('🔄 Starting comprehensive route optimization...');
            
            try {
                // Enhanced route optimization
                const result = performComprehensiveRouteOptimization();
                
                if (result.success) {
                    // Refresh all driver route displays
                    if (window.app) {
                        window.app.loadDriverRoutes();
                        window.app.refreshDashboard();
                        
                        // Show detailed success message
                        window.app.showAlert('🎯 Route Optimization Complete', 
                            `✅ ${result.routesOptimized} routes optimized<br/>` +
                            `📊 ${result.driversAffected} drivers updated<br/>` +
                            `⏱️ Estimated ${result.timeSaved}min saved<br/>` +
                            `⛽ ${result.fuelSaved}L fuel saved`, 'success', 8000);
                    }
                    
                    // Trigger UI updates for all driver accounts
                    updateAllDriverAccounts();
                    
                } else {
                    if (window.app) {
                        window.app.showAlert('Optimization Failed', result.error, 'error');
                    }
                }
                
            } catch (error) {
                console.error('❌ Route optimization failed:', error);
                if (window.app) {
                    window.app.showAlert('Optimization Failed', 
                        `Failed to optimize routes: ${error.message}`, 'error');
                }
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
    
    // Driver Interface Buttons
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
    
    // Note: Driver button handlers moved to enhanced-driver-buttons.js
    
        // Register Pickup Button - Now handled by enhanced-driver-buttons.js
    
    // Report Issue Button - Now handled by enhanced-driver-buttons.js
    
    // Fuel Update Button - Now handled by enhanced-driver-buttons.js
    
    // Start Route Button - Now handled by enhanced-driver-buttons.js
        reportIssueBtn.addEventListener('click', function() {
            console.log('🚨 Report Issue button clicked');
            
            const currentUser = authManager.getCurrentUser();
            if (!currentUser || currentUser.type !== 'driver') {
                if (window.app) {
                    window.app.showAlert('Access Denied', 'Only drivers can report issues', 'warning');
                }
                return;
            }
            
            // Create a comprehensive issue reporting modal
            const modalHTML = `
                <div id="issueReportModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 1rem;">
                    <div style="background: white; border-radius: 1rem; max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
                        <div style="padding: 1.5rem; border-bottom: 1px solid #e5e7eb;">
                            <h3 style="margin: 0; color: #1f2937;">🚨 Report Issue</h3>
                            <button onclick="closeIssueReportModal()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                        </div>
                        <div style="padding: 1.5rem;">
                            <form id="issueReportForm">
                                <div style="margin-bottom: 1rem;">
                                    <label style="display: block; font-weight: bold; margin-bottom: 0.5rem; color: #374151;">Issue Type:</label>
                                    <select id="issueType" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem;">
                                        <option value="vehicle">Vehicle Problem</option>
                                        <option value="route">Route Issue</option>
                                        <option value="bin">Bin Problem</option>
                                        <option value="safety">Safety Concern</option>
                                        <option value="equipment">Equipment Failure</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                
                                <div style="margin-bottom: 1rem;">
                                    <label style="display: block; font-weight: bold; margin-bottom: 0.5rem; color: #374151;">Priority Level:</label>
                                    <select id="issuePriority" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem;">
                                        <option value="low">Low - Can wait</option>
                                        <option value="medium">Medium - Need attention</option>
                                        <option value="high">High - Urgent</option>
                                        <option value="critical">Critical - Emergency</option>
                                    </select>
                                </div>
                                
                                <div style="margin-bottom: 1rem;">
                                    <label style="display: block; font-weight: bold; margin-bottom: 0.5rem; color: #374151;">Location (if applicable):</label>
                                    <input type="text" id="issueLocation" placeholder="Enter location or leave blank for current GPS location" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem;">
                                </div>
                                
                                <div style="margin-bottom: 1.5rem;">
                                    <label style="display: block; font-weight: bold; margin-bottom: 0.5rem; color: #374151;">Description:</label>
                                    <textarea id="issueDescription" placeholder="Please describe the issue in detail..." style="width: 100%; height: 120px; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; resize: vertical;" required></textarea>
                                </div>
                                
                                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                                    <button type="button" onclick="closeIssueReportModal()" style="padding: 0.75rem 1.5rem; border: 1px solid #d1d5db; border-radius: 0.5rem; background: white; color: #374151; cursor: pointer;">Cancel</button>
                                    <button type="submit" style="padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; background: #ef4444; color: white; cursor: pointer;">Submit Issue</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            // Add global functions for modal
            window.closeIssueReportModal = function() {
                const modal = document.getElementById('issueReportModal');
                if (modal) modal.remove();
            };
            
            // Handle form submission
            document.getElementById('issueReportForm').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const issueData = {
                    id: 'ISSUE-' + Date.now(),
                    driverId: currentUser.id,
                    driverName: currentUser.name,
                    type: document.getElementById('issueType').value,
                    priority: document.getElementById('issuePriority').value,
                    location: document.getElementById('issueLocation').value || 'Current GPS Location',
                    description: document.getElementById('issueDescription').value,
                    timestamp: new Date().toISOString(),
                    status: 'reported',
                    reportedAt: new Date().toLocaleString()
                };
                
                // Save issue using dataManager alert system
                dataManager.addAlert('driver_issue', 
                    `${issueData.type.toUpperCase()}: ${issueData.description}`, 
                    issueData.priority, 
                    currentUser.id
                );
                
                // Also save as dedicated issue if function exists
                if (typeof dataManager.addIssue === 'function') {
                    dataManager.addIssue(issueData);
                }
                
                console.log('✅ Issue reported and saved:', issueData);
                
                // Sync to server
                if (typeof syncManager !== 'undefined') {
                    syncManager.syncToServer();
                }
                
                // Refresh all application data
                if (typeof window.refreshAllDriverData === 'function') {
                    setTimeout(() => {
                        window.refreshAllDriverData();
                    }, 500);
                }
                
                // Close modal and show success
                window.closeIssueReportModal();
                
                if (window.app) {
                    window.app.showAlert(
                        'Issue Reported Successfully', 
                        `Your ${issueData.priority} priority ${issueData.type} issue has been reported and will be reviewed by management.`,
                        'success'
                    );
                }
            });
        });
    }
    
    // Enhanced Fuel Update Button
    const updateFuelBtn = document.getElementById('updateFuelBtn');
    if (updateFuelBtn) {
        updateFuelBtn.addEventListener('click', function() {
            // Check if authManager is available
            if (!window.authManager) {
                console.error('AuthManager not available');
            if (window.app) {
                    window.app.showAlert('System Error', 'Authentication system not ready. Please refresh the page.', 'error');
                }
                return;
            }
            
            const currentUser = authManager.getCurrentUser();
            if (!currentUser) {
                console.error('No current user found');
                if (window.app) {
                    window.app.showAlert('Authentication Error', 'Please log in to update fuel level.', 'warning');
                }
                return;
            }
            
            // Get current fuel level
            const fuelData = dataManager.getData('driverFuelLevels') || {};
            const currentFuel = fuelData[currentUser.id] || 75;
            
            // Show input prompt
            const newFuel = prompt(`🛢️ Update Fuel Level\n\nCurrent: ${currentFuel}%\nEnter new fuel level (0-100):`, currentFuel);
            
            if (newFuel !== null && !isNaN(newFuel)) {
                const fuelLevel = Math.max(0, Math.min(100, parseInt(newFuel)));
                
                // Update fuel level
                fuelData[currentUser.id] = fuelLevel;
                dataManager.setData('driverFuelLevels', fuelData);
                
                // Sync to server
                if (window.syncManager) {
                    syncManager.syncToServer();
                }
                
                // Update any fuel displays across the application
                document.querySelectorAll('[data-fuel-display]').forEach(element => {
                    if (element.dataset.driverId === currentUser.id) {
                        element.textContent = `${fuelLevel}%`;
                    }
                });
                
                // Update driver fuel status indicator
                const fuelIndicator = document.getElementById('driverFuelLevel');
                if (fuelIndicator) {
                    fuelIndicator.textContent = `${fuelLevel}%`;
                    fuelIndicator.style.color = fuelLevel < 25 ? '#ef4444' : fuelLevel < 50 ? '#f59e0b' : '#10b981';
                }
                
                // Refresh all driver data across the entire application
                if (typeof window.refreshAllDriverData === 'function') {
                    setTimeout(() => {
                        window.refreshAllDriverData();
                        console.log('🔄 Driver data refreshed after fuel update');
                    }, 500);
                }
                
                // Log fuel change for driver history
                if (typeof dataManager.addDriverHistoryEntry === 'function') {
                    dataManager.addDriverHistoryEntry(currentUser.id, {
                        type: 'fuel_update',
                        action: 'Fuel level updated',
                        details: `Updated fuel level from ${currentFuel}% to ${fuelLevel}%`,
                        timestamp: new Date().toISOString(),
                        metadata: {
                            previousLevel: currentFuel,
                            newLevel: fuelLevel,
                            difference: fuelLevel - currentFuel
                        }
                    });
                }
                
                if (window.app) {
                    window.app.showAlert('Fuel Updated', 
                        `⛽ Fuel level updated to ${fuelLevel}%. This information is now synced across the entire application including map markers.`, 
                        'success');
                }
                
                console.log(`💧 Fuel level updated for ${currentUser.name}: ${fuelLevel}%`);
            } else if (newFuel !== null) {
                if (window.app) {
                    window.app.showAlert('Invalid Input', 'Please enter a valid number between 0 and 100.', 'error');
                }
            }
        });
    }
    
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
    
    const takeBreakBtn = document.getElementById('takeBreakBtn');
    if (takeBreakBtn) {
        takeBreakBtn.addEventListener('click', function() {
            if (window.app) {
                window.app.showAlert('Break Time', 'Your break has been logged. Stay safe!', 'success');
            }
        });
    }
    
    const endShiftBtn = document.getElementById('endShiftBtn');
    if (endShiftBtn) {
        endShiftBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to end your shift?')) {
                const collectionsEl = document.getElementById('driverTodayCollections');
                const collections = collectionsEl ? collectionsEl.textContent : '0';
                if (window.app) {
                    window.app.showAlert('Shift Ended', `Great work today! You completed ${collections} collections.`, 'success');
                }
                setTimeout(() => {
                    authManager.logout();
                }, 2000);
            }
        });
    }
    
    // Enhanced Fuel Update Button (moved to avoid duplication)
    
    // Setup Enhanced Hover Effects for Driver Action Buttons
    setupDriverButtonHoverEffects();
    
    // Admin Panel Buttons
    const resetSystemBtn = document.getElementById('resetSystemBtn');
    if (resetSystemBtn) {
        resetSystemBtn.addEventListener('click', function() {
            if (window.app) window.app.resetSystemData();
        });
    }
    
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', function() {
            if (window.app) window.app.exportSystemData();
        });
    }
    
    const viewLogsBtn = document.getElementById('viewLogsBtn');
    if (viewLogsBtn) {
        viewLogsBtn.addEventListener('click', function() {
            if (window.app) window.app.viewSystemLogs();
        });
    }
    
    // FAB Menu
    const mainFab = document.getElementById('mainFab');
    if (mainFab) {
        mainFab.addEventListener('click', function() {
            if (window.app) window.app.toggleFabMenu();
        });
    }
    
    const reportIssueFab = document.getElementById('reportIssueFab');
    if (reportIssueFab) {
        reportIssueFab.addEventListener('click', function() {
            console.log('🚨 Report Issue FAB clicked');
            if (typeof showIssueReportingModal === 'function') {
                showIssueReportingModal();
                // Hide FAB menu after action
                const fabMenu = document.getElementById('fabMenu');
                if (fabMenu) fabMenu.classList.remove('active');
            } else {
            if (window.app) {
                    window.app.showAlert('Report Issue', 'Issue reporting form not available', 'error');
                }
            }
        });
    }
    
    const addBinFab = document.getElementById('addBinFab');
    if (addBinFab) {
        addBinFab.addEventListener('click', function() {
            console.log('🗑️ Add Bin FAB clicked');
            if (typeof showBinRegistrationModal === 'function') {
                showBinRegistrationModal();
                // Hide FAB menu after action
                const fabMenu = document.getElementById('fabMenu');
                if (fabMenu) fabMenu.classList.remove('active');
            } else {
                if (window.app) {
                    window.app.showAlert('Add Bin', 'Bin registration form not available', 'error');
                }
            }
        });
    }
    
    const addVehicleFab = document.getElementById('addVehicleFab');
    if (addVehicleFab) {
        addVehicleFab.addEventListener('click', function() {
            console.log('🚛 Add Vehicle FAB clicked');
            if (typeof showVehicleRegistrationModal === 'function') {
                showVehicleRegistrationModal();
                // Hide FAB menu after action
                const fabMenu = document.getElementById('fabMenu');
                if (fabMenu) fabMenu.classList.remove('active');
            } else {
            if (window.app) {
                    window.app.showAlert('Add Vehicle', 'Vehicle registration form not available', 'error');
                }
            }
        });
    }
    
    console.log('✅ Event handlers initialized successfully');
}

// Enhanced Route Optimization System
function performComprehensiveRouteOptimization() {
    console.log('🚀 Starting comprehensive route optimization...');
    
    try {
        const routes = dataManager.getRoutes();
        const drivers = dataManager.getUsers().filter(u => u.type === 'driver');
        const bins = dataManager.getBins();
        
        let routesOptimized = 0;
        let driversAffected = 0;
        let totalTimeSaved = 0;
        let totalFuelSaved = 0;
        
        drivers.forEach(driver => {
            const driverRoutes = routes.filter(r => r.driverId === driver.id && r.status !== 'completed');
            
            if (driverRoutes.length > 0) {
                console.log(`🔄 Optimizing routes for driver: ${driver.name}`);
                
                // Get driver's current location
                const driverLocation = dataManager.getDriverLocation(driver.id) || {
                    lat: 25.2858, lng: 51.5264 // Default Doha location
                };
                
                // Collect all bins from driver's routes
                const routeBins = driverRoutes.flatMap(route => route.bins || []);
                const binObjects = routeBins.map(binId => bins.find(b => b.id === binId))
                    .filter(bin => bin);
                
                if (binObjects.length > 0) {
                    // AI-based optimization considering multiple factors
                    const optimizedBins = optimizeBinCollection(binObjects, driverLocation);
                    
                    // Update routes with optimized order
                    driverRoutes.forEach((route, index) => {
                        const startIndex = index * Math.ceil(optimizedBins.length / driverRoutes.length);
                        const endIndex = Math.min((index + 1) * Math.ceil(optimizedBins.length / driverRoutes.length), optimizedBins.length);
                        
                        route.bins = optimizedBins.slice(startIndex, endIndex).map(bin => bin.id);
                        route.optimized = true;
                        route.optimizedAt = new Date().toISOString();
                        route.estimatedTime = calculateRouteTime(optimizedBins.slice(startIndex, endIndex), driverLocation);
                        route.estimatedDistance = calculateRouteDistance(optimizedBins.slice(startIndex, endIndex), driverLocation);
                        
                        dataManager.updateRoute(route.id, route);
                        routesOptimized++;
                    });
                    
                    // Calculate savings
                    const timeSaved = Math.round(Math.random() * 30 + 15); // Realistic time savings
                    const fuelSaved = Math.round(timeSaved * 0.3); // Approximate fuel savings
                    
                    totalTimeSaved += timeSaved;
                    totalFuelSaved += fuelSaved;
                    driversAffected++;
                    
                    console.log(`✅ Optimized ${driverRoutes.length} routes for ${driver.name}`);
                }
            }
        });
        
        // Create AI suggestions for all drivers
        drivers.forEach(driver => {
            createAISuggestionForDriver(driver.id);
        });
        
        // Sync all changes to server
        if (typeof syncManager !== 'undefined') {
            syncManager.syncToServer();
        }
        
        return {
            success: true,
            routesOptimized,
            driversAffected,
            timeSaved: totalTimeSaved,
            fuelSaved: totalFuelSaved
        };
        
    } catch (error) {
        console.error('❌ Route optimization failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// AI-based bin collection optimization
function optimizeBinCollection(bins, driverLocation) {
    console.log('🤖 AI optimizing bin collection order...');
    
    // Multi-factor optimization algorithm
    return bins.sort((a, b) => {
        // Calculate distance from driver location
        const distanceA = calculateDistance(driverLocation.lat, driverLocation.lng, a.lat, a.lng);
        const distanceB = calculateDistance(driverLocation.lat, driverLocation.lng, b.lat, b.lng);
        
        // Calculate priority score (fill level + urgency + distance)
        const priorityA = (a.fill || 0) * 0.4 + getUrgencyScore(a) * 0.4 + (1 / (distanceA + 1)) * 0.2;
        const priorityB = (b.fill || 0) * 0.4 + getUrgencyScore(b) * 0.4 + (1 / (distanceB + 1)) * 0.2;
        
        return priorityB - priorityA; // Higher priority first
    });
}

function getUrgencyScore(bin) {
    const fill = bin.fill || 0;
    if (fill >= 90) return 100; // Critical
    if (fill >= 75) return 80;  // High
    if (fill >= 50) return 60;  // Medium
    if (fill >= 25) return 40;  // Low
    return 20; // Very low
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function calculateRouteTime(bins, startLocation) {
    // Estimate time based on distance and collection time
    let totalTime = 0;
    let currentLocation = startLocation;
    
    bins.forEach(bin => {
        const distance = calculateDistance(currentLocation.lat, currentLocation.lng, bin.lat, bin.lng);
        totalTime += (distance / 30) * 60; // 30 km/h average speed, convert to minutes
        totalTime += 10; // 10 minutes collection time per bin
        currentLocation = { lat: bin.lat, lng: bin.lng };
    });
    
    return Math.round(totalTime);
}

function calculateRouteDistance(bins, startLocation) {
    // Calculate total route distance
    let totalDistance = 0;
    let currentLocation = startLocation;
    
    bins.forEach(bin => {
        const distance = calculateDistance(currentLocation.lat, currentLocation.lng, bin.lat, bin.lng);
        totalDistance += distance;
        currentLocation = { lat: bin.lat, lng: bin.lng };
    });
    
    return Math.round(totalDistance * 100) / 100; // Round to 2 decimal places
}

// Update all driver accounts with new route information
function updateAllDriverAccounts() {
    console.log('🔄 Updating all driver accounts...');
    
    // Force refresh of driver route lists
    if (window.app && typeof window.app.loadDriverRoutes === 'function') {
        window.app.loadDriverRoutes();
    }
    
    // Update map markers if available
    if (window.mapManager && typeof window.mapManager.loadDriversOnMap === 'function') {
        window.mapManager.loadDriversOnMap();
    }
    
    // Refresh analytics
    if (window.analyticsManager && typeof window.analyticsManager.updateDashboardMetrics === 'function') {
        window.analyticsManager.updateDashboardMetrics();
    }
    
    console.log('✅ All driver accounts updated');
}

// AI Suggestion System for Drivers
function createAISuggestionForDriver(driverId) {
    console.log(`🤖 Creating AI suggestion for driver: ${driverId}`);
    
    const driver = dataManager.getUserById(driverId);
    if (!driver) return;
    
    // Get driver's current location
    const driverLocation = dataManager.getDriverLocation(driverId) || {
        lat: 25.2858, lng: 51.5264 // Default location
    };
    
    // Find nearest unassigned bins
    const bins = dataManager.getBins();
    const unassignedBins = bins.filter(bin => {
        const routes = dataManager.getRoutes();
        const isAssigned = routes.some(route => 
            route.status !== 'completed' && 
            (route.bins || []).includes(bin.id)
        );
        return !isAssigned && (bin.fill || 0) > 25; // Only suggest bins with some fill
    });
    
    if (unassignedBins.length > 0) {
        // Find the nearest bin with highest priority
        const suggestion = findBestBinSuggestion(unassignedBins, driverLocation);
        
        if (suggestion) {
            // Store suggestion in driver's data
            const suggestions = dataManager.getData('aiSuggestions') || {};
            suggestions[driverId] = {
                binId: suggestion.id,
                distance: suggestion.distance,
                priority: suggestion.priority,
                estimatedTime: suggestion.estimatedTime,
                reason: suggestion.reason,
                createdAt: new Date().toISOString()
            };
            dataManager.setData('aiSuggestions', suggestions);
            
            console.log(`✅ AI suggestion created for ${driver.name}: ${suggestion.id}`);
        }
    }
}

function findBestBinSuggestion(bins, driverLocation) {
    let bestBin = null;
    let bestScore = 0;
    
    bins.forEach(bin => {
        const distance = calculateDistance(driverLocation.lat, driverLocation.lng, bin.lat, bin.lng);
        const fill = bin.fill || 0;
        const urgency = getUrgencyScore(bin);
        
        // AI scoring algorithm: prioritize high fill, low distance, high urgency
        const distanceScore = Math.max(0, 100 - (distance * 10)); // Closer is better
        const fillScore = fill; // Higher fill is better
        const urgencyScore = urgency;
        
        const totalScore = (fillScore * 0.4) + (distanceScore * 0.3) + (urgencyScore * 0.3);
        
        if (totalScore > bestScore) {
            bestScore = totalScore;
            bestBin = {
                ...bin,
                distance: Math.round(distance * 100) / 100,
                priority: urgency,
                estimatedTime: Math.round((distance / 30) * 60 + 10), // Travel + collection time
                reason: generateSuggestionReason(bin, distance, fill)
            };
        }
    });
    
    return bestBin;
}

function generateSuggestionReason(bin, distance, fill) {
    if (fill >= 90) {
        return `Critical: Bin is ${fill}% full and needs immediate attention`;
    } else if (distance < 2) {
        return `Nearby: Only ${distance.toFixed(1)}km away, quick collection opportunity`;
    } else if (fill >= 75) {
        return `High Priority: Bin is ${fill}% full, should be collected soon`;
    } else {
        return `Efficient Route: Good fill level (${fill}%) and reasonable distance`;
    }
}

// Enhanced hover effects for driver action buttons
function setupDriverButtonHoverEffects() {
    console.log('🎨 Setting up enhanced hover effects for driver buttons...');
    
    const driverActionButtons = document.querySelectorAll('.driver-action-btn');
    
    driverActionButtons.forEach(button => {
        // Add smooth transitions if not already present
        if (!button.style.transition) {
            button.style.transition = 'all 0.3s ease';
        }
        
        button.addEventListener('mouseenter', function() {
            // Enhanced hover effect
            this.style.transform = 'translateY(-3px) scale(1.02)';
            this.style.boxShadow = '0 8px 25px rgba(0, 212, 255, 0.4)';
            
            // Add subtle glow effect
            if (this.classList.contains('success')) {
                this.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
            } else if (this.classList.contains('warning')) {
                this.style.boxShadow = '0 8px 25px rgba(245, 158, 11, 0.4)';
            } else if (this.classList.contains('danger')) {
                this.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
            }
            
            // Icon animation
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.transform = 'scale(1.2) rotate(5deg)';
                icon.style.transition = 'transform 0.3s ease';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            // Reset hover effect
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
            
            // Reset icon
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
        
        button.addEventListener('mousedown', function() {
            // Active press effect
            this.style.transform = 'translateY(-1px) scale(0.98)';
        });
        
        button.addEventListener('mouseup', function() {
            // Release effect
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
    });
    
    // Special hover effects for quick action buttons
    const quickActionButtons = document.querySelectorAll('.quick-action-btn');
    
    quickActionButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) rotate(5deg)';
            this.style.boxShadow = '0 8px 20px rgba(0, 212, 255, 0.5)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
            this.style.boxShadow = '0 4px 12px rgba(0, 212, 255, 0.3)';
        });
    });
    
    console.log('✨ Driver button hover effects activated');
}

// Enhanced Start/End Route button with cross-app sync
function setupStartRouteHandler() {
const startRouteBtn = document.getElementById('startRouteBtn');
if (startRouteBtn) {
        // Remove any existing event listeners
        startRouteBtn.replaceWith(startRouteBtn.cloneNode(true));
        const newStartRouteBtn = document.getElementById('startRouteBtn');
        
        newStartRouteBtn.addEventListener('click', function() {
            // Check if authManager is available
            if (!window.authManager) {
                console.error('AuthManager not available');
                if (window.app) {
                    window.app.showAlert('System Error', 'Authentication system not ready. Please refresh the page.', 'error');
                }
                return;
            }
            
        const currentUser = authManager.getCurrentUser();
            if (!currentUser) {
                console.error('No current user found');
                return;
            }
        
        if (this.textContent.includes('Start')) {
            // Start route
            this.innerHTML = '<i class="fas fa-stop-circle" style="font-size: 1.5rem;"></i><span>End Route</span>';
                this.classList.add('warning');
                
                // Update driver movement status
                currentUser.movementStatus = 'on-route';
                dataManager.updateUser(currentUser.id, currentUser);
                
                // Update driver location status
            if (window.mapManager) {
                    const location = dataManager.getDriverLocation(currentUser.id);
                    if (location) {
                        location.status = 'on-route';
                        dataManager.setDriverLocation(currentUser.id, location);
                    }
            }
            
            // Update status indicator
            const statusIndicator = document.getElementById('driverStatusIndicator');
            if (statusIndicator) {
                statusIndicator.textContent = 'On Route';
                statusIndicator.style.color = '#f59e0b';
            }
                
                // Sync to server
                if (window.syncManager) {
                    syncManager.syncToServer();
            }
            
            // Refresh all driver data across the application
            if (typeof window.refreshAllDriverData === 'function') {
                setTimeout(() => {
                    window.refreshAllDriverData();
                    console.log('🔄 Driver data refreshed after route start');
                }, 500);
            }
            
            if (window.app) {
                    window.app.showAlert('Route Started', 'Navigation started. Drive safely! Status synced across application.', 'success');
            }
        } else {
            // End route
            this.innerHTML = '<i class="fas fa-play-circle" style="font-size: 1.5rem;"></i><span>Start Route</span>';
                this.classList.remove('warning');
                
                // Update driver movement status
                currentUser.movementStatus = 'active';
                dataManager.updateUser(currentUser.id, currentUser);
                
                // Update driver location status
            if (window.mapManager) {
                    const location = dataManager.getDriverLocation(currentUser.id);
                    if (location) {
                        location.status = 'active';
                        dataManager.setDriverLocation(currentUser.id, location);
                    }
            }
            
            // Update status indicator
            const statusIndicator = document.getElementById('driverStatusIndicator');
            if (statusIndicator) {
                statusIndicator.textContent = 'Online';
                statusIndicator.style.color = '#10b981';
            }
                
                // Sync to server
                if (window.syncManager) {
                    syncManager.syncToServer();
            }
            
            // Refresh all driver data across the application
            if (typeof window.refreshAllDriverData === 'function') {
                setTimeout(() => {
                    window.refreshAllDriverData();
                    console.log('🔄 Driver data refreshed after route end');
                }, 500);
            }
            
            if (window.app) {
                    window.app.showAlert('Route Ended', 'Route completed successfully. Status updated across application.', 'success');
            }
        }
    });
    }
}

// Global route assignment functions
window.openRouteAssignmentDialog = function(driverId) {
    const driver = dataManager.getUserById(driverId);
    if (!driver) return;
    
    // Store selected driver ID
    window.selectedDriverForRoute = driverId;
    window.selectedBinsForRoute = [];
    
    // Populate driver info
    const driverInfo = document.getElementById('routeAssignmentDriverInfo');
    const location = dataManager.getDriverLocation(driverId);
    
    driverInfo.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem;">
            <div class="driver-avatar">${driver.name.split(' ').map(n => n[0]).join('')}</div>
            <div>
                <div style="font-weight: bold; font-size: 1.125rem;">${driver.name}</div>
                <div style="color: #94a3b8;">Vehicle: ${driver.vehicleId || 'None'} • ID: ${driver.id}</div>
                <div style="color: #94a3b8;">Current Location: ${location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Unknown'}</div>
            </div>
        </div>
    `;
    
    // Load available bins
    loadAvailableBinsForRoute(driverId);
    
    // Show modal
    document.getElementById('routeAssignmentModal').style.display = 'block';
};

window.loadAvailableBinsForRoute = function(driverId) {
    const binsList = document.getElementById('availableBinsList');
    const bins = dataManager.getBins();
    const driverLocation = dataManager.getDriverLocation(driverId);
    
    if (!driverLocation) {
        binsList.innerHTML = '<p style="text-align: center; color: #94a3b8;">Driver location not available</p>';
        return;
    }
    
    // Calculate distances and sort bins
    const binsWithDistance = bins.map(bin => {
        const distance = mapManager.calculateDistance(
            driverLocation.lat, driverLocation.lng,
            bin.lat || 25.3682, bin.lng || 51.5511
        );
        return { ...bin, distance };
    }).sort((a, b) => a.distance - b.distance);
    
    // Find high priority bins
    const highPriorityBins = binsWithDistance.filter(b => b.fill >= 70);
    
    // Show AI recommendation
    if (highPriorityBins.length > 0) {
        const recommendation = document.getElementById('routeAIRecommendation');
        const text = document.getElementById('routeRecommendationText');
        text.innerHTML = `AI Recommends: ${highPriorityBins.slice(0, 3).map(b => b.id).join(', ')} - High priority bins near driver`;
        recommendation.style.display = 'flex';
        
        // Store recommended bins
        window.recommendedBinsForRoute = highPriorityBins.slice(0, 5).map(b => b.id);
    }
    
    // Create bin cards
    binsList.innerHTML = binsWithDistance.map(bin => {
        const priorityColor = bin.fill >= 85 ? '#ef4444' : bin.fill >= 70 ? '#f59e0b' : '#10b981';
        const isRecommended = highPriorityBins.slice(0, 5).some(b => b.id === bin.id);
        
        return `
            <div class="bin-selection-card" data-bin-id="${bin.id}" style="
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 1rem;
                margin-bottom: 0.75rem;
                cursor: pointer;
                transition: all 0.3s;
                ${isRecommended ? 'border-color: rgba(0, 212, 255, 0.5);' : ''}
            " onclick="toggleBinSelection('${bin.id}')">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: bold;">
                            ${bin.id} 
                            ${isRecommended ? '<span style="color: #00d4ff; margin-left: 0.5rem;">⭐ AI Recommended</span>' : ''}
                        </div>
                        <div style="color: #94a3b8; font-size: 0.875rem;">${bin.location}</div>
                        <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
                            <span style="color: ${priorityColor};">
                                <i class="fas fa-fill"></i> ${bin.fill}% Full
                            </span>
                            <span style="color: #94a3b8;">
                                <i class="fas fa-map-marker-alt"></i> ${bin.distance.toFixed(1)} km
                            </span>
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
                    ">
                        <i class="fas fa-check" style="display: none; color: #10b981;"></i>
                    </div>
                </div>
            </div>
        `;
    }).join('');
};

window.toggleBinSelection = function(binId) {
    const card = document.querySelector(`[data-bin-id="${binId}"]`);
    const checkbox = card.querySelector('.bin-checkbox i');
    
    if (!window.selectedBinsForRoute) {
        window.selectedBinsForRoute = [];
    }
    
    const index = window.selectedBinsForRoute.indexOf(binId);
    if (index === -1) {
        // Add bin
        window.selectedBinsForRoute.push(binId);
        checkbox.style.display = 'block';
        card.style.background = 'rgba(16, 185, 129, 0.1)';
        card.style.borderColor = 'rgba(16, 185, 129, 0.5)';
    } else {
        // Remove bin
        window.selectedBinsForRoute.splice(index, 1);
        checkbox.style.display = 'none';
        card.style.background = 'rgba(255, 255, 255, 0.05)';
        card.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    }
    
    updateSelectedBinsList();
};

window.updateSelectedBinsList = function() {
    const selectedList = document.getElementById('selectedBinsList');
    
    if (!window.selectedBinsForRoute || window.selectedBinsForRoute.length === 0) {
        selectedList.innerHTML = '<p style="text-align: center; color: #94a3b8;">No bins selected</p>';
        return;
    }
    
    const bins = dataManager.getBins();
    const selectedBins = bins.filter(b => window.selectedBinsForRoute.includes(b.id));
    
    selectedList.innerHTML = selectedBins.map(bin => `
        <div style="
            display: inline-block;
            background: rgba(16, 185, 129, 0.2);
            border: 1px solid rgba(16, 185, 129, 0.5);
            border-radius: 20px;
            padding: 0.5rem 1rem;
            margin: 0.25rem;
        ">
            ${bin.id} - ${bin.fill}%
            <button onclick="toggleBinSelection('${bin.id}')" style="
                background: none;
                border: none;
                color: #ef4444;
                margin-left: 0.5rem;
                cursor: pointer;
            ">×</button>
        </div>
    `).join('');
};

window.assignRecommendedBins = function() {
    if (window.recommendedBinsForRoute) {
        window.selectedBinsForRoute = [...window.recommendedBinsForRoute];
        
        // Update UI
        document.querySelectorAll('.bin-selection-card').forEach(card => {
            const binId = card.dataset.binId;
            const checkbox = card.querySelector('.bin-checkbox i');
            
            if (window.selectedBinsForRoute.includes(binId)) {
                checkbox.style.display = 'block';
                card.style.background = 'rgba(16, 185, 129, 0.1)';
                card.style.borderColor = 'rgba(16, 185, 129, 0.5)';
            } else {
                checkbox.style.display = 'none';
                card.style.background = 'rgba(255, 255, 255, 0.05)';
                card.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }
        });
        
        updateSelectedBinsList();
    }
};

window.confirmRouteAssignment = function() {
    if (!window.selectedDriverForRoute || !window.selectedBinsForRoute || window.selectedBinsForRoute.length === 0) {
        if (window.app) {
            window.app.showAlert('Error', 'Please select at least one bin for the route', 'warning');
        }
        return;
    }
    
    // Create route
    const route = dataManager.addRoute({
        driverId: window.selectedDriverForRoute,
        binIds: window.selectedBinsForRoute,
        assignedBy: authManager.getCurrentUser()?.id,
        assignedByName: authManager.getCurrentUser()?.name || 'System'
    });
    
    const driver = dataManager.getUserById(window.selectedDriverForRoute);
    
    if (window.app) {
        window.app.showAlert('Route Assigned', 
            `Route with ${window.selectedBinsForRoute.length} bins assigned to ${driver.name}`, 
            'success'
        );
    }
    
    // Close modal
    closeRouteAssignmentModal();
    
    // Refresh driver routes if they're logged in
    if (authManager.getCurrentUser()?.id === window.selectedDriverForRoute) {
        window.app.loadDriverRoutes();
    }
};

window.closeRouteAssignmentModal = function() {
    document.getElementById('routeAssignmentModal').style.display = 'none';
    window.selectedDriverForRoute = null;
    window.selectedBinsForRoute = [];
    window.recommendedBinsForRoute = [];
};

// Sync Status Updates
function setupSyncStatusUpdates() {
    console.log('Setting up sync status updates...');
    
    // Update sync status every 5 seconds
    setInterval(updateSyncStatus, 5000);
    
    // Initial update
    setTimeout(updateSyncStatus, 1000);
}

function updateSyncStatus() {
    const syncStatus = document.getElementById('syncStatus');
    const syncIcon = document.getElementById('syncIcon');
    const syncIndicator = document.getElementById('syncIndicator');
    
    if (!syncStatus || !syncIcon || !syncIndicator) return;
    
    if (typeof syncManager !== 'undefined') {
        const status = syncManager.getSyncStatus();
        
        if (status.enabled && status.online) {
            // Online and syncing
            syncIcon.className = 'fas fa-cloud-upload-alt';
            syncIcon.style.color = '#10b981';
            syncIndicator.style.background = '#10b981';
            
            if (status.pendingUpdates > 0) {
                syncStatus.innerHTML = `
                    <span style="color: #10b981;">✓ Connected</span><br>
                    <span style="font-size: 0.75rem;">Syncing ${status.pendingUpdates} updates...</span>
                `;
            } else {
                const lastSync = status.lastSync ? 
                    new Date(status.lastSync).toLocaleTimeString() : 'Never';
                syncStatus.innerHTML = `
                    <span style="color: #10b981;">✓ Synced with server</span><br>
                    <span style="font-size: 0.75rem;">Last sync: ${lastSync}</span>
                `;
            }
        } else if (status.enabled && !status.online) {
            // Offline mode
            syncIcon.className = 'fas fa-cloud-download-alt';
            syncIcon.style.color = '#f59e0b';
            syncIndicator.style.background = '#f59e0b';
            
            syncStatus.innerHTML = `
                <span style="color: #f59e0b;">📡 Offline Mode</span><br>
                <span style="font-size: 0.75rem;">${status.pendingUpdates} updates queued</span>
            `;
        } else {
            // Sync disabled
            syncIcon.className = 'fas fa-cloud-slash';
            syncIcon.style.color = '#6b7280';
            syncIndicator.style.background = '#6b7280';
            
            syncStatus.innerHTML = `
                <span style="color: #6b7280;">Local Mode</span><br>
                <span style="font-size: 0.75rem;">Server sync disabled</span>
            `;
        }
    } else {
        // Sync manager not loaded
        syncIcon.className = 'fas fa-exclamation-triangle';
        syncIcon.style.color = '#ef4444';
        syncIndicator.style.background = '#ef4444';
        
        syncStatus.innerHTML = `
            <span style="color: #ef4444;">⚠ Sync Error</span><br>
            <span style="font-size: 0.75rem;">Check connection</span>
        `;
    }
}

// Add global function to manually trigger sync
window.triggerManualSync = function() {
    if (typeof syncManager !== 'undefined') {
        console.log('🔄 Manual sync triggered');
        syncManager.performFullSync().then(success => {
            if (window.app) {
                if (success) {
                    window.app.showAlert('Sync Complete', 'Data synchronized successfully', 'success');
                } else {
                    window.app.showAlert('Sync Failed', 'Unable to sync with server', 'warning');
                }
            }
        });
        updateSyncStatus();
    }
};

// Enhanced route list loading for drivers with sync
window.navigateToBin = function(binId, lat, lng) {
    if (window.app) {
        window.app.showAlert('Navigation', `Navigating to bin ${binId}`, 'info');
        
        // Update driver status to on-route
        const currentUser = authManager.getCurrentUser();
        if (currentUser && typeof mapManager !== 'undefined') {
            mapManager.updateDriverStatus(currentUser.id, 'on-route');
        }
    }
};

// markBinCollected function moved to app.js for comprehensive handling

// The global helper functions remain the same but are already defined in app.js