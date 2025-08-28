// Enhanced Driver Buttons - COMPLETELY REBUILT FROM SCRATCH
// Direct, immediate connections to main application

console.log('🚀 Loading Enhanced Driver Buttons - NEW VERSION');

class EnhancedDriverButtons {
    constructor() {
        this.currentUser = null;
        this.buttons = {
            startRoute: document.getElementById('startRouteBtn'),
            registerPickup: document.getElementById('registerPickupBtn'),
            reportIssue: document.getElementById('reportIssueDriverBtn'),
            updateFuel: document.getElementById('updateFuelBtn')
        };
        
        this.init();
    }

    init() {
        console.log('🎯 Initializing Enhanced Driver Buttons - REBUILT');
        this.setupEventListeners();
        this.checkUserStatus();
        
        // Periodic user check
        setInterval(() => {
            this.checkUserStatus();
        }, 2000);
    }

    checkUserStatus() {
        const newUser = authManager ? authManager.getCurrentUser() : null;
        
        if (newUser && newUser.type === 'driver') {
            if (!this.currentUser || this.currentUser.id !== newUser.id) {
                this.currentUser = newUser;
                this.enableButtons();
                console.log('✅ Driver logged in:', newUser.name);
            }
        } else {
            this.currentUser = null;
            this.disableButtons();
        }
    }

    setupEventListeners() {
        // Start Route Button
        if (this.buttons.startRoute) {
            this.buttons.startRoute.addEventListener('click', () => {
                this.handleStartRoute();
            });
        }

        // Register Pickup Button
        if (this.buttons.registerPickup) {
            this.buttons.registerPickup.addEventListener('click', () => {
                this.handleRegisterPickup();
            });
        }

        // Report Issue Button
        if (this.buttons.reportIssue) {
            this.buttons.reportIssue.addEventListener('click', () => {
                this.handleReportIssue();
            });
        }

        // Update Fuel Button
        if (this.buttons.updateFuel) {
            this.buttons.updateFuel.addEventListener('click', () => {
                this.handleUpdateFuel();
            });
        }
    }

    enableButtons() {
        Object.values(this.buttons).forEach(button => {
            if (button) {
                button.disabled = false;
                button.style.opacity = '1';
                button.style.pointerEvents = 'auto';
            }
        });
        this.updateButtonStates();
    }

    disableButtons() {
        Object.values(this.buttons).forEach(button => {
            if (button) {
                button.disabled = true;
                button.style.opacity = '0.5';
                button.style.pointerEvents = 'none';
            }
        });
    }

    updateButtonStates() {
        if (!this.currentUser) return;

        // Update Start Route button based on driver status
        const driver = dataManager.getUserById(this.currentUser.id);
        const isOnRoute = driver && driver.movementStatus === 'on-route';
        
        if (this.buttons.startRoute) {
            if (isOnRoute) {
                this.buttons.startRoute.innerHTML = `
                    <div class="action-icon-container">
                        <i class="fas fa-stop-circle"></i>
                        <div class="action-status-dot" style="background: #ef4444;"></div>
                    </div>
                    <div class="action-content">
                        <h4 class="action-title">End Route</h4>
                        <p class="action-subtitle">Currently on route</p>
                    </div>
                `;
                this.buttons.startRoute.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            } else {
                this.buttons.startRoute.innerHTML = `
                    <div class="action-icon-container">
                        <i class="fas fa-play-circle"></i>
                        <div class="action-status-dot" style="background: #10b981;"></div>
                    </div>
                    <div class="action-content">
                        <h4 class="action-title">Start Route</h4>
                        <p class="action-subtitle">Ready to begin</p>
                    </div>
                `;
                this.buttons.startRoute.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            }
        }

        // Update other buttons as needed
        this.updatePickupButton();
        this.updateFuelButton();
    }

    updatePickupButton() {
        if (!this.buttons.registerPickup || !this.currentUser) return;
        
        const routes = dataManager.getDriverRoutes(this.currentUser.id);
        const activeBins = routes.reduce((count, route) => {
            return count + (route.bins ? route.bins.length : 0);
        }, 0);

        const subtitle = activeBins > 0 ? `${activeBins} bins available` : 'No active routes';
        
        if (this.buttons.registerPickup) {
            this.buttons.registerPickup.querySelector('.action-subtitle').textContent = subtitle;
        }
    }

    updateFuelButton() {
        if (!this.buttons.updateFuel || !this.currentUser) return;
        
        const driver = dataManager.getUserById(this.currentUser.id);
        const fuelLevel = driver ? (driver.fuelLevel || 75) : 75;
        
        if (this.buttons.updateFuel) {
            this.buttons.updateFuel.querySelector('.action-subtitle').textContent = `${fuelLevel}% current level`;
        }
    }

    // ==================== BUTTON HANDLERS ====================

    async handleStartRoute() {
        if (!this.currentUser) return;

        try {
            const driver = dataManager.getUserById(this.currentUser.id);
            const isOnRoute = driver && driver.movementStatus === 'on-route';

            if (isOnRoute) {
                // End route
                await this.endRoute();
            } else {
                // Start route
                await this.startRoute();
            }
        } catch (error) {
            console.error('❌ Route action failed:', error);
            this.showNotification('Route Error', 'Failed to update route status', 'error');
        }
    }

    async startRoute() {
        console.log('🚀 Starting route for driver:', this.currentUser.name);

        // 1. Update driver status in dataManager IMMEDIATELY
        const updateData = {
            movementStatus: 'on-route',
            routeStartTime: new Date().toISOString(),
            lastStatusUpdate: new Date().toISOString()
        };
        
        dataManager.updateUser(this.currentUser.id, updateData);
        
        // 2. Update driver location timestamp IMMEDIATELY
        let location = dataManager.getDriverLocation(this.currentUser.id);
        if (location) {
            location.timestamp = new Date().toISOString();
            location.status = 'on-route';
            dataManager.updateDriverLocation(this.currentUser.id, location.lat, location.lng, location);
        }

        // 3. IMMEDIATELY update map manager
        if (window.mapManager && window.mapManager.updateDriverStatus) {
            window.mapManager.updateDriverStatus(this.currentUser.id, 'on-route');
        }

        // 4. IMMEDIATELY refresh map drivers
        if (window.mapManager && window.mapManager.loadDriversOnMap) {
            setTimeout(() => {
                window.mapManager.loadDriversOnMap();
            }, 100);
        }

        // 5. IMMEDIATELY refresh fleet management if visible
        if (window.app && window.app.currentSection === 'fleet') {
            setTimeout(() => {
                window.app.loadFleetManagement();
            }, 200);
        }

        // 6. Update button state
        this.updateButtonStates();

        // 7. Sync to server
        if (window.syncManager) {
            window.syncManager.syncToServer();
        }

        this.showNotification('Route Started', '🚗 Navigation started. Your status is now updated across the entire system!', 'success');
    }

    async endRoute() {
        console.log('🏁 Ending route for driver:', this.currentUser.name);

        // 1. Update driver status in dataManager IMMEDIATELY
        const updateData = {
            movementStatus: 'active',
            routeEndTime: new Date().toISOString(),
            lastStatusUpdate: new Date().toISOString()
        };
        
        dataManager.updateUser(this.currentUser.id, updateData);
        
        // 2. Update driver location timestamp IMMEDIATELY
        let location = dataManager.getDriverLocation(this.currentUser.id);
        if (location) {
            location.timestamp = new Date().toISOString();
            location.status = 'active';
            dataManager.updateDriverLocation(this.currentUser.id, location.lat, location.lng, location);
        }

        // 3. IMMEDIATELY update map manager
        if (window.mapManager && window.mapManager.updateDriverStatus) {
            window.mapManager.updateDriverStatus(this.currentUser.id, 'active');
        }

        // 4. IMMEDIATELY refresh map drivers
        if (window.mapManager && window.mapManager.loadDriversOnMap) {
            setTimeout(() => {
                window.mapManager.loadDriversOnMap();
            }, 100);
        }

        // 5. IMMEDIATELY refresh fleet management if visible
        if (window.app && window.app.currentSection === 'fleet') {
            setTimeout(() => {
                window.app.loadFleetManagement();
            }, 200);
        }

        // 6. Update button state
        this.updateButtonStates();

        // 7. Sync to server
        if (window.syncManager) {
            window.syncManager.syncToServer();
        }

        this.showNotification('Route Completed', '✅ Route ended successfully. Your status has been updated across the application.', 'success');
    }

    async handleRegisterPickup() {
        if (!this.currentUser) return;

        try {
            // Get driver's assigned routes
            const routes = dataManager.getDriverRoutes(this.currentUser.id);
            const availableBins = [];

            routes.forEach(route => {
                if (route.status === 'active' && route.bins) {
                    route.bins.forEach(binId => {
                        const bin = dataManager.getBinById(binId);
                        if (bin && bin.fill > 0) {
                            availableBins.push(bin);
                        }
                    });
                }
            });

            if (availableBins.length === 0) {
                this.showNotification('No Bins Available', 'You have no assigned bins ready for collection.', 'warning');
                return;
            }

            this.showPickupModal(availableBins);
        } catch (error) {
            console.error('❌ Pickup registration failed:', error);
            this.showNotification('Pickup Error', 'Failed to load available bins', 'error');
        }
    }

    showPickupModal(bins) {
        const modal = document.createElement('div');
        modal.id = 'pickupModal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8);
            display: flex; justify-content: center; align-items: center; z-index: 10000;
        `;

        const binList = bins.map(bin => `
            <div class="bin-item" onclick="window.selectBinForPickup('${bin.id}')" style="
                padding: 1rem; margin: 0.5rem 0; background: #f8f9fa; border-radius: 8px; cursor: pointer;
                border: 2px solid transparent; transition: all 0.3s ease;
            " onmouseover="this.style.borderColor='#3b82f6'; this.style.background='#eff6ff';" 
               onmouseout="this.style.borderColor='transparent'; this.style.background='#f8f9fa';">
                <strong>${bin.id}</strong> - ${bin.location}<br>
                <span style="color: #059669;">Fill Level: ${bin.fill}%</span>
            </div>
        `).join('');

        modal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="margin: 0; color: #1f2937;">📦 Select Bin for Pickup</h3>
                    <button onclick="this.closest('#pickupModal').remove()" style="
                        background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280;
                    ">&times;</button>
                </div>
                <div style="max-height: 300px; overflow-y: auto;">
                    ${binList}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Global function for bin selection
        window.selectBinForPickup = async (binId) => {
            modal.remove();
            await this.collectBin(binId);
        };
    }

    async collectBin(binId) {
        try {
            console.log('📦 Collecting bin:', binId);

            // Use the existing global markBinCollected function
            if (window.markBinCollected) {
                await window.markBinCollected(binId);
            } else {
                // Fallback implementation
                const bin = dataManager.getBinById(binId);
                if (bin) {
                    bin.fill = 0;
                    bin.lastCollection = new Date().toISOString();
                    dataManager.updateBin(binId, bin);
                }
            }

            // IMMEDIATELY refresh everything
            if (window.mapManager) {
                window.mapManager.updateBinMarker(binId);
                window.mapManager.loadDriversOnMap();
            }

            if (window.app && window.app.currentSection === 'fleet') {
                window.app.loadFleetManagement();
            }

            this.updateButtonStates();

            this.showNotification('Pickup Registered', `✅ Bin ${binId} has been marked as collected!`, 'success');
        } catch (error) {
            console.error('❌ Bin collection failed:', error);
            this.showNotification('Collection Error', 'Failed to register bin pickup', 'error');
        }
    }

    async handleReportIssue() {
        if (!this.currentUser) return;

        const modal = document.createElement('div');
        modal.id = 'issueModal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8);
            display: flex; justify-content: center; align-items: center; z-index: 10000;
        `;

        modal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="margin: 0; color: #1f2937;">🚨 Report Issue</h3>
                    <button onclick="this.closest('#issueModal').remove()" style="
                        background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280;
                    ">&times;</button>
                </div>
                <form id="issueForm">
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Issue Type:</label>
                        <select id="issueType" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;">
                            <option value="vehicle">Vehicle Problem</option>
                            <option value="route">Route Issue</option>
                            <option value="bin">Bin Problem</option>
                            <option value="safety">Safety Concern</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Priority:</label>
                        <select id="issuePriority" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Description:</label>
                        <textarea id="issueDescription" rows="4" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; resize: vertical;" placeholder="Please describe the issue in detail..."></textarea>
                    </div>
                    <div style="display: flex; gap: 1rem;">
                        <button type="button" onclick="this.closest('#issueModal').remove()" style="
                            flex: 1; padding: 0.75rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer;
                        ">Cancel</button>
                        <button type="submit" style="
                            flex: 1; padding: 0.75rem; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer;
                        ">Report Issue</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle form submission
        const form = modal.querySelector('#issueForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const issueData = {
                id: 'ISSUE-' + Date.now(),
                driverId: this.currentUser.id,
                driverName: this.currentUser.name,
                type: modal.querySelector('#issueType').value,
                priority: modal.querySelector('#issuePriority').value,
                description: modal.querySelector('#issueDescription').value,
                timestamp: new Date().toISOString(),
                status: 'open'
            };

            // Save issue
            dataManager.addIssue(issueData);
            
            // Sync to server
            if (window.syncManager) {
                window.syncManager.syncToServer();
            }

            modal.remove();
            this.showNotification('Issue Reported', `🚨 Your ${issueData.priority} priority issue has been reported.`, 'success');
        });
    }

    async handleUpdateFuel() {
        if (!this.currentUser) return;

        const driver = dataManager.getUserById(this.currentUser.id);
        const currentFuel = driver ? (driver.fuelLevel || 75) : 75;

        const modal = document.createElement('div');
        modal.id = 'fuelModal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8);
            display: flex; justify-content: center; align-items: center; z-index: 10000;
        `;

        modal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 2rem; max-width: 400px; width: 90%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="margin: 0; color: #1f2937;">⛽ Update Fuel Level</h3>
                    <button onclick="this.closest('#fuelModal').remove()" style="
                        background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280;
                    ">&times;</button>
                </div>
                
                <div style="margin-bottom: 1.5rem; text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold; color: #1f2937; margin-bottom: 0.5rem;" id="fuelDisplay">${currentFuel}%</div>
                    <div style="background: #e5e7eb; height: 20px; border-radius: 10px; overflow: hidden;">
                        <div id="fuelBar" style="background: linear-gradient(90deg, #ef4444, #f59e0b, #10b981); height: 100%; width: ${currentFuel}%; transition: width 0.3s ease;"></div>
                    </div>
                </div>

                <form id="fuelForm">
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">New Fuel Level (0-100%):</label>
                        <input type="range" id="fuelSlider" min="0" max="100" value="${currentFuel}" style="width: 100%; margin-bottom: 0.5rem;">
                        <input type="number" id="fuelInput" min="0" max="100" value="${currentFuel}" style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px;">
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 1.5rem;">
                        <button type="button" onclick="setFuelLevel(25)" style="padding: 0.5rem; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">25%</button>
                        <button type="button" onclick="setFuelLevel(50)" style="padding: 0.5rem; background: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer;">50%</button>
                        <button type="button" onclick="setFuelLevel(75)" style="padding: 0.5rem; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">75%</button>
                        <button type="button" onclick="setFuelLevel(100)" style="padding: 0.5rem; background: #059669; color: white; border: none; border-radius: 4px; cursor: pointer;">100%</button>
                    </div>
                    
                    <div style="display: flex; gap: 1rem;">
                        <button type="button" onclick="this.closest('#fuelModal').remove()" style="
                            flex: 1; padding: 0.75rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer;
                        ">Cancel</button>
                        <button type="submit" style="
                            flex: 1; padding: 0.75rem; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;
                        ">Update Fuel</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Setup fuel level controls
        const slider = modal.querySelector('#fuelSlider');
        const input = modal.querySelector('#fuelInput');
        const display = modal.querySelector('#fuelDisplay');
        const bar = modal.querySelector('#fuelBar');

        const updateFuelDisplay = (value) => {
            display.textContent = value + '%';
            bar.style.width = value + '%';
            slider.value = value;
            input.value = value;
        };

        slider.addEventListener('input', (e) => updateFuelDisplay(e.target.value));
        input.addEventListener('input', (e) => updateFuelDisplay(e.target.value));

        window.setFuelLevel = (value) => updateFuelDisplay(value);

        // Handle form submission
        const form = modal.querySelector('#fuelForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const newFuelLevel = parseInt(input.value);
            
            // IMMEDIATELY update driver fuel level
            const updateData = {
                fuelLevel: newFuelLevel,
                lastFuelUpdate: new Date().toISOString()
            };
            
            dataManager.updateUser(this.currentUser.id, updateData);

            // IMMEDIATELY update map manager
            if (window.mapManager && window.mapManager.loadDriversOnMap) {
                setTimeout(() => {
                    window.mapManager.loadDriversOnMap();
                }, 100);
            }

            // IMMEDIATELY refresh fleet management if visible
            if (window.app && window.app.currentSection === 'fleet') {
                setTimeout(() => {
                    window.app.loadFleetManagement();
                }, 200);
            }

            // Update button states
            this.updateButtonStates();

            // Sync to server
            if (window.syncManager) {
                window.syncManager.syncToServer();
            }

            modal.remove();
            this.showNotification('Fuel Updated', `⛽ Fuel level updated to ${newFuelLevel}%. This change is reflected across the entire application.`, 'success');
        });
    }

    showNotification(title, message, type = 'info') {
        if (window.app && window.app.showAlert) {
            window.app.showAlert(title, message, type);
        } else {
            alert(`${title}: ${message}`);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM ready, initializing Enhanced Driver Buttons - NEW VERSION');
    window.enhancedDriverButtons = new EnhancedDriverButtons();
});

// Also initialize if DOM is already loaded
if (document.readyState !== 'loading') {
    console.log('🎯 DOM already loaded, initializing Enhanced Driver Buttons - NEW VERSION');
    window.enhancedDriverButtons = new EnhancedDriverButtons();
}

// Global reinitialize function
window.reinitializeDriverButtons = function() {
    if (window.enhancedDriverButtons) {
        console.log('🔄 Reinitializing driver buttons');
        window.enhancedDriverButtons.checkUserStatus();
        window.enhancedDriverButtons.updateButtonStates();
    }
};

console.log('✅ Enhanced Driver Buttons - NEW VERSION loaded successfully');

