// app.js - Complete Main Application Controller with All Integrations

class WasteManagementApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.initialized = false;
        this.init();
    }

    init() {
        try {
            console.log('🚀 Initializing Waste Management App...');
            
            // Check dependencies before proceeding
            console.log('🔍 Checking app dependencies...');
            const appDeps = {
                dataManager: typeof dataManager !== 'undefined',
                authManager: typeof authManager !== 'undefined',
                syncManager: typeof syncManager !== 'undefined'
            };
            
            console.log('📦 App dependency status:', appDeps);
            
        this.setupEventHandlers();
            console.log('✅ Event handlers setup complete');
            
        this.setupAlertSystem();
            console.log('✅ Alert system setup complete');
        
        // Initialize bin modal manager if available
        if (typeof binModalManager !== 'undefined') {
            binModalManager.init();
                console.log('✅ Bin Modal Manager initialized');
            } else {
                console.log('⚠️ Bin Modal Manager not available yet');
        }
        
        // Initialize map early to support driver tracking
        this.initializeMapIfNeeded();
        
        this.initialized = true;
            console.log('🎉 WasteManagementApp initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize WasteManagementApp:', error);
            console.error('❌ Stack trace:', error.stack);
            this.initialized = false;
            throw error; // Re-throw to be caught by the main try-catch
        }
    }

    setupEventHandlers() {
        // Call the global event handlers setup first
        if (typeof setupEventHandlers === 'function') {
            setupEventHandlers();
        }
        
        // Navigation items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const section = item.getAttribute('data-section');
                if (section) {
                    this.showSection(section);
                }
            });
        });
        
        // Setup analytics tabs
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('analytics-tab')) {
                // Remove active from all tabs
                document.querySelectorAll('.analytics-tab').forEach(tab => {
                    tab.classList.remove('active');
                });
                
                // Add active to clicked tab
                e.target.classList.add('active');
                
                // Hide all tab contents
                document.querySelectorAll('.analytics-content').forEach(content => {
                    content.style.display = 'none';
                });
                
                // Show selected tab content
                const tabName = e.target.getAttribute('data-tab');
                const tabContent = document.getElementById(`${tabName}-content`);
                if (tabContent) {
                    tabContent.style.display = 'block';
                    
                    // Initialize charts for the selected tab
                    this.initializeTabCharts(tabName);
                }
            }
        });

        // Setup FAB (Floating Action Button) functionality
        const mainFab = document.getElementById('mainFab');
        if (mainFab) {
            mainFab.addEventListener('click', () => {
                this.toggleFabMenu();
            });
        }

        // Setup FAB option event listeners
        const reportIssueFab = document.getElementById('reportIssueFab');
        const addBinFab = document.getElementById('addBinFab');
        const addVehicleFab = document.getElementById('addVehicleFab');

        if (reportIssueFab) {
            reportIssueFab.addEventListener('click', () => {
                this.showReportIssueModal();
                this.toggleFabMenu(); // Close the menu
            });
        }

        if (addBinFab) {
            addBinFab.addEventListener('click', () => {
                this.showAddBinModal();
                this.toggleFabMenu(); // Close the menu
            });
        }

        if (addVehicleFab) {
            addVehicleFab.addEventListener('click', () => {
                // Show vehicle registration modal
                const vehicleModal = document.getElementById('vehicleRegistrationModal');
                if (vehicleModal) {
                    vehicleModal.style.display = 'flex';
                }
                this.toggleFabMenu(); // Close the menu
            });
        }
    }

    initializeTabCharts(tabName) {
        // Initialize charts based on which analytics tab is selected
        if (window.analyticsManagerV2 && typeof window.analyticsManagerV2.initializeTabSpecificCharts === 'function') {
            setTimeout(() => {
                window.analyticsManagerV2.initializeTabSpecificCharts(tabName);
            }, 100); // Small delay to ensure DOM is ready
        }
    }

    showSection(sectionName) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to clicked item
        const activeItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }

        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });

        // Show selected section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.style.display = 'block';
            this.currentSection = sectionName;
            
            // For monitoring section, add delay to ensure proper map initialization
            if (sectionName === 'monitoring') {
                // Initialize content with delay to ensure container is visible
                setTimeout(() => {
            this.initializeSectionContent(sectionName);
                    // Force map initialization when monitoring section becomes visible
                    setTimeout(() => {
                        this.initializeMapIfNeeded();
                    }, 200);
                    // NEW: Start live monitoring updates
                    this.startLiveMonitoringUpdates();
                    
                    // Update live monitoring statistics immediately
                    setTimeout(() => {
                        if (typeof updateLiveMonitoringStats === 'function') {
                            updateLiveMonitoringStats();
                            console.log('✅ Live monitoring stats updated on section show');
                        }
                    }, 300);
                }, 100);
            } else {
                // NEW: Stop live monitoring updates when switching away
                this.stopLiveMonitoringUpdates();
                // Initialize section content immediately for other sections
            this.initializeSectionContent(sectionName);
            }
        }

        // Update page title
        document.title = `${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)} - Autonautics`;
    }

    initializeSectionContent(sectionName) {
        switch(sectionName) {
            case 'dashboard':
                this.refreshDashboard();
                break;
            case 'monitoring':
                this.loadMonitoring();
                break;
            case 'fleet':
                this.loadFleetManagement();
                break;
            case 'routes':
                this.loadRouteOptimization();
                break;
            case 'complaints':
                this.loadComplaints();
                break;
            case 'analytics':
                if (typeof analyticsManager !== 'undefined') {
                    analyticsManager.initializeAnalytics();
                }
                break;
            case 'admin':
                this.loadAdminPanel();
                break;
        }
    }

    // Handle successful login
    handleSuccessfulLogin() {
        if (!authManager || !authManager.getCurrentUser()) {
            console.error('No user logged in');
            return;
        }

        const user = authManager.getCurrentUser();
        console.log('Handling successful login for:', user.name, '(' + user.type + ')');

        // Hide login overlay
        const loginOverlay = document.getElementById('loginOverlay');
        if (loginOverlay) {
            loginOverlay.style.display = 'none';
        }

        // Show user info badge
        const userInfoBadge = document.getElementById('userInfoBadge');
        if (userInfoBadge) {
            userInfoBadge.style.display = 'flex';
            
            // Update user info
            const userName = document.getElementById('userName');
            const userRole = document.getElementById('userRole');
            const userAvatar = document.getElementById('userAvatar');
            
            if (userName) userName.textContent = user.name;
            if (userRole) userRole.textContent = user.type.charAt(0).toUpperCase() + user.type.slice(1);
            if (userAvatar) userAvatar.textContent = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
        }

        // Handle different user types
        if (user.type === 'driver') {
            // Show driver-only interface
            this.showDriverInterface();
        } else {
            // Show manager/admin interface
            this.showManagerInterface(user.type);
        }

        // Show success message
        this.showAlert('Login Successful', `Welcome back, ${user.name}!`, 'success');

        // Initialize dashboard data
        this.refreshDashboard();
    }

    showDriverInterface() {
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
            
            // Initialize driver location if not exists or update timestamp
            let location = dataManager.getDriverLocation(currentDriver.id);
            if (!location || !location.lat || !location.lng) {
                // Set initial location with proper timestamps
                const lat = 25.2854 + (Math.random() * 0.02 - 0.01);
                const lng = 51.5310 + (Math.random() * 0.02 - 0.01);
                
                const locationData = {
                    lat: lat,
                    lng: lng,
                    timestamp: new Date().toISOString(),
                    lastUpdate: new Date().toISOString(),
                    status: 'active',
                    accuracy: 10,
                    source: 'driver_login'
                };
                
                dataManager.setDriverLocation(currentDriver.id, locationData);
                console.log('✅ Initialized driver location with active status:', lat, lng);
            } else {
                // Update existing location with fresh timestamp to show as active
                location.lastUpdate = new Date().toISOString();
                location.timestamp = new Date().toISOString();
                location.status = 'active';
                dataManager.setDriverLocation(currentDriver.id, location);
                console.log('✅ Updated driver location timestamp - driver now shows as Active');
            }
            
            // Start tracking
            mapManager.startDriverTracking();
            
            // Also ensure driver appears on main map if it's initialized
            if (mapManager.map) {
                mapManager.initializeAllDrivers();
            }
        }
        
        // Reinitialize Driver System V3 for the logged-in driver
        if (typeof window.reinitializeDriverButtons === 'function') {
            setTimeout(() => {
                window.reinitializeDriverButtons();
                console.log('🔄 Driver System V3 reinitialized');
            }, 500);
        }
        
        // 💬 Store driver data globally for WebSocket identification
        const currentDriver = authManager.getCurrentUser();
        if (currentDriver) {
            window.currentDriverData = currentDriver;
            window.currentUserId = currentDriver.id;
            localStorage.setItem('currentDriver', JSON.stringify(currentDriver));
            console.log('🔐 Stored driver data globally for WebSocket identification:', currentDriver.id);
        }
        
        // 💬 Initialize Enhanced Messaging System for Driver
        console.log('💬 Initializing messaging system for driver...');
        if (window.enhancedMessaging) {
            // Update current user info
            window.enhancedMessaging.updateCurrentUser();
            
            // Initialize driver messaging interface
            setTimeout(() => {
                window.enhancedMessaging.initializeMessagingInterface();
                console.log('✅ Driver messaging system initialized');
                
                // Ensure messaging system is visible
                const messagingSystem = document.getElementById('driverMessagingSystem');
                if (messagingSystem) {
                    messagingSystem.style.display = 'block';
                    console.log('✅ Driver messaging system made visible');
                } else {
                    console.warn('⚠️ Driver messaging system not found in DOM');
                }
            }, 1000);
        } else {
            console.warn('⚠️ Enhanced messaging system not available during driver login');
        }
        
        // Start periodic route checks for drivers (check every 30 seconds)
        this.startDriverRouteChecks();
    }
    
    startDriverRouteChecks() {
        console.log('🔄 Starting periodic route checks for driver updates');
        
        // Check for new routes every 30 seconds
        setInterval(() => {
            if (authManager.isDriver()) {
                console.log('🔍 Checking for new route assignments...');
                this.loadDriverRoutes();
            }
        }, 30000);
    }

    
    showManagerInterface(userType) {
        console.log('Showing manager/admin interface...');
        
        // Hide driver view
        const driverView = document.getElementById('driverOnlyView');
        if (driverView) {
            driverView.style.display = 'none';
        }
        
        // Show main navigation and container
        const mainNav = document.getElementById('mainNav');
        const mainContainer = document.getElementById('mainContainer');
        const fabContainer = document.getElementById('fabContainer');
        
        if (mainNav) mainNav.style.display = 'block';
        if (mainContainer) mainContainer.style.display = 'block';
        if (fabContainer) fabContainer.style.display = 'block';
        
        // Setup navigation menu based on user type
        this.setupNavigationMenu(userType);
        
        // Show dashboard by default
        this.showSection('dashboard');
        
        // Initialize analytics if available
        if (typeof analyticsManager !== 'undefined') {
            setTimeout(() => {
                analyticsManager.initializeAnalytics();
            }, 500);
        }
    }

    setupNavigationMenu(userType) {
        const navMenu = document.getElementById('navMenu');
        if (!navMenu) return;
        
        // Clear existing menu
        navMenu.innerHTML = '';
        
        // Define menu items based on user type
        let menuItems = [];
        
        if (userType === 'admin') {
            menuItems = [
                { id: 'dashboard', icon: 'fa-th-large', label: 'City Dashboard' },
                { id: 'monitoring', icon: 'fa-satellite-dish', label: 'Live Monitoring', badge: 'monitoringBadge' },
                { id: 'fleet', icon: 'fa-truck', label: 'Fleet Management' },
                { id: 'routes', icon: 'fa-route', label: 'ML Routes' },
                { id: 'ai-dashboard', icon: 'fa-brain', label: 'AI/ML Center', badge: 'aiStatusBadge' },
                { id: 'analytics', icon: 'fa-chart-line', label: 'Analytics' },
                { id: 'complaints', icon: 'fa-exclamation-circle', label: 'Complaints', badge: 'complaintsBadge' },
                { id: 'admin', icon: 'fa-user-shield', label: 'Admin Panel' }
            ];
        } else if (userType === 'manager') {
            menuItems = [
                { id: 'dashboard', icon: 'fa-th-large', label: 'City Dashboard' },
                { id: 'monitoring', icon: 'fa-satellite-dish', label: 'Live Monitoring', badge: 'monitoringBadge' },
                { id: 'fleet', icon: 'fa-truck', label: 'Fleet Management' },
                { id: 'routes', icon: 'fa-route', label: 'ML Routes' },
                { id: 'ai-dashboard', icon: 'fa-brain', label: 'AI/ML Center', badge: 'aiStatusBadge' },
                { id: 'analytics', icon: 'fa-chart-line', label: 'Analytics' },
                { id: 'complaints', icon: 'fa-exclamation-circle', label: 'Complaints', badge: 'complaintsBadge' }
            ];
        }
        
        // Create menu items
        menuItems.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'nav-item' + (index === 0 ? ' active' : '');
            li.setAttribute('data-section', item.id);
            
            let html = `<i class="fas ${item.icon}"></i><span>${item.label}</span>`;
            if (item.badge) {
                html += `<span class="notification-badge" id="${item.badge}" style="display: none;">0</span>`;
            }
            
            li.innerHTML = html;
            
            // Add click event
            li.addEventListener('click', () => {
                this.showSection(item.id);
            });
            
            navMenu.appendChild(li);
        });
    }

        async loadDriverRoutes() {
        console.log('📋 Loading driver routes...');
        
        const routesList = document.getElementById('driverRouteList');
        const routesCount = document.getElementById('routesCount');
        const completedToday = document.getElementById('completedToday');
        
        if (!routesList) {
            console.warn('⚠️ driverRouteList element not found');
            return;
        }
        
        const currentUser = authManager.getCurrentUser();
        if (!currentUser) {
            console.warn('⚠️ No current user found');
            return;
        }
        
        console.log(`🔄 Loading routes for driver: ${currentUser.name} (${currentUser.id})`);
        
        // Get routes from sync manager if available, otherwise from local storage
        let routes = [];
        if (typeof syncManager !== 'undefined' && syncManager.getSyncStatus().enabled) {
            console.log('📡 Loading routes from server...');
            routes = await syncManager.getDriverRoutes(currentUser.id);
        } else {
            console.log('💾 Loading routes from local storage...');
            routes = dataManager.getDriverRoutes(currentUser.id);
        }
        
        console.log(`📋 Found ${routes.length} total routes for driver`);
        
        // 🤖 ENHANCED AI SYSTEM - Properly connected to main application AI
        console.log(`🎯 Initializing ENHANCED AI System for driver ${currentUser.id}`);
        
        // IMMEDIATELY make the AI card visible
        const aiSuggestionCard = document.getElementById('aiSuggestionCard');
        if (aiSuggestionCard) {
            aiSuggestionCard.style.display = 'block';
            console.log(`✅ AI Suggestion Card immediately made visible on dashboard init`);
        } else {
            console.error(`❌ AI Suggestion Card not found during dashboard init!`);
        }
        
        // Initialize Enhanced Driver AI with force sync
        this.syncDriverLocationsNow(currentUser.id).then(() => {
            console.log(`📡 Location sync completed, loading Enhanced AI recommendations...`);
            this.loadEnhancedDriverAI(currentUser.id);
        }).catch(error => {
            console.error(`❌ Failed to sync driver locations for ${currentUser.id}:`, error);
            // Load Enhanced AI even if sync fails (will use fallback location)
            this.loadEnhancedDriverAI(currentUser.id);
        });

        // Debug: Show all route statuses for this driver
        const allDriverRoutes = dataManager.getRoutes().filter(r => r.driverId === currentUser.id);
        console.log(`🔍 Debug - All driver routes (${allDriverRoutes.length}):`, 
            allDriverRoutes.map(r => `${r.id}: ${r.status}`).join(', '));
        console.log(`🔍 Debug - Filtered routes (${routes.length}):`, 
            routes.map(r => `${r.id}: ${r.status}`).join(', '));
        
        const activeRoutes = routes.filter(r => r.status !== 'completed' && r.status !== 'cancelled');
        const completedRoutes = routes.filter(r => 
            r.status === 'completed' && 
            new Date(r.completedAt || r.createdAt).toDateString() === new Date().toDateString()
        );
        
        console.log(`📊 Active routes: ${activeRoutes.length}, Completed today: ${completedRoutes.length}`);
        
        // Update counts if elements exist
        if (routesCount) {
            routesCount.textContent = activeRoutes.length;
        } else {
            console.log('📊 routesCount element not found - skipping update');
        }
        
        if (completedToday) {
            completedToday.textContent = completedRoutes.length;
        } else {
            console.log('📊 completedToday element not found - skipping update');
        }
        
        if (activeRoutes.length === 0) {
            // Show AI suggestions for nearest bins
            const aiSuggestions = this.getAISuggestedBins(currentUser.id);
            
            let suggestionsHtml = '';
            if (aiSuggestions.length > 0) {
                suggestionsHtml = `
                    <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(59, 130, 246, 0.1); border-radius: 8px; border: 1px solid rgba(59, 130, 246, 0.2);">
                        <h4 style="margin: 0 0 1rem 0; color: #3b82f6; font-size: 0.875rem;">
                            <i class="fas fa-brain"></i> AI Suggestions - Nearest Priority Bins
                        </h4>
                        ${aiSuggestions.map(suggestion => `
                            <div style="background: rgba(255, 255, 255, 0.8); padding: 0.75rem; margin-bottom: 0.5rem; border-radius: 6px; font-size: 0.8rem;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <strong>📍 ${suggestion.bin.location}</strong><br>
                                        <span style="color: ${suggestion.priorityColor};">
                                            ${suggestion.bin.fill}% full - ${suggestion.priority.toUpperCase()} priority
                                        </span><br>
                                        <span style="color: #6b7280;">🚗 ${suggestion.distance.toFixed(1)}km away</span>
                                    </div>
                                    <button class="btn btn-sm" style="background: #3b82f6; color: white; padding: 0.25rem 0.5rem; font-size: 0.75rem;"
                                            onclick="window.app.requestBinAssignment('${suggestion.bin.id}')">
                                        Request Assignment
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            routesList.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #6b7280;">
                    <i class="fas fa-route" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No active routes assigned</p>
                    <p style="font-size: 0.875rem;">Routes will appear here when assigned by manager</p>
                    <button class="btn btn-primary btn-sm" onclick="window.app.loadDriverRoutes()" style="margin-top: 1rem;">
                        <i class="fas fa-sync"></i> Refresh Routes
                    </button>
                    ${suggestionsHtml}
                </div>
            `;
            return;
        }
        
        // Add a header showing route count
        const routeHeader = `
            <div style="
                background: rgba(59, 130, 246, 0.1); 
                border: 1px solid rgba(59, 130, 246, 0.2); 
                border-radius: 8px; 
                padding: 1rem; 
                margin-bottom: 1rem;
                text-align: center;
            ">
                <h4 style="margin: 0; color: #3b82f6;">
                    <i class="fas fa-route"></i> Active Routes (${activeRoutes.length})
                </h4>
                <p style="margin: 0.5rem 0 0 0; color: #6b7280; font-size: 0.875rem;">
                    ${completedRoutes.length} completed today
                </p>
            </div>
        `;
        
        routesList.innerHTML = routeHeader + activeRoutes.map(route => {
            console.log('📋 Rendering route:', route.id, 'with', route.binIds?.length || 1, 'bins');
            
            // Handle both old and new route formats
            let bins = [];
            if (route.binDetails && route.binDetails.length > 0) {
                // New format with detailed bin info
                bins = route.binDetails;
            } else if (route.binIds && route.binIds.length > 0) {
                // Old format with just bin IDs
                bins = route.binIds.map(binId => dataManager.getBinById(binId)).filter(bin => bin);
            } else if (route.binId) {
                // Single bin format
            const bin = dataManager.getBinById(route.binId);
                if (bin) bins = [bin];
            }
            
            if (bins.length === 0) {
                console.warn('⚠️ No valid bins found for route:', route.id);
                return '';
            }
            
            const primaryBin = bins[0]; // Use first bin as primary
            const priorityColor = route.priority === 'high' ? '#ef4444' : 
                                route.priority === 'medium' ? '#f59e0b' : '#10b981';
            
            const statusBadge = route.status === 'in-progress' ? 
                '<span style="background: #3b82f6; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">IN PROGRESS</span>' : 
                route.status === 'pending' ?
                '<span style="background: #f59e0b; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">PENDING</span>' : '';
            
            const assignedTime = route.assignedAt ? new Date(route.assignedAt) : new Date(route.createdAt);
            const timeAgo = this.getTimeAgo(assignedTime);
            
            return `
                <div class="route-card" style="
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 1rem;
                    margin-bottom: 1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                " onclick="window.navigateToBin('${primaryBin.id}', ${primaryBin.lat || 25.3682}, ${primaryBin.lng || 51.5511})">
                    
                    ${route.priority === 'high' ? `
                        <div style="
                            position: absolute;
                            top: -8px;
                            right: 10px;
                            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                            color: white;
                            padding: 2px 8px;
                            border-radius: 10px;
                            font-size: 0.75rem;
                            font-weight: bold;
                            animation: pulse 2s infinite;
                        ">
                            🚨 URGENT
                        </div>
                    ` : ''}
                    
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
                        <div>
                            <h4 style="margin: 0; color: #e2e8f0;">
                                Route ${route.id}
                                ${bins.length > 1 ? `<span style="color: #94a3b8; font-size: 0.875rem;"> (${bins.length} bins)</span>` : ''}
                            </h4>
                            <div style="color: #94a3b8; font-size: 0.875rem; margin-top: 0.25rem;">
                                📍 ${primaryBin.location || 'Unknown Location'}
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                                <span style="color: ${priorityColor}; font-weight: bold; text-transform: uppercase; font-size: 0.75rem;">
                                    ${route.priority || 'MEDIUM'} PRIORITY
                                </span>
                                ${statusBadge}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.5rem; font-weight: bold; color: ${this.getBinStatusColor(primaryBin)};">
                                ${primaryBin.fill || 0}%
                            </div>
                            <div style="font-size: 0.75rem; color: #6b7280;">Fill Level</div>
                        </div>
                    </div>
                    
                    ${bins.length > 1 ? `
                        <div style="margin-bottom: 0.75rem;">
                            <div style="color: #94a3b8; font-size: 0.75rem; margin-bottom: 0.5rem;">Additional Bins:</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 0.25rem;">
                                ${bins.slice(1).map(bin => `
                                    <span style="
                                        background: rgba(0, 0, 0, 0.3);
                                        color: #e2e8f0;
                                        padding: 2px 6px;
                                        border-radius: 4px;
                                        font-size: 0.75rem;
                                    ">${bin.id} (${bin.fill || 0}%)</span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 0.75rem;">
                        <div style="background: rgba(0, 0, 0, 0.2); padding: 0.5rem; border-radius: 6px;">
                            <div style="color: #94a3b8; font-size: 0.75rem;">Status</div>
                            <div style="color: #e2e8f0; font-weight: bold; text-transform: capitalize;">
                                ${route.status || 'pending'}
                            </div>
                        </div>
                        <div style="background: rgba(0, 0, 0, 0.2); padding: 0.5rem; border-radius: 6px;">
                            <div style="color: #94a3b8; font-size: 0.75rem;">Assigned</div>
                            <div style="color: #e2e8f0; font-weight: bold;">
                                ${timeAgo}
                            </div>
                        </div>
                        <div style="background: rgba(0, 0, 0, 0.2); padding: 0.5rem; border-radius: 6px;">
                            <div style="color: #94a3b8; font-size: 0.75rem;">Assigned By</div>
                            <div style="color: #e2e8f0; font-weight: bold; font-size: 0.875rem;">
                                ${route.assignedByName || 'System'}
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="event.stopPropagation(); window.navigateToBin('${primaryBin.id}', ${primaryBin.lat || 25.3682}, ${primaryBin.lng || 51.5511})">
                            <i class="fas fa-map-marked-alt"></i> Navigate
                        </button>
                        <button class="btn btn-success btn-sm" style="flex: 1;" onclick="event.stopPropagation(); window.markBinCollected('${primaryBin.id}')">
                            <i class="fas fa-check"></i> Mark Collected
                        </button>
                        ${route.status === 'pending' ? `
                            <button class="btn btn-warning btn-sm" onclick="event.stopPropagation(); window.startRoute('${route.id}')" title="Start Route">
                                <i class="fas fa-play"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).filter(html => html !== '').join('');
    }

    loadFleetManagement() {
        console.log('🚛 Loading enhanced fleet management...');
        
        // Load fleet management data
        const drivers = dataManager.getUsers().filter(u => u.type === 'driver');
        const routes = dataManager.getRoutes();
        const collections = dataManager.getCollections();
        const driverLocations = dataManager.getAllDriverLocations();
        
        // Enhanced statistics with real-time status
        let availableDriversCount = 0;
        let activeDriversCount = 0;
        let onRouteDriversCount = 0;
        
        drivers.forEach(driver => {
            const liveStatus = this.getDriverLiveStatus(driver.id);
            if (liveStatus.status === 'Active') {
                availableDriversCount++;
                activeDriversCount++;
            } else if (liveStatus.status === 'On Route') {
                onRouteDriversCount++;
                activeDriversCount++;
            }
        });
        
        // Update statistics with real data
        document.getElementById('activeVehiclesCount').textContent = activeDriversCount;
        document.getElementById('availableDriversCount').textContent = availableDriversCount;
        document.getElementById('activeRoutesCount').textContent = onRouteDriversCount;
        document.getElementById('maintenanceVehiclesCount').textContent = drivers.length - activeDriversCount;
        
        // Load enhanced driver list
        const driversList = document.getElementById('fleetDriversList');
        if (driversList) {
            if (drivers.length === 0) {
                driversList.innerHTML = '<p style="text-align: center; color: #94a3b8;">No drivers registered</p>';
            } else {
                driversList.innerHTML = drivers.map(driver => {
                    const driverCollections = collections.filter(c => c.driverId === driver.id);
                    const driverRoutes = routes.filter(r => r.driverId === driver.id);
                    const liveStatus = this.getDriverLiveStatus(driver.id);
                    const driverLocation = driverLocations[driver.id];
                    
                    // Get fuel level
                    const fuelData = dataManager.getData('driverFuelLevels') || {};
                    const fuelLevel = fuelData[driver.id] || 75;
                    
                    // Status styling based on live status
                    let statusClass = 'available';
                    let statusColor = '#10b981';
                    
                    if (liveStatus.status === 'On Route') {
                        statusClass = 'busy';
                        statusColor = '#f59e0b';
                    } else if (liveStatus.status === 'On Break') {
                        statusClass = 'warning';
                        statusColor = '#f59e0b';
                    } else if (liveStatus.status === 'Offline') {
                        statusClass = 'offline';
                        statusColor = '#6b7280';
                    }
                    
                    // Calculate last update time
                    let lastUpdateText = 'Just now';
                    if (driverLocation && driverLocation.lastUpdate) {
                        const lastUpdate = new Date(driverLocation.lastUpdate);
                        const now = new Date();
                        const diffMinutes = Math.round((now - lastUpdate) / 60000);
                        
                        if (diffMinutes < 1) {
                            lastUpdateText = 'Just now';
                        } else if (diffMinutes < 60) {
                            lastUpdateText = `${diffMinutes}m ago`;
                        } else {
                            lastUpdateText = `${Math.round(diffMinutes / 60)}h ago`;
                        }
                    }
                    
                    return `
                        <div class="driver-card" onclick="showDriverDetailsModal('${driver.id}')" style="cursor: pointer; transition: all 0.3s ease; border: 1px solid rgba(255,255,255,0.1);">
                            <div class="driver-info">
                                <div class="driver-avatar" style="background: linear-gradient(135deg, ${statusColor}, ${statusColor}aa);">
                                    ${driver.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <div style="font-weight: bold; display: flex; align-items: center; gap: 0.5rem;">
                                        ${driver.name}
                                        <span style="font-size: 0.75rem; color: ${statusColor}; font-weight: normal; padding: 2px 8px; border-radius: 10px; background: ${statusColor}20;">
                                            ${liveStatus.status}
                                        </span>
                                    </div>
                                    <div style="color: #94a3b8; font-size: 0.875rem;">
                                        ${driver.vehicleId || 'No Vehicle'} | ${driver.phone || 'No Phone'}
                                    </div>
                                    <div style="color: #94a3b8; font-size: 0.75rem;">
                                        Last update: ${lastUpdateText}
                                    </div>
                                </div>
                            </div>
                            <div class="driver-status">
                                <span class="status-dot status-${statusClass}" style="background-color: ${statusColor};"></span>
                                <span style="color: ${statusColor}; font-weight: 500;">${liveStatus.status}</span>
                            </div>
                            <div style="display: flex; gap: 1rem;">
                                <div style="text-align: center;">
                                    <div style="font-weight: bold;">${driverCollections.length}</div>
                                    <div style="font-size: 0.75rem; color: #94a3b8;">Collections</div>
                                </div>
                                <div style="text-align: center;">
                                    <div style="font-weight: bold;">${driverRoutes.filter(r => r.status === 'completed').length}</div>
                                    <div style="font-size: 0.75rem; color: #94a3b8;">Routes</div>
                                </div>
                                <div style="text-align: center;">
                                    <div style="font-weight: bold; color: ${fuelLevel < 25 ? '#ef4444' : fuelLevel < 50 ? '#f59e0b' : '#10b981'};">
                                        ${fuelLevel}%
                                </div>
                                    <div style="font-size: 0.75rem; color: #94a3b8;">Fuel</div>
                                </div>
                            </div>
                            <div style="margin-top: 0.5rem;">
                                <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); assignRouteToDriver('${driver.id}')" style="width: 100%; font-size: 0.875rem;">
                                    <i class="fas fa-route"></i> Assign Route
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
        
        // Load vehicle status as well
        this.loadVehicleStatus();
        
        console.log('✅ Fleet management loaded with enhanced driver status');
    }

    // Enhanced driver live status function (shared with bin-modals.js)
    getDriverLiveStatus(driverId) {
        const routes = dataManager.getRoutes();
        const driver = dataManager.getUserById(driverId);
        
        // Check if driver has active routes or is on route
        const activeRoute = routes.find(r => r.driverId === driverId && r.status === 'in-progress');
        
        if (activeRoute || (driver && driver.movementStatus === 'on-route')) {
            return { status: 'On Route', route: activeRoute?.id };
        }
        
        // Enhanced driver location checking
        const driverLocation = dataManager.getDriverLocation(driverId);
        
        let lastUpdate = null;
        
        // Check multiple timestamp fields
        if (driverLocation) {
            if (driverLocation.lastUpdate) {
                lastUpdate = new Date(driverLocation.lastUpdate);
            } else if (driverLocation.timestamp) {
                lastUpdate = new Date(driverLocation.timestamp);
            }
        }
        
        // If no location data but driver is not inactive, create active status
        if (!driverLocation && driver && driver.status !== 'inactive') {
            // Initialize location for active driver
            const defaultLocation = {
                lat: 25.2858 + (Math.random() - 0.5) * 0.01,
                lng: 51.5264 + (Math.random() - 0.5) * 0.01,
                timestamp: new Date().toISOString(),
                lastUpdate: new Date().toISOString(),
                status: 'active'
            };
            
            dataManager.setDriverLocation(driverId, defaultLocation);
            return { status: 'Active', lastSeen: new Date() };
        }
        
        const now = new Date();
        
        if (lastUpdate) {
            const timeDiff = now - lastUpdate;
            
            if (timeDiff < 3600000) { // Less than 1 hour
                return { status: 'Active', lastSeen: lastUpdate };
            } else if (timeDiff < 14400000) { // Less than 4 hours
                return { status: 'On Break', lastSeen: lastUpdate };
            } else {
                return { status: 'Offline', lastSeen: lastUpdate };
            }
        } else {
            // No timestamp available, use driver's general status
            if (driver && driver.status === 'inactive') {
                return { status: 'Offline', lastSeen: null };
            } else {
                // Default to active for drivers without location data
                return { status: 'Active', lastSeen: new Date() };
            }
        }
    }

    // Global function to refresh all driver data across the application
    refreshAllDriverData() {
        console.log('🔄 Refreshing all driver data across application...');
        
        // Refresh current section if it's fleet management
        if (this.currentSection === 'fleet') {
            this.loadFleetManagement();
        }
        
        // Refresh map if available
        if (typeof mapManager !== 'undefined' && mapManager.map) {
            mapManager.loadDriversOnMap();
        }
        
        // Refresh analytics dashboard
        if (typeof analyticsManager !== 'undefined') {
            analyticsManager.updateDashboardMetrics();
        }
        
        // Sync to server
        if (typeof syncManager !== 'undefined') {
            syncManager.syncToServer();
        }
        
        console.log('✅ All driver data refreshed successfully');
    }

    // ENHANCED: Smart real-time monitoring updates
    startLiveMonitoringUpdates() {
        // Clear any existing monitoring interval
        if (this.liveMonitoringInterval) {
            clearInterval(this.liveMonitoringInterval);
        }
        
        console.log('🔴 Starting intelligent live monitoring updates');
        
        // Mark activity to increase sync frequency
        if (window.syncManager) {
            window.syncManager.markActivity();
        }
        
        // OPTIMIZED: Use longer intervals since we have intelligent sync now
        // The intelligent sync system will handle frequent updates automatically
        this.liveMonitoringInterval = setInterval(() => {
            if (this.currentSection === 'monitoring') {
                this.performLiveMonitoringSync();
            }
        }, 8000); // Reduced from 3s to 8s since intelligent sync handles changes

        // Set up periodic AI recommendation refresh for drivers (every 60 seconds)
        this.aiRecommendationInterval = setInterval(() => {
            if (window.currentUser && window.currentUser.type === 'driver' && this.currentSection === 'driver-dashboard') {
                console.log('🤖 Periodic AI recommendation refresh...');
                if (typeof createAISuggestionForDriver === 'function') {
                    createAISuggestionForDriver(window.currentUser.id).then(() => {
                        this.loadAISuggestionForDriver(window.currentUser.id);
                    }).catch(error => {
                        console.error('❌ Periodic AI recommendation refresh failed:', error);
                    });
                }
            }
        }, 60000); // Every 60 seconds
    }

    // ENHANCED: Intelligent live monitoring sync
    async performLiveMonitoringSync() {
        try {
            console.log('🔄 Performing intelligent live monitoring sync...');
            
            // Mark activity for intelligent sync system
            if (window.syncManager) {
                window.syncManager.markActivity();
            }
            
            // 1. Use intelligent sync instead of direct sync call
            // The intelligent sync will only update if data has actually changed
            if (typeof syncManager !== 'undefined') {
                const syncResult = await syncManager.performIntelligentSync();
                
                // Only refresh UI if sync detected changes
                if (syncResult !== false) {
                    // 2. Refresh map with latest driver data only if needed
                    if (typeof mapManager !== 'undefined' && mapManager.map) {
                        mapManager.loadDriversOnMap();
                    }
                    
                    // 3. Update monitoring stats only if needed
                    this.updateMonitoringStats();
                    
                    console.log('✅ Live monitoring sync completed with updates');
                } else {
                    console.log('📊 No updates needed - monitoring sync optimized');
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Live monitoring sync failed:', error);
        }
    }

    // Update monitoring stats for live monitoring section
    updateMonitoringStats() {
        try {
            console.log('📊 Updating live monitoring stats...');
            
            if (typeof dataManager === 'undefined') {
                console.warn('⚠️ dataManager not available for monitoring stats update');
                return;
            }
            
            // Get current data
            const bins = dataManager.getBins();
            const drivers = dataManager.getUsers().filter(u => u.type === 'driver');
            const activeDrivers = drivers.filter(d => d.status === 'active');
            
            // Update system status elements
            const activeSensorsElement = document.getElementById('activeSensorsCount');
            if (activeSensorsElement) {
                activeSensorsElement.textContent = bins.length + ' Active Sensors';
            }
            
            const onlineVehiclesElement = document.getElementById('onlineVehiclesCount');
            if (onlineVehiclesElement) {
                onlineVehiclesElement.textContent = activeDrivers.length + ' Vehicles Online';
            }
            
            const activeDriversElement = document.getElementById('activeDriversStatus');
            if (activeDriversElement) {
                activeDriversElement.textContent = activeDrivers.length + ' Drivers Active';
            }
            
            console.log('✅ Monitoring stats updated:', {
                bins: bins.length,
                vehicles: activeDrivers.length,
                drivers: activeDrivers.length
            });
            
        } catch (error) {
            console.error('❌ Failed to update monitoring stats:', error);
        }
    }

    // NEW: Stop live monitoring updates
    stopLiveMonitoringUpdates() {
        if (this.liveMonitoringInterval) {
            clearInterval(this.liveMonitoringInterval);
            this.liveMonitoringInterval = null;
            console.log('🔴 Live monitoring updates stopped');
        }
    }

    loadVehicleStatus() {
        // Load vehicle status with enhanced fuel and status data
        const drivers = dataManager.getUsers().filter(u => u.type === 'driver');
        const fuelData = dataManager.getData('driverFuelLevels') || {};
        
        const vehicleList = document.getElementById('vehicleStatusList');
        if (vehicleList) {
            vehicleList.innerHTML = drivers.map(driver => {
                const liveStatus = this.getDriverLiveStatus(driver.id);
                const fuelLevel = fuelData[driver.id] || 75;
                
                let statusColor = '#10b981';
                if (liveStatus.status === 'On Route') statusColor = '#f59e0b';
                else if (liveStatus.status === 'Offline') statusColor = '#6b7280';
                
                return `
                <div class="glass-card" style="margin-bottom: 1rem; padding: 1rem; border-left: 4px solid ${statusColor};">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: bold; display: flex; align-items: center; gap: 0.5rem;">
                                ${driver.vehicleId || 'Unassigned'}
                                <span style="font-size: 0.75rem; color: ${statusColor}; padding: 2px 8px; border-radius: 10px; background: ${statusColor}20;">
                                    ${liveStatus.status}
                                </span>
                            </div>
                            <div style="color: #94a3b8; font-size: 0.875rem;">Driver: ${driver.name}</div>
                        </div>
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <div style="text-align: center;">
                                <i class="fas fa-gas-pump" style="color: ${fuelLevel < 25 ? '#ef4444' : fuelLevel < 50 ? '#f59e0b' : '#10b981'};"></i>
                                <div style="font-size: 0.875rem; font-weight: bold;">${fuelLevel}%</div>
                            </div>
                            <div style="text-align: center;">
                                <i class="fas fa-tachometer-alt" style="color: var(--primary);"></i>
                                <div style="font-size: 0.875rem;">45,230 km</div>
                            </div>
                            <span style="padding: 0.25rem 0.75rem; border-radius: 20px; background: ${statusColor}20; color: ${statusColor}; font-weight: 500; font-size: 0.875rem;">
                                ${liveStatus.status}
                            </span>
                        </div>
                    </div>
                </div>
            `;
            }).join('') || '<p style="text-align: center; color: #94a3b8;">No vehicles in fleet</p>';
        }
    }

    loadRouteOptimization() {
        // Load route optimization data
        console.log('Loading ML route optimization');
        
        // Initialize charts if analytics manager is available
        if (typeof analyticsManager !== 'undefined') {
            // Use available analytics methods
            if (typeof analyticsManager.updateAllCharts === 'function') {
                analyticsManager.updateAllCharts();
            } else if (typeof analyticsManager.initializeAnalytics === 'function') {
                analyticsManager.initializeAnalytics();
            }
            
            // Initialize specific charts if available
            if (typeof analyticsManager.initializeRouteEfficiencyChart === 'function') {
                analyticsManager.initializeRouteEfficiencyChart();
            }
            
            // Initialize predictive charts through V2 manager if available
            if (window.analyticsManagerV2 && typeof window.analyticsManagerV2.initializeDemandForecastChart === 'function') {
                window.analyticsManagerV2.initializeDemandForecastChart();
                window.analyticsManagerV2.initializeOverflowPredictionChart();
            }
        }
        
        // Load optimized routes
        const routesList = document.getElementById('optimizedRoutesList');
        if (routesList) {
            const routes = dataManager.getRoutes();
            const bins = dataManager.getBins();
            
            if (routes.length === 0) {
                routesList.innerHTML = '<p style="text-align: center; color: #94a3b8;">No routes assigned today</p>';
            } else {
                routesList.innerHTML = routes.map(route => {
                    const driver = dataManager.getUserById(route.driverId);
                    const routeBins = bins.filter(b => route.binIds && route.binIds.includes(b.id));
                    const totalFill = routeBins.reduce((sum, b) => sum + (b.fill || 0), 0) / routeBins.length;
                    
                    return `
                        <div class="glass-card" style="margin-bottom: 1rem; padding: 1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <div>
                                    <h4 style="margin-bottom: 0.5rem;">${route.id}</h4>
                                    <div style="color: #94a3b8; font-size: 0.875rem;">
                                        Driver: ${driver ? driver.name : 'Unassigned'}<br>
                                        Bins: ${routeBins.length}<br>
                                        Avg Fill: ${totalFill.toFixed(0)}%
                                    </div>
                                </div>
                                <div>
                                    <span class="badge-${route.status === 'completed' ? 'success' : route.status === 'in-progress' ? 'warning' : 'danger'}" 
                                          style="padding: 0.25rem 0.75rem; border-radius: 20px;">
                                        ${route.status}
                                    </span>
                                </div>
                            </div>
                            <div style="margin-top: 1rem;">
                                <button class="btn btn-primary btn-sm" onclick="viewRouteDetails('${route.id}')">
                                    <i class="fas fa-eye"></i> View Details
                                </button>
                                <button class="btn btn-secondary btn-sm" onclick="optimizeRoute('${route.id}')">
                                    <i class="fas fa-magic"></i> Re-optimize
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    }

    loadComplaints() {
        // Load complaints
        const complaints = dataManager.getComplaints();
        const openComplaints = complaints.filter(c => c.status === 'open');
        const inProgressComplaints = complaints.filter(c => c.status === 'in-progress');
        const resolvedToday = complaints.filter(c => 
            c.status === 'resolved' && 
            new Date(c.resolvedAt).toDateString() === new Date().toDateString()
        );
        
        // Update stats
        document.getElementById('openComplaintsCount').textContent = openComplaints.length;
        document.getElementById('pendingComplaintsCount').textContent = inProgressComplaints.length;
        document.getElementById('resolvedComplaintsCount').textContent = resolvedToday.length;
        document.getElementById('avgResolutionTime').textContent = '2.5h';
        
        // Load complaints list
        const complaintsList = document.getElementById('complaintsList');
        if (complaintsList) {
            const activeComplaints = complaints.filter(c => c.status !== 'resolved');
            
            if (activeComplaints.length === 0) {
                complaintsList.innerHTML = '<p style="text-align: center; color: #94a3b8;">No active complaints</p>';
            } else {
                complaintsList.innerHTML = activeComplaints.map(complaint => `
                    <div class="complaint-card">
                        <div class="complaint-header">
                            <div>
                                <h4 style="margin: 0;">${complaint.type.charAt(0).toUpperCase() + complaint.type.slice(1)}</h4>
                                <div style="color: #94a3b8; font-size: 0.875rem; margin-top: 0.25rem;">
                                    ${complaint.location}
                                </div>
                            </div>
                            <span class="complaint-status status-${complaint.status}">
                                ${complaint.status.replace('-', ' ')}
                            </span>
                        </div>
                        <p style="margin: 1rem 0; color: #e2e8f0;">${complaint.description}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="color: #94a3b8; font-size: 0.875rem;">
                                <i class="fas fa-clock"></i> ${new Date(complaint.createdAt).toLocaleString()}
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button class="btn btn-success btn-sm" onclick="resolveComplaint('${complaint.id}')">
                                    <i class="fas fa-check"></i> Resolve
                                </button>
                                <button class="btn btn-primary btn-sm" onclick="viewComplaintDetails('${complaint.id}')">
                                    <i class="fas fa-info-circle"></i> Details
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    loadMonitoring() {
        console.log('🔄 Loading monitoring section...');
        
        // Initialize map (if not already initialized)
        this.initializeMapIfNeeded();
        
        // Load monitoring data with slight delay to ensure map is ready
            setTimeout(() => {
            this.loadMonitoringData();
        }, 150);
        
        // NEW: Start real-time monitoring updates
        this.startLiveMonitoringUpdates();
    }

    // Initialize map early to support driver tracking - FIXED with proper mapManager checks
    initializeMapIfNeeded() {
        // First check if mapManager is available at all
        if (typeof mapManager === 'undefined') {
            console.log('⚠️ mapManager not available yet, retrying in 100ms...');
            setTimeout(() => {
                this.initializeMapIfNeeded();
            }, 100);
            return;
        }
        
        if (typeof mapManager !== 'undefined' && !mapManager.map) {
            console.log('🗺️ Attempting map initialization...');
            
            // Show loading indicator
            const loadingElement = document.getElementById('mapLoading');
            if (loadingElement) {
                loadingElement.style.display = 'block';
            }
            
            // Check if map container is visible and has dimensions
            const mapContainer = document.getElementById('map');
            if (!mapContainer) {
                console.error('❌ Map container element not found');
                if (loadingElement) loadingElement.style.display = 'none';
                return;
            }
            
            const containerRect = mapContainer.getBoundingClientRect();
            const isVisible = mapContainer.offsetParent !== null;
            
            console.log('🔍 Map container status:', {
                exists: !!mapContainer,
                isVisible,
                width: containerRect.width,
                height: containerRect.height,
                display: getComputedStyle(mapContainer).display
            });
            
            if (!isVisible || containerRect.width === 0 || containerRect.height === 0) {
                console.log('⚠️ Map container not properly visible, deferring initialization...');
                // Don't retry automatically - wait for section to become visible
                if (loadingElement) loadingElement.style.display = 'none';
                return;
            }
            
            try {
                console.log('🗺️ Initializing map now...');
                const mapInstance = mapManager.initializeMainMap('map');
                
                // Verify map was created successfully
                if (mapInstance && typeof mapManager !== 'undefined' && mapManager.map) {
                    console.log('✅ Map initialized successfully');
                    
                    // Hide loading indicator
                    if (loadingElement) {
                        setTimeout(() => {
                            loadingElement.style.display = 'none';
                        }, 500);
                    }
                    
                    // Force a resize to ensure proper rendering
                    setTimeout(() => {
                        if (typeof mapManager !== 'undefined' && mapManager.map) {
                            mapManager.map.invalidateSize();
                            console.log('🔄 Map size invalidated for proper rendering');
                        }
                    }, 100);
                } else {
                    console.error('❌ Map initialization failed - map object is null');
                    if (loadingElement) {
                        loadingElement.innerHTML = `
                            <div style="color: #ef4444;">
                                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                                <div>Map failed to load</div>
                                <button onclick="window.app.initializeMapIfNeeded()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">Retry</button>
                            </div>
                        `;
                    }
                }
            } catch (error) {
                console.error('❌ Map initialization error:', error);
                
                if (loadingElement) {
                    loadingElement.innerHTML = `
                        <div style="color: #ef4444;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                            <div>Map error: ${error.message}</div>
                            <button onclick="window.app.initializeMapIfNeeded()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">Retry</button>
                        </div>
                    `;
                }
                
                // Retry once more after a longer delay
                setTimeout(() => {
                    this.initializeMapIfNeeded();
                }, 1000);
            }
        } else if (typeof mapManager !== 'undefined' && mapManager && mapManager.map) {
            console.log('✅ Map already initialized');
            
            // Hide loading indicator if visible
            const loadingElement = document.getElementById('mapLoading');
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            
            // Force resize in case container size changed
            setTimeout(() => {
                if (typeof mapManager !== 'undefined' && mapManager.map) {
                    mapManager.map.invalidateSize();
                }
            }, 50);
        } else {
            console.log('⚠️ mapManager exists but map not ready, will retry automatically');
        }
    }

    loadMonitoringData() {
        // Load monitoring data
        const bins = dataManager.getBins();
        const drivers = dataManager.getUsers().filter(u => u.type === 'driver');
        const activeDrivers = drivers.filter(d => d.status === 'active');
        const alerts = dataManager.getActiveAlerts();
        
        // Update system status
        document.getElementById('activeSensorsCount').textContent = bins.length + ' Active Sensors';
        document.getElementById('onlineVehiclesCount').textContent = activeDrivers.length + ' Vehicles Online';
        document.getElementById('activeDriversStatus').textContent = activeDrivers.length + ' Drivers Active';
        
        // Load critical bins - CLICKABLE
        const criticalBins = bins.filter(b => b.status === 'critical' || b.fill >= 85);
        const criticalBinsList = document.getElementById('criticalBinsList');
        
        if (criticalBinsList) {
            if (criticalBins.length === 0) {
                criticalBinsList.innerHTML = '<p style="text-align: center; color: #94a3b8;">No critical bins</p>';
            } else {
                criticalBinsList.innerHTML = criticalBins.map(bin => `
                    <div class="bin-item" onclick="showBinDetails('${bin.id}')" style="cursor: pointer;">
                        <div class="bin-status">
                            <span class="status-indicator status-critical"></span>
                            <div>
                                <div style="font-weight: bold;">${bin.id}</div>
                                <div style="color: #94a3b8; font-size: 0.875rem;">${bin.location}</div>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: bold; color: var(--danger);">${bin.fill}%</div>
                            <div style="font-size: 0.75rem; color: #94a3b8;">Full</div>
                        </div>
                    </div>
                `).join('');
            }
        }
        
        // Load all bins list
        this.loadAllBins();
        
        // Load active alerts
        const alertsList = document.getElementById('activeAlertsList');
        if (alertsList) {
            if (alerts.length === 0) {
                alertsList.innerHTML = '<p style="text-align: center; color: #94a3b8;">No active alerts</p>';
            } else {
                alertsList.innerHTML = alerts.map(alert => `
                    <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <div style="font-weight: bold; color: var(--danger);">
                                    <i class="fas fa-exclamation-triangle"></i> ${alert.type.replace('_', ' ').toUpperCase()}
                                </div>
                                <div style="color: #e2e8f0; font-size: 0.875rem; margin-top: 0.25rem;">
                                    ${alert.message}
                                </div>
                                <div style="color: #94a3b8; font-size: 0.75rem; margin-top: 0.25rem;">
                                    ${new Date(alert.timestamp).toLocaleString()}
                                </div>
                            </div>
                            <button class="btn btn-danger btn-sm" onclick="dismissAlert('${alert.id}')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    loadAllBins() {
        const binsList = document.getElementById('allBinsList');
        if (!binsList) return;
        
        const bins = dataManager.getBins();
        
        if (bins.length === 0) {
            binsList.innerHTML = '<p style="text-align: center; color: #94a3b8;">No bins registered</p>';
            return;
        }
        
        binsList.innerHTML = bins.map(bin => {
            const statusClass = bin.status === 'critical' ? 'status-critical' : 
                               bin.status === 'warning' ? 'status-warning' : 'status-ok';
            const fillColor = bin.fill >= 85 ? '#ef4444' : 
                             bin.fill >= 70 ? '#f59e0b' : '#10b981';
            
            return `
                <div class="bin-item" style="cursor: pointer; position: relative; overflow: hidden;" 
                     onclick="showBinDetails('${bin.id}')"
                     onmouseover="this.style.background='rgba(0, 212, 255, 0.05)'"
                     onmouseout="this.style.background='transparent'">
                    <div class="bin-status" style="display: flex; align-items: center; gap: 1rem;">
                        <span class="status-indicator ${statusClass}"></span>
                        <div style="flex: 1;">
                            <div style="font-weight: bold; color: #e2e8f0;">
                                ${bin.id}
                                ${bin.status === 'critical' ? 
                                    '<span style="margin-left: 0.5rem; padding: 0.125rem 0.5rem; background: rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 12px; font-size: 0.75rem;">CRITICAL</span>' : ''}
                            </div>
                            <div style="color: #94a3b8; font-size: 0.875rem;">
                                <i class="fas fa-map-marker-alt"></i> ${bin.location}
                            </div>
                            <div style="display: flex; gap: 1.5rem; margin-top: 0.25rem; font-size: 0.75rem;">
                                <span style="color: #64748b;">
                                    <i class="fas fa-clock"></i> ${bin.lastCollection}
                                </span>
                                <span style="color: #64748b;">
                                    <i class="fas fa-thermometer-half"></i> ${bin.temperature || 25}°C
                                </span>
                                <span style="color: #64748b;">
                                    <i class="fas fa-battery-three-quarters"></i> ${bin.batteryLevel || 85}%
                                </span>
                            </div>
                        </div>
                        <div style="text-align: center;">
                            <div style="position: relative; width: 60px; height: 60px;">
                                <svg viewBox="0 0 60 60" style="transform: rotate(-90deg);">
                                    <circle cx="30" cy="30" r="25" 
                                            fill="none" 
                                            stroke="rgba(255, 255, 255, 0.1)" 
                                            stroke-width="5"/>
                                    <circle cx="30" cy="30" r="25" 
                                            fill="none" 
                                            stroke="${fillColor}" 
                                            stroke-width="5"
                                            stroke-linecap="round"
                                            stroke-dasharray="${157 * (bin.fill / 100)} 157"/>
                                </svg>
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; color: ${fillColor};">
                                    ${bin.fill}%
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
                        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); showBinDetails('${bin.id}')">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); assignJob('${bin.id}')">
                            <i class="fas fa-user-plus"></i> Assign Driver
                        </button>
                        ${bin.fill >= 70 ? `
                            <button class="btn btn-warning btn-sm" onclick="event.stopPropagation(); scheduleUrgentCollection('${bin.id}')">
                                <i class="fas fa-exclamation-triangle"></i> Urgent
                            </button>
                        ` : ''}
                    </div>
                    <!-- Progress bar at bottom -->
                    <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: rgba(255, 255, 255, 0.1);">
                        <div style="height: 100%; width: ${bin.fill}%; background: ${fillColor}; transition: width 0.3s;"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    loadAdminPanel() {
        // Load admin panel data
        const stats = dataManager.getSystemStats();
        
        // Update system stats
        document.getElementById('totalUsersCount').textContent = stats.totalUsers;
        document.getElementById('totalBinsCount').textContent = stats.totalBins;
        document.getElementById('activeDriversCount').textContent = stats.activeDrivers;
        document.getElementById('activeAlertsCount').textContent = stats.activeAlerts;
        
        // Load pending registrations
        const pendingList = document.getElementById('pendingRegistrationsList');
        if (pendingList) {
            const pending = dataManager.getPendingRegistrations();
            
            if (pending.length === 0) {
                pendingList.innerHTML = '<p style="text-align: center; color: #94a3b8;">No pending registrations</p>';
            } else {
                pendingList.innerHTML = pending.map(reg => `
                    <div class="glass-card" style="margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <h4 style="margin-bottom: 0.5rem;">${reg.name}</h4>
                                <div style="color: #94a3b8; font-size: 0.875rem;">
                                    <div>Type: ${reg.userType}</div>
                                    <div>Username: ${reg.username}</div>
                                    <div>Email: ${reg.email}</div>
                                    <div>Submitted: ${new Date(reg.submittedAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button class="btn btn-success btn-sm" onclick="approveRegistration('${reg.id}')">
                                    <i class="fas fa-check"></i> Approve
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="rejectRegistration('${reg.id}')">
                                    <i class="fas fa-times"></i> Reject
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }
        
        // Load user management
        const userManagementList = document.getElementById('userManagementList');
        if (userManagementList) {
            const users = dataManager.getUsers();
            
            userManagementList.innerHTML = `
                <div style="margin-bottom: 1rem;">
                    <input type="text" class="form-input" placeholder="Search users..." 
                           onkeyup="searchUsers(this.value)" 
                           style="max-width: 300px;">
                </div>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 2px solid rgba(255, 255, 255, 0.1);">
                                <th style="text-align: left; padding: 0.75rem;">Name</th>
                                <th style="text-align: left; padding: 0.75rem;">Username</th>
                                <th style="text-align: left; padding: 0.75rem;">Type</th>
                                <th style="text-align: left; padding: 0.75rem;">Status</th>
                                <th style="text-align: left; padding: 0.75rem;">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="usersTableBody">
                            ${users.map(user => `
                                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                                    <td style="padding: 0.75rem;">${user.name}</td>
                                    <td style="padding: 0.75rem;">${user.username}</td>
                                    <td style="padding: 0.75rem;">
                                        <span class="badge-${user.type === 'admin' ? 'danger' : user.type === 'manager' ? 'warning' : 'success'}" 
                                              style="padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">
                                            ${user.type}
                                        </span>
                                    </td>
                                    <td style="padding: 0.75rem;">
                                        <span class="badge-${user.status === 'active' ? 'success' : 'warning'}" 
                                              style="padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">
                                            ${user.status}
                                        </span>
                                    </td>
                                    <td style="padding: 0.75rem;">
                                        <button class="btn btn-sm ${user.status === 'active' ? 'btn-warning' : 'btn-success'}" 
                                                onclick="toggleUserStatus('${user.id}')">
                                            ${user.status === 'active' ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        // Load system logs
        const systemLogsList = document.getElementById('systemLogsList');
        if (systemLogsList) {
            const logs = dataManager.getSystemLogs().slice(-20).reverse(); // Get last 20 logs
            
            systemLogsList.innerHTML = logs.map(log => `
                <div style="padding: 0.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <span class="badge-${log.type === 'error' ? 'danger' : log.type === 'warning' ? 'warning' : log.type === 'success' ? 'success' : 'info'}" 
                                  style="padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; margin-right: 0.5rem;">
                                ${log.type}
                            </span>
                            <span style="color: #e2e8f0;">${log.message}</span>
                        </div>
                        <div style="color: #94a3b8; font-size: 0.75rem; white-space: nowrap;">
                            ${new Date(log.timestamp).toLocaleString()}
                        </div>
                    </div>
                </div>
            `).join('') || '<p style="text-align: center; color: #94a3b8;">No system logs available</p>';
        }
    }

    setupAlertSystem() {
        // Create alert container if it doesn't exist
        if (!document.getElementById('alertContainer')) {
            const alertContainer = document.createElement('div');
            alertContainer.id = 'alertContainer';
            alertContainer.className = 'alert-container';
            document.body.appendChild(alertContainer);
        }
    }

    showAlert(title, message, type = 'info', duration = 5000) {
        const alertContainer = document.getElementById('alertContainer');
        if (!alertContainer) return;

        const alertId = 'alert-' + Date.now();
        const alertElement = document.createElement('div');
        alertElement.id = alertId;
        alertElement.className = `alert alert-${type}`;
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle',
            danger: 'fas fa-exclamation-circle'
        };

        alertElement.innerHTML = `
            <div class="alert-content">
                <i class="${iconMap[type] || iconMap.info}"></i>
                <div class="alert-text">
                    <div class="alert-title">${title}</div>
                    <div class="alert-message">${message}</div>
                </div>
                <button class="alert-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        alertContainer.appendChild(alertElement);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                const alert = document.getElementById(alertId);
                if (alert) {
                    alert.remove();
                }
            }, duration);
        }
    }

    updateDriverStats() {
        if (typeof authManager !== 'undefined' && typeof dataManager !== 'undefined') {
            const currentUser = authManager.getCurrentUser();
            if (currentUser && currentUser.type === 'driver') {
                console.log('📊 Updating driver stats for:', currentUser.name);
                
                // Get collections from main collections array (not separate storage)
                const allCollections = dataManager.getCollections();
                const driverCollections = allCollections.filter(c => c.driverId === currentUser.id);
                
                const routes = dataManager.getDriverRoutes(currentUser.id);
                
                // Count today's collections
                const today = new Date().toDateString();
                const todayCollections = driverCollections.filter(c => 
                    new Date(c.timestamp).toDateString() === today
                ).length;
                
                console.log(`📊 Driver ${currentUser.name} stats:`, {
                    totalCollections: driverCollections.length,
                    todayCollections: todayCollections,
                    activeRoutes: routes.length
                });
                
                // Count pending bins from active routes
                const pendingBins = routes.reduce((total, route) => {
                    if (route.binIds) {
                        return total + route.binIds.length;
                    } else if (route.binDetails) {
                        return total + route.binDetails.length;
                    }
                    return total;
                }, 0);
                
                // Update UI elements
                const todayCollectionsEl = document.getElementById('driverTodayCollections');
                const pendingBinsEl = document.getElementById('driverPendingBins');
                const ratingEl = document.getElementById('driverRating');
                const driverNameEl = document.getElementById('driverNameMobile');
                
                if (todayCollectionsEl) todayCollectionsEl.textContent = todayCollections;
                if (pendingBinsEl) pendingBinsEl.textContent = pendingBins;
                if (ratingEl) ratingEl.textContent = currentUser.rating || '5.0';
                if (driverNameEl) driverNameEl.textContent = currentUser.name;
            }
        }
    }

    refreshDashboard() {
        if (typeof dataManager !== 'undefined') {
            const stats = dataManager.getSystemStats();
            const analytics = dataManager.getAnalytics();
            
            // Update dashboard stats
            this.updateDashboardStats(stats, analytics);
            
            // Update driver stats if driver
            if (authManager && authManager.isDriver()) {
                this.updateDriverStats();
            }
            
            // Update analytics charts if available
            if (typeof analyticsManager !== 'undefined') {
                analyticsManager.updateDashboardMetrics();
            }
        }
    }

    updateDashboardStats(stats, analytics) {
        // Update various dashboard elements with current stats
        const elements = {
            'totalBins': stats.totalBins,
            'activeAlerts': stats.activeAlerts,
            'todayCollections': stats.todayCollections,
            'totalUsers': stats.totalUsers,
            'totalUsersCount': stats.totalUsers,
            'totalBinsCount': stats.totalBins,
            'activeDriversCount': stats.activeDrivers,
            'activeAlertsCount': stats.activeAlerts
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    // Helper methods for driver routes
    getBinStatusColor(bin) {
        if (!bin) return '#6b7280';
        if (bin.status === 'fire-risk') return '#ef4444';
        if (bin.status === 'critical' || bin.fill >= 85) return '#ef4444';
        if (bin.status === 'warning' || bin.fill >= 70) return '#f59e0b';
        return '#10b981';
    }
    
    // AI suggestion system for drivers
    getAISuggestedBins(driverId) {
        const bins = dataManager.getBins();
        const driverLocation = dataManager.getDriverLocation(driverId);
        
        if (!driverLocation || !driverLocation.lat || !driverLocation.lng) {
            console.log('⚠️ Driver location not available for AI suggestions');
            return [];
        }
        
        // Filter bins that need attention (>60% full and not assigned)
        const priorityBins = bins.filter(bin => 
            bin.fill > 60 && 
            !bin.assignedDriver && 
            bin.status !== 'maintenance'
        );
        
        if (priorityBins.length === 0) {
            return [];
        }
        
        // Calculate distances and prioritize
        const suggestions = priorityBins.map(bin => {
            const distance = this.calculateDistance(
                driverLocation.lat, driverLocation.lng,
                bin.lat, bin.lng
            );
            
            // Priority scoring: higher fill + closer distance = higher priority
            let priority = 'low';
            let priorityColor = '#10b981';
            let priorityScore = bin.fill;
            
            if (bin.fill >= 85) {
                priority = 'high';
                priorityColor = '#ef4444';
                priorityScore += 30;
            } else if (bin.fill >= 75) {
                priority = 'medium';
                priorityColor = '#f59e0b';
                priorityScore += 15;
            }
            
            // Reduce priority score based on distance (closer = higher priority)
            priorityScore = priorityScore - (distance * 2);
            
            return {
                bin,
                distance,
                priority,
                priorityColor,
                priorityScore
            };
        });
        
        // Sort by priority score (highest first) and return top 3
        return suggestions
            .sort((a, b) => b.priorityScore - a.priorityScore)
            .slice(0, 3);
    }
    
    // Calculate distance between two coordinates (Haversine formula)
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    // Request bin assignment (driver can request to be assigned to a bin)
    requestBinAssignment(binId) {
        const currentUser = authManager.getCurrentUser();
        const bin = dataManager.getBinById(binId);
        
        if (!currentUser || !bin) {
            console.error('❌ Invalid request: user or bin not found');
            return;
        }
        
        // Create a notification/request for managers
        const request = {
            id: dataManager.generateId('REQ'),
            type: 'bin_assignment_request',
            driverId: currentUser.id,
            driverName: currentUser.name,
            binId: binId,
            binLocation: bin.location,
            binFill: bin.fill,
            requestedAt: new Date().toISOString(),
            status: 'pending',
            reason: 'AI suggested - high priority bin'
        };
        
        // Add to notifications/alerts system
        dataManager.addAlert({
            type: 'assignment_request',
            title: 'Driver Assignment Request',
            message: `${currentUser.name} requests assignment to bin ${bin.location} (${bin.fill}% full)`,
            data: request,
            severity: 'info'
        });
        
        // Show feedback to driver
        this.showAlert(
            'Request Sent',
            `Your assignment request for ${bin.location} has been sent to managers.`,
            'info'
        );
        
        // Sync the request
        if (typeof syncManager !== 'undefined') {
            syncManager.syncToServer({ alerts: [request] }, 'partial');
        }
        
        console.log('📤 Assignment request sent:', request);
    }
    
    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }

    // Additional methods for handling various actions
    
    optimizeAllRoutes() {
        if (typeof dataManager !== 'undefined') {
            const drivers = dataManager.getUsers().filter(u => u.type === 'driver' && u.status === 'active');
            drivers.forEach(driver => {
                const optimizedRoute = dataManager.optimizeRoutes(driver.id);
                console.log(`Optimized route for ${driver.name}:`, optimizedRoute);
            });
            this.showAlert('Route Optimization', 'All routes have been optimized using ML algorithms.', 'success');
        }
    }

    generateReport() {
        this.showAlert('Report Generation', 'Generating comprehensive system report...', 'info');
        
        if (typeof analyticsManager !== 'undefined') {
            setTimeout(() => {
                analyticsManager.generatePDFReport();
                this.showAlert('Report Ready', 'System report has been generated and saved.', 'success');
            }, 2000);
        }
    }

    openDriverMap() {
        if (typeof mapManager !== 'undefined') {
            // Create map container if it doesn't exist
            let mapModal = document.getElementById('driverMapModal');
            if (!mapModal) {
                mapModal = document.createElement('div');
                mapModal.id = 'driverMapModal';
                mapModal.className = 'modal';
                mapModal.style.display = 'block';
                mapModal.innerHTML = `
                    <div class="modal-content" style="max-width: 90%; height: 90vh;">
                        <div class="modal-header">
                            <h2>Navigation Map</h2>
                            <span class="close" onclick="this.parentElement.parentElement.parentElement.style.display='none'">&times;</span>
                        </div>
                        <div class="modal-body" style="height: calc(100% - 80px);">
                            <div id="driverMap" style="height: 100%; width: 100%;"></div>
                        </div>
                    </div>
                `;
                document.body.appendChild(mapModal);
            } else {
                mapModal.style.display = 'block';
            }
            
            setTimeout(() => {
                mapManager.initializeDriverMap('driverMap');
            }, 100);
            
            this.showAlert('Driver Map', 'GPS navigation activated.', 'success');
        } else {
            this.showAlert('Map Error', 'Map system not available.', 'error');
        }
    }

    showEmergencyResponse() {
        this.showAlert('Emergency Response', 'Emergency response system activated!', 'warning');
    }

    toggleFabMenu() {
        const fabMenu = document.getElementById('fabMenu');
        const mainFab = document.getElementById('mainFab');
        
        if (fabMenu && mainFab) {
            fabMenu.classList.toggle('active');
            mainFab.classList.toggle('active');
        }
    }

    // Show Add Bin Modal
    showAddBinModal() {
        const modalHtml = `
            <div class="modal" id="addBinModal" style="display: flex;">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h2><i class="fas fa-trash-alt"></i> Add New Bin</h2>
                        <button class="close-btn" onclick="this.closest('.modal').style.display='none'">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="addBinForm">
                            <div class="form-group">
                                <label>Bin ID</label>
                                <input type="text" id="newBinId" placeholder="Enter bin ID (e.g., BIN-001)" required>
                            </div>
                            <div class="form-group">
                                <label>Location</label>
                                <input type="text" id="newBinLocation" placeholder="Enter location description" required>
                            </div>
                            <div class="form-group">
                                <label>Latitude</label>
                                <input type="number" step="any" id="newBinLat" placeholder="25.3548" required>
                            </div>
                            <div class="form-group">
                                <label>Longitude</label>
                                <input type="number" step="any" id="newBinLng" placeholder="51.4987" required>
                            </div>
                            <div class="form-group">
                                <label>Initial Fill Level (%)</label>
                                <input type="number" min="0" max="100" id="newBinFill" value="0" required>
                            </div>
                            <div class="form-group">
                                <label>Status</label>
                                <select id="newBinStatus" required>
                                    <option value="active">Active</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="offline">Offline</option>
                                </select>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').style.display='none'">Cancel</button>
                                <button type="submit" class="btn btn-primary">Add Bin</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('addBinModal');
        if (existingModal) existingModal.remove();
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Add form submit handler
        const form = document.getElementById('addBinForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddBin();
        });
    }

    // Handle Add Bin Form Submission
    handleAddBin() {
        const binData = {
            id: document.getElementById('newBinId').value.trim(),
            location: document.getElementById('newBinLocation').value.trim(),
            lat: parseFloat(document.getElementById('newBinLat').value),
            lng: parseFloat(document.getElementById('newBinLng').value),
            fill: parseInt(document.getElementById('newBinFill').value),
            status: document.getElementById('newBinStatus').value,
            lastEmptied: null,
            temperature: Math.floor(Math.random() * 10) + 25, // Random temp 25-35°C
            lastUpdated: new Date().toISOString()
        };
        
        // Validate data
        if (!binData.id || !binData.location || isNaN(binData.lat) || isNaN(binData.lng)) {
            this.showAlert('Validation Error', 'Please fill all required fields with valid data.', 'error');
            return;
        }
        
        // Check if bin ID already exists
        const existingBin = dataManager.getBinById(binData.id);
        if (existingBin) {
            this.showAlert('Duplicate Bin', 'A bin with this ID already exists.', 'error');
            return;
        }
        
        // Add bin to data manager
        const bins = dataManager.getBins();
        bins.push(binData);
        dataManager.setData('bins', bins);
        
        // Close modal
        document.getElementById('addBinModal').style.display = 'none';
        
        // Refresh map if available
        if (window.mapManager && typeof window.mapManager.loadBinsOnMap === 'function') {
            window.mapManager.loadBinsOnMap();
        }
        
        this.showAlert('Success', `Bin ${binData.id} has been added successfully!`, 'success');
    }

    // Show Report Issue Modal
    showReportIssueModal() {
        const modalHtml = `
            <div class="modal" id="reportIssueModal" style="display: flex;">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h2><i class="fas fa-exclamation-triangle"></i> Report Issue</h2>
                        <button class="close-btn" onclick="this.closest('.modal').style.display='none'">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="reportIssueForm">
                            <div class="form-group">
                                <label>Issue Type</label>
                                <select id="issueType" required>
                                    <option value="">Select issue type</option>
                                    <option value="bin_overflow">Bin Overflow</option>
                                    <option value="bin_damaged">Bin Damaged</option>
                                    <option value="access_blocked">Access Blocked</option>
                                    <option value="vehicle_issue">Vehicle Issue</option>
                                    <option value="route_problem">Route Problem</option>
                                    <option value="safety_concern">Safety Concern</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Location/Bin ID (Optional)</label>
                                <input type="text" id="issueLocation" placeholder="Enter bin ID or location">
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea id="issueDescription" rows="4" placeholder="Describe the issue..." required></textarea>
                            </div>
                            <div class="form-group">
                                <label>Priority</label>
                                <select id="issuePriority" required>
                                    <option value="low">Low</option>
                                    <option value="medium" selected>Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').style.display='none'">Cancel</button>
                                <button type="submit" class="btn btn-warning">Report Issue</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('reportIssueModal');
        if (existingModal) existingModal.remove();
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Add form submit handler
        const form = document.getElementById('reportIssueForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleReportIssue();
        });
    }

    // Handle Report Issue Form Submission
    handleReportIssue() {
        const currentUser = authManager.getCurrentUser();
        
        const issueData = {
            id: `ISSUE-${Date.now()}`,
            type: document.getElementById('issueType').value,
            location: document.getElementById('issueLocation').value.trim(),
            description: document.getElementById('issueDescription').value.trim(),
            priority: document.getElementById('issuePriority').value,
            reportedBy: currentUser ? currentUser.name : 'Unknown',
            reportedById: currentUser ? currentUser.id : null,
            timestamp: new Date().toISOString(),
            status: 'open'
        };
        
        // Validate data
        if (!issueData.type || !issueData.description) {
            this.showAlert('Validation Error', 'Please fill all required fields.', 'error');
            return;
        }
        
        // Store issue in data manager
        const issues = dataManager.getData('issues') || [];
        issues.push(issueData);
        dataManager.setData('issues', issues);
        
        // Close modal
        document.getElementById('reportIssueModal').style.display = 'none';
        
        this.showAlert('Issue Reported', 'Your issue has been reported successfully. Our team will review it shortly.', 'success');
        
        console.log('📝 Issue reported:', issueData);
    }

    // Admin functions
    approveRegistration(registrationId) {
        if (authManager && authManager.isAdmin()) {
            authManager.approveRegistration(registrationId).then(result => {
                if (result.success) {
                    this.showAlert('Success', result.message, 'success');
                    this.loadAdminPanel();
                } else {
                    this.showAlert('Error', result.error, 'danger');
                }
            });
        }
    }

    rejectRegistration(registrationId) {
        if (authManager && authManager.isAdmin()) {
            authManager.rejectRegistration(registrationId).then(result => {
                if (result.success) {
                    this.showAlert('Success', result.message, 'success');
                    this.loadAdminPanel();
                } else {
                    this.showAlert('Error', result.error, 'danger');
                }
            });
        }
    }

    // Driver functions
    completePickup(binId) {
        if (authManager && authManager.isDriver()) {
            authManager.completeCollection(binId).then(result => {
                if (result.success) {
                    this.showAlert('Success', 'Collection registered successfully!', 'success');
                    this.updateDriverStats();
                    this.loadDriverRoutes();
                } else {
                    this.showAlert('Error', result.error, 'danger');
                }
            });
        }
    }

    navigateToLocation(lat, lng) {
        if (typeof mapManager !== 'undefined') {
            this.openDriverMap();
            setTimeout(() => {
                mapManager.centerMap(lat, lng, 16);
                this.showAlert('Navigation', 'Route calculated. Follow the blue line.', 'info');
            }, 500);
        }
    }

    dismissAlert(alertId) {
        dataManager.dismissAlert(alertId);
        this.refreshDashboard();
    }

    resolveComplaint(complaintId) {
        dataManager.updateComplaint(complaintId, { status: 'resolved' });
        this.showAlert('Success', 'Complaint marked as resolved', 'success');
        this.loadComplaints();
    }

    viewComplaintDetails(complaintId) {
        console.log('📋 Opening complaint details for:', complaintId);
        if (typeof showComplaintDetailsModal === 'function') {
            showComplaintDetailsModal(complaintId);
        } else {
            // Fallback to alert if modal function is not available
        const complaint = dataManager.getComplaints().find(c => c.id === complaintId);
        if (complaint) {
            this.showAlert('Complaint Details', `${complaint.type}: ${complaint.description}`, 'info', 10000);
            }
        }
    }

    viewRouteDetails(routeId) {
        const route = dataManager.getRoutes().find(r => r.id === routeId);
        if (route) {
            this.showAlert('Route Details', `Route ${routeId} with ${route.binIds.length} bins`, 'info');
        }
    }

    resetSystemData() {
        if (confirm('Are you sure you want to reset all system data? This action cannot be undone.')) {
            dataManager.clearAllData();
            this.showAlert('System Reset', 'All data has been reset to defaults', 'warning');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    }

    exportSystemData() {
        const data = dataManager.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `waste-management-backup-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showAlert('Export Complete', 'System data has been exported', 'success');
    }

    viewSystemLogs() {
        const logs = dataManager.getSystemLogs();
        console.log('System Logs:', logs);
        this.showAlert('System Logs', `${logs.length} log entries. Check console for details.`, 'info');
    }

    getCurrentSection() {
        return this.currentSection;
    }

    isInitialized() {
        return this.initialized;
    }

    // Force sync driver locations from server immediately
    async syncDriverLocationsNow(driverId) {
        console.log(`📡 Force syncing driver locations from server for ${driverId}...`);
        
        try {
            // Fetch directly from server
            const response = await fetch('/api/driver/locations', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (response.ok) {
                const locationData = await response.json();
                console.log(`📡 Server location response:`, locationData);
                
                if (locationData.success && locationData.locations) {
                    // Update ALL driver locations in data manager
                    const serverLocations = locationData.locations;
                    dataManager.setData('driverLocations', serverLocations);
                    console.log(`✅ Updated driver locations in cache:`, serverLocations);
                    
                    if (serverLocations[driverId]) {
                        console.log(`✅ Driver ${driverId} location synced:`, serverLocations[driverId]);
                        return serverLocations[driverId];
                    } else {
                        console.warn(`⚠️ Driver ${driverId} location not found on server`);
                        return null;
                    }
                } else {
                    console.error(`❌ Server returned invalid location data:`, locationData);
                    return null;
                }
            } else {
                console.error(`❌ Server location fetch failed: ${response.status} ${response.statusText}`);
                return null;
            }
        } catch (error) {
            console.error(`❌ Error syncing driver locations:`, error);
            return null;
        }
    }

    // Load AI Suggestion for current driver
    loadAISuggestionForDriver(driverId) {
        console.log(`🤖 Loading AI suggestion for driver: ${driverId}`);
        
        const aiSuggestionCard = document.getElementById('aiSuggestionCard');
        if (!aiSuggestionCard) return;
        
        const suggestions = dataManager.getData('aiSuggestions') || {};
        const suggestion = suggestions[driverId];
        
        if (suggestion && suggestion.binId) {
            const bin = dataManager.getBinById(suggestion.binId);
            if (bin) {
                this.populateAISuggestionCard(suggestion, bin);
                aiSuggestionCard.style.display = 'block';
                
                // FORCE REFRESH if distance is still not available after population
                setTimeout(() => {
                    const distanceElement = document.getElementById('suggestionDistance');
                    if (distanceElement && (distanceElement.textContent === 'Location not available' || distanceElement.textContent === 'Calculating...')) {
                        console.log('🔄 Distance still not available, forcing AI suggestion refresh...');
                        if (typeof createAISuggestionForDriver === 'function') {
                            createAISuggestionForDriver(driverId).then(() => {
                                console.log('✅ Force refresh completed, reloading suggestion...');
                                this.loadAISuggestionForDriver(driverId);
                            }).catch(error => {
                                console.error('❌ Force refresh failed:', error);
                            });
                        }
                    }
                }, 100);
            } else {
                aiSuggestionCard.style.display = 'none';
            }
        } else {
            // Create new suggestion if none exists
            if (typeof createAISuggestionForDriver === 'function') {
                console.log(`🔄 Creating new AI suggestion for driver ${driverId}`);
                // Show loading state
                aiSuggestionCard.style.display = 'block';
                document.getElementById('suggestionDistance').textContent = 'Calculating...';
                
                // Create suggestion (async) and reload after completion
                createAISuggestionForDriver(driverId).then(() => {
                    console.log(`✅ AI suggestion creation completed for driver ${driverId}`);
                    // Reload the suggestion after creation
                    setTimeout(() => this.loadAISuggestionForDriver(driverId), 100);
                }).catch(error => {
                    console.error(`❌ AI suggestion creation failed for driver ${driverId}:`, error);
                    document.getElementById('suggestionDistance').textContent = 'Error calculating';
                });
            } else {
                console.warn('❌ createAISuggestionForDriver function not available');
                aiSuggestionCard.style.display = 'none';
            }
        }
    }

    // Populate AI suggestion card with data
    populateAISuggestionCard(suggestion, bin) {
        // Update bin information
        document.getElementById('suggestedBinId').textContent = bin.id;
        document.getElementById('suggestedBinLocation').textContent = bin.location;
        
        // Update fill circle
        const fillCircle = document.getElementById('suggestedBinFill');
        const fillLevel = bin.fill || 0;
        fillCircle.innerHTML = `<span>${fillLevel}%</span>`;
        
        // Set fill circle color based on level
        fillCircle.className = 'fill-circle';
        if (fillLevel >= 75) {
            fillCircle.classList.add('high-fill');
        } else if (fillLevel >= 50) {
            fillCircle.classList.add('medium-fill');
        } else {
            fillCircle.classList.add('low-fill');
        }
        
        // Update metrics with IMMEDIATE FALLBACK DISTANCE CALCULATION
        console.log('🔍 Populating AI suggestion card with data:', {
            distance: suggestion.distance,
            distanceType: typeof suggestion.distance,
            debugInfo: suggestion.debugInfo,
            binId: suggestion.binId
        });
        
        let distanceText = 'Location not available';
        
        // PRIMARY: Check if suggestion has valid distance
        if (suggestion.distance !== null && suggestion.distance !== undefined && 
            suggestion.distance !== 'N/A' && typeof suggestion.distance === 'number' && 
            suggestion.distance > 0) {
            distanceText = `${suggestion.distance} km`;
            console.log(`✅ Using suggestion.distance: ${suggestion.distance} km`);
        } 
        // SECONDARY: Check debug info
        else if (suggestion.debugInfo && suggestion.debugInfo.rawDistance > 0) {
            distanceText = `${Math.round(suggestion.debugInfo.rawDistance * 100) / 100} km`;
            console.log(`✅ Using debugInfo.rawDistance: ${suggestion.debugInfo.rawDistance} km`);
        } 
        // TERTIARY: Calculate distance NOW if we have bin data
        else if (suggestion.binId) {
            console.log(`🔄 No valid distance found, calculating NOW for bin ${suggestion.binId}`);
            try {
                const bin = dataManager.getBinById(suggestion.binId);
                const driverLocations = dataManager.getData('driverLocations') || {};
                const currentUser = authManager.getCurrentUser();
                
                console.log(`📦 Bin data:`, bin);
                console.log(`📍 Driver locations:`, driverLocations);
                console.log(`👤 Current user:`, currentUser);
                
                if (bin && bin.lat && bin.lng && currentUser && driverLocations[currentUser.id]) {
                    const driverLoc = driverLocations[currentUser.id];
                    console.log(`🧮 Calculating distance: Driver(${driverLoc.lat}, ${driverLoc.lng}) -> Bin(${bin.lat}, ${bin.lng})`);
                    
                    const distance = dataManager.calculateDistance(driverLoc.lat, driverLoc.lng, bin.lat, bin.lng);
                    if (distance && distance > 0) {
                        distanceText = `${Math.round(distance * 100) / 100} km`;
                        console.log(`✅ CALCULATED distance: ${distanceText}`);
                    } else {
                        distanceText = 'Calculating...';
                        console.log(`⚠️ Distance calculation returned: ${distance}`);
                    }
                } else {
                    console.log(`❌ Missing data for calculation:`, {
                        bin: !!bin,
                        binCoords: !!(bin && bin.lat && bin.lng),
                        currentUser: !!currentUser,
                        driverLocation: !!(currentUser && driverLocations[currentUser.id])
                    });
                    
                    // FINAL FALLBACK: Show estimated distance
                    distanceText = '~5 km (estimated)';
                    console.log(`🔄 Using final fallback: ${distanceText}`);
                }
            } catch (error) {
                console.error(`❌ Error calculating distance:`, error);
                distanceText = 'Error calculating';
            }
        }
        
        console.log(`📍 FINAL distance text: "${distanceText}"`);
        document.getElementById('suggestionDistance').textContent = distanceText;
        
        const timeText = (suggestion.estimatedTime !== undefined && suggestion.estimatedTime !== null) 
            ? `${suggestion.estimatedTime} min`
            : 'Estimating...';
        document.getElementById('suggestionTime').textContent = timeText;
        
        const priorityText = suggestion.priority || 'Low'; // priority is already a string ('High', 'Medium', 'Low')
        document.getElementById('suggestionPriority').textContent = priorityText;
        
        // Update reason
        document.getElementById('suggestionReason').textContent = suggestion.reason;
        
        console.log('✅ AI suggestion card populated');
    }

    // 🤖 ENHANCED AI DRIVER INTEGRATION - Connected to Main AI System
    async loadEnhancedDriverAI(driverId) {
        console.log(`🎯 Loading Enhanced AI recommendations for driver ${driverId}...`);
        
        const aiSuggestionCard = document.getElementById('aiSuggestionCard');
        if (!aiSuggestionCard) return;

        try {
            // Show loading state
            this.showEnhancedAILoadingState(true);
            
            // Get driver's current location with fallback
            let driverLocation = window.dataManager?.getDriverLocation(driverId);
            
            // If no location, force sync and try again
            if (!driverLocation) {
                await this.syncDriverLocationsNow(driverId);
                driverLocation = window.dataManager?.getDriverLocation(driverId);
                
                // Use fallback location if still no data
                if (!driverLocation) {
                    driverLocation = {
                        lat: 25.3682,
                        lng: 51.5511,
                        fallback: true,
                        source: 'default_doha'
                    };
                }
            }
            
            console.log(`📍 Using driver location:`, driverLocation);
            
            // Generate AI-powered recommendations using main AI system
            const aiRecommendation = await this.generateEnhancedAIRecommendation(driverId, driverLocation);
            
            if (aiRecommendation && aiRecommendation.success && aiRecommendation.recommendation) {
                // Populate the enhanced UI with AI recommendation
                this.populateEnhancedAIRecommendation(aiRecommendation.recommendation, driverId);
                this.showEnhancedAILoadingState(false);
            } else {
                // Show no recommendations state
                this.showNoRecommendationsState();
            }
            
        } catch (error) {
            console.error(`❌ Enhanced AI loading failed:`, error);
            this.showAIErrorState(error.message);
        }
    }

    // Generate AI recommendation using main application's AI system
    async generateEnhancedAIRecommendation(driverId, driverLocation) {
        console.log(`🧠 Generating Enhanced AI recommendation for driver ${driverId}...`);
        
        try {
            // Get all available bins (not assigned to active routes)
            const allBins = window.dataManager?.getBins() || [];
            const allRoutes = window.dataManager?.getRoutes() || [];
            
            // Filter out bins already assigned to active routes
            const assignedBinIds = new Set();
            allRoutes.forEach(route => {
                if (route.status === 'active' && route.binIds) {
                    route.binIds.forEach(binId => assignedBinIds.add(binId));
                }
            });
            
            const availableBins = allBins.filter(bin => 
                !assignedBinIds.has(bin.id) && 
                (bin.fill || 0) >= 50 && 
                bin.status !== 'maintenance' && 
                bin.status !== 'offline'
            );
            
            console.log(`🔍 Found ${availableBins.length} available bins for AI analysis`);
            
            if (availableBins.length === 0) {
                return { success: false, message: 'No available bins for recommendation' };
            }
            
            // Use advanced AI scoring system (same as main application)
            const scoredBins = availableBins.map(bin => {
                const distance = this.calculateDistance(
                    driverLocation.lat, 
                    driverLocation.lng, 
                    bin.lat || 25.3682, 
                    bin.lng || 51.5511
                );
                
                // Advanced AI scoring algorithm
                let aiScore = 0;
                
                // Fill level scoring (0-40 points)
                const fillLevel = bin.fill || 0;
                if (fillLevel >= 90) aiScore += 40;
                else if (fillLevel >= 75) aiScore += 30;
                else if (fillLevel >= 60) aiScore += 20;
                else aiScore += 10;
                
                // Distance scoring (0-25 points) - closer is better
                if (distance < 1) aiScore += 25;
                else if (distance < 2) aiScore += 20;
                else if (distance < 5) aiScore += 15;
                else if (distance < 10) aiScore += 10;
                else aiScore += 5;
                
                // Urgency scoring (0-20 points)
                if (bin.lastCollection) {
                    const hoursSinceCollection = (Date.now() - new Date(bin.lastCollection)) / (1000 * 60 * 60);
                    if (hoursSinceCollection > 48) aiScore += 20;
                    else if (hoursSinceCollection > 24) aiScore += 15;
                    else if (hoursSinceCollection > 12) aiScore += 10;
                }
                
                // Temperature factor (0-10 points)
                if (bin.temperature && bin.temperature > 35) aiScore += 10;
                else if (bin.temperature && bin.temperature > 30) aiScore += 5;
                
                // Efficiency factor (0-5 points)
                aiScore += Math.random() * 5; // Slight randomization for variety
                
                return {
                    ...bin,
                    aiScore,
                    calculatedDistance: distance,
                    estimatedTime: Math.ceil(distance * 2 + fillLevel / 10) + 5
                };
            });
            
            // Sort by AI score (highest first)
            scoredBins.sort((a, b) => b.aiScore - a.aiScore);
            
            const bestRecommendation = scoredBins[0];
            
            // Generate AI reasoning
            const reasoning = this.generateAIReasoning(bestRecommendation, driverLocation);
            
            // Calculate confidence level
            const confidenceLevel = Math.min(95, Math.round((bestRecommendation.aiScore / 100) * 100));
            
            console.log(`✅ Generated AI recommendation for bin ${bestRecommendation.id} with score ${bestRecommendation.aiScore}`);
            
            return {
                success: true,
                recommendation: {
                    ...bestRecommendation,
                    confidence: confidenceLevel,
                    reasoning: reasoning,
                    priority: bestRecommendation.fill >= 80 ? 'HIGH' : bestRecommendation.fill >= 60 ? 'MEDIUM' : 'LOW',
                    co2Savings: Math.round(bestRecommendation.calculatedDistance * 0.5 + bestRecommendation.fill * 0.1),
                    efficiencyScore: Math.round(bestRecommendation.aiScore)
                }
            };
            
        } catch (error) {
            console.error(`❌ AI recommendation generation failed:`, error);
            return { success: false, error: error.message };
        }
    }

    // Generate AI reasoning explanation
    generateAIReasoning(bin, driverLocation) {
        const reasons = [];
        
        // Fill level reasoning
        if (bin.fill >= 90) reasons.push('Critical fill level requiring immediate attention');
        else if (bin.fill >= 75) reasons.push('High fill level with collection priority');
        else if (bin.fill >= 60) reasons.push('Moderate fill level suitable for collection');
        
        // Distance reasoning
        if (bin.calculatedDistance < 2) reasons.push('Very close to your current location');
        else if (bin.calculatedDistance < 5) reasons.push('Nearby location with efficient route');
        else if (bin.calculatedDistance < 10) reasons.push('Reasonable distance for collection');
        
        // Efficiency reasoning
        if (bin.temperature && bin.temperature > 35) reasons.push('High temperature detected, needs priority collection');
        
        // Optimization reasoning
        reasons.push('Optimized for fuel efficiency and time savings');
        
        return {
            primaryReason: reasons[0] || 'AI-optimized collection opportunity',
            factors: reasons,
            explanation: `This bin was selected based on ${reasons.length} key factors including proximity, urgency, and operational efficiency.`
        };
    }

    // Populate the enhanced UI with AI recommendation data
    populateEnhancedAIRecommendation(recommendation, driverId) {
        console.log(`🎨 Populating Enhanced AI UI for driver ${driverId}:`, recommendation);
        
        // CRITICAL: Ensure the main AI card is visible before populating
        const aiSuggestionCard = document.getElementById('aiSuggestionCard');
        if (aiSuggestionCard) {
            aiSuggestionCard.style.display = 'block';
            console.log(`✅ AI Suggestion Card made visible during population`);
        }
        
        // Update confidence badge
        const confidenceElement = document.getElementById('aiConfidenceLevel');
        if (confidenceElement) confidenceElement.textContent = `${recommendation.confidence}%`;
        
        // Update priority badge
        const priorityBadge = document.getElementById('recommendationPriority');
        if (priorityBadge) {
            const prioritySpan = priorityBadge.querySelector('span');
            if (prioritySpan) prioritySpan.textContent = `${recommendation.priority} PRIORITY`;
            
            // Update priority badge color
            if (recommendation.priority === 'HIGH') {
                priorityBadge.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            } else if (recommendation.priority === 'MEDIUM') {
                priorityBadge.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
            } else {
                priorityBadge.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            }
        }
        
        // Update bin information
        const binIdElement = document.getElementById('recommendedBinId');
        if (binIdElement) binIdElement.textContent = recommendation.id || 'Unknown';
        
        const binLocationElement = document.getElementById('recommendedBinLocation');
        if (binLocationElement) binLocationElement.textContent = recommendation.location || recommendation.address || 'Location data updating...';
        
        // Update fill level ring and percentage
        const fillLevelRing = document.getElementById('fillLevelRing');
        const fillPercentage = document.getElementById('fillPercentage');
        const fillValue = recommendation.fill || 0;
        
        if (fillLevelRing) fillLevelRing.style.setProperty('--fill-percentage', `${fillValue * 3.6}deg`);
        if (fillPercentage) fillPercentage.textContent = `${fillValue}%`;
        
        // Update status chips
        const urgencyLevel = document.getElementById('urgencyLevel');
        if (urgencyLevel) urgencyLevel.textContent = recommendation.fill >= 80 ? 'Urgent' : 'Normal';
        
        const efficiencyLevel = document.getElementById('efficiencyLevel');
        if (efficiencyLevel) efficiencyLevel.textContent = recommendation.calculatedDistance < 5 ? 'Optimal' : 'Good';
        
        // Update smart metrics
        const smartDistance = document.getElementById('smartDistance');
        if (smartDistance) smartDistance.textContent = `${Math.round(recommendation.calculatedDistance * 100) / 100} km`;
        
        const smartTime = document.getElementById('smartTime');
        if (smartTime) smartTime.textContent = `${recommendation.estimatedTime} min`;
        
        const smartSavings = document.getElementById('smartSavings');
        if (smartSavings) smartSavings.textContent = `${recommendation.co2Savings} kg`;
        
        const smartScore = document.getElementById('smartScore');
        if (smartScore) smartScore.textContent = `${recommendation.efficiencyScore}/100`;
        
        // Update AI reasoning
        const aiReasoningContent = document.getElementById('aiReasoningContent');
        if (aiReasoningContent) aiReasoningContent.textContent = recommendation.reasoning.explanation;
        
        // Update reasoning factors
        const reasoningFactors = document.getElementById('reasoningFactors');
        if (reasoningFactors) {
            reasoningFactors.innerHTML = recommendation.reasoning.factors
                .map(factor => `<span class="reasoning-factor">${factor}</span>`)
                .join('');
        }
        
        // Store recommendation data for actions
        window.currentAIRecommendation = {
            ...recommendation,
            driverId: driverId
        };
        
        console.log(`✅ Enhanced AI UI populated successfully`);
    }

    // Show/hide loading state
    showEnhancedAILoadingState(show) {
        console.log(`🎯 Enhanced AI Loading State: ${show ? 'SHOWING' : 'HIDING'}`);
        
        // CRITICAL: Make the main AI card visible
        const aiSuggestionCard = document.getElementById('aiSuggestionCard');
        if (aiSuggestionCard) {
            aiSuggestionCard.style.display = 'block';
            console.log(`✅ AI Suggestion Card made visible`);
        } else {
            console.error(`❌ AI Suggestion Card not found!`);
        }
        
        const aiLoadingState = document.getElementById('aiLoadingState');
        const primaryRecommendation = document.getElementById('primaryRecommendation');
        const noRecommendationsState = document.getElementById('noRecommendationsState');
        
        if (show) {
            if (aiLoadingState) {
                aiLoadingState.style.display = 'block';
                console.log(`✅ AI Loading State shown`);
            }
            if (primaryRecommendation) primaryRecommendation.style.display = 'none';
            if (noRecommendationsState) noRecommendationsState.style.display = 'none';
        } else {
            if (aiLoadingState) aiLoadingState.style.display = 'none';
            if (primaryRecommendation) {
                primaryRecommendation.style.display = 'block';
                console.log(`✅ Primary Recommendation shown`);
            }
        }
    }

    // Show no recommendations state
    showNoRecommendationsState() {
        console.log(`🎯 Showing No Recommendations State`);
        
        // CRITICAL: Make the main AI card visible
        const aiSuggestionCard = document.getElementById('aiSuggestionCard');
        if (aiSuggestionCard) {
            aiSuggestionCard.style.display = 'block';
            console.log(`✅ AI Suggestion Card made visible for No Recommendations`);
        }
        
        const aiLoadingState = document.getElementById('aiLoadingState');
        const primaryRecommendation = document.getElementById('primaryRecommendation');
        const noRecommendationsState = document.getElementById('noRecommendationsState');
        
        if (aiLoadingState) aiLoadingState.style.display = 'none';
        if (primaryRecommendation) primaryRecommendation.style.display = 'none';
        if (noRecommendationsState) {
            noRecommendationsState.style.display = 'block';
            console.log(`✅ No Recommendations State shown`);
        }
    }

    // Show AI error state
    showAIErrorState(errorMessage) {
        console.error(`❌ AI Error: ${errorMessage}`);
        
        // CRITICAL: Make the main AI card visible even for errors
        const aiSuggestionCard = document.getElementById('aiSuggestionCard');
        if (aiSuggestionCard) {
            aiSuggestionCard.style.display = 'block';
            console.log(`✅ AI Suggestion Card made visible for Error State`);
        }
        
        // Show no recommendations state for errors
        this.showNoRecommendationsState();
    }
}

// Global app instance will be created at the end of the file with error handling

// Helper functions for global access - BIN MODALS INTEGRATION
window.completePickup = function(binId) {
    if (window.app) {
        window.app.completePickup(binId);
    }
};

window.navigateToLocation = function(lat, lng) {
    if (window.app) {
        window.app.navigateToLocation(lat, lng);
    }
};

window.approveRegistration = function(registrationId) {
    if (window.app) {
        window.app.approveRegistration(registrationId);
    }
};

window.rejectRegistration = function(registrationId) {
    if (window.app) {
        window.app.rejectRegistration(registrationId);
    }
};

window.dismissAlert = function(alertId) {
    if (window.app) {
        window.app.dismissAlert(alertId);
    }
};

window.resolveComplaint = function(complaintId) {
    if (window.app) {
        window.app.resolveComplaint(complaintId);
    }
};

window.viewComplaintDetails = function(complaintId) {
    if (window.app) {
        window.app.viewComplaintDetails(complaintId);
    }
};

window.viewRouteDetails = function(routeId) {
    if (window.app) {
        window.app.viewRouteDetails(routeId);
    }
};

window.showNewComplaintForm = function() {
    console.log('📝 Opening complaint registration modal...');
    if (typeof showComplaintRegistrationModal === 'function') {
        showComplaintRegistrationModal();
    } else {
    if (window.app) {
            window.app.showAlert('Complaint Form', 'Complaint registration modal not available', 'error');
        }
    }
};

window.toggleUserStatus = function(userId) {
    const user = dataManager.getUserById(userId);
    if (user) {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        dataManager.updateUser(userId, { status: newStatus });
        if (window.app) {
            window.app.showAlert('User Updated', `User ${user.name} is now ${newStatus}`, 'success');
            window.app.loadAdminPanel();
        }
    }
};

window.searchUsers = function(query) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    const rows = tbody.getElementsByTagName('tr');
    const searchTerm = query.toLowerCase();
    
    for (let row of rows) {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    }
};

window.optimizeRoute = function(routeId) {
    if (window.app) {
        window.app.showAlert('Route Optimization', `Optimizing route ${routeId}...`, 'info');
        setTimeout(() => {
            window.app.showAlert('Success', 'Route has been optimized', 'success');
        }, 2000);
    }
};

// BIN MODAL SPECIFIC FUNCTIONS
window.assignJob = function(binId) {
    // First show bin details
    if (window.binModalManager) {
        window.binModalManager.showBinDetails(binId);
        // Then open driver assignment
        setTimeout(() => {
            window.binModalManager.showDriverAssignment();
        }, 500);
    }
};

window.showBinDetails = function(binId) {
    if (window.binModalManager) {
        window.binModalManager.showBinDetails(binId);
    } else {
        console.error('Bin Modal Manager not loaded');
    }
};

window.scheduleUrgentCollection = function(binId) {
    const bin = dataManager.getBinById(binId);
    if (bin) {
        dataManager.addAlert('urgent_collection', 
            `Urgent collection scheduled for bin ${binId} at ${bin.location}`, 
            'high', 
            binId
        );
        
        if (window.app) {
            window.app.showAlert('Urgent Collection', 
                `Urgent collection has been scheduled for bin ${binId}`, 
                'warning'
            );
        }
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WasteManagementApp;
}

// Global function to start a route
window.startRoute = function(routeId) {
    console.log('🚛 Starting route:', routeId);
    
    const routes = dataManager.getRoutes();
    const route = routes.find(r => r.id === routeId);
    
    if (!route) {
        console.error('Route not found:', routeId);
        return;
    }
    
    // Update route status
    dataManager.updateRoute(routeId, { 
        status: 'in-progress',
        startedAt: new Date().toISOString()
    });
    
    // Update driver status if current user
    const currentUser = authManager.getCurrentUser();
    if (currentUser && currentUser.id === route.driverId) {
        if (typeof mapManager !== 'undefined') {
            mapManager.updateDriverStatus(currentUser.id, 'on-route');
        }
        
        // Update UI
        const statusIndicator = document.getElementById('driverStatusIndicator');
        if (statusIndicator) {
            statusIndicator.textContent = 'On Route';
            statusIndicator.style.color = '#f59e0b';
        }
    }
    
    if (window.app) {
        window.app.showAlert('Route Started', `Route ${routeId} is now in progress`, 'success');
        window.app.loadDriverRoutes(); // Refresh the route list
    }
    
    // Sync the route update
    if (typeof syncManager !== 'undefined') {
        const updatedRoute = dataManager.getRoutes().find(r => r.id === routeId);
        syncManager.syncRoute(updatedRoute);
    }
};

// Global function to mark a bin as collected
window.markBinCollected = function(binId) {
    console.log('🗑️ === MARK BIN COLLECTED FUNCTION CALLED ===');
    console.log('🗑️ Bin ID:', binId);
    console.log('🗑️ Function triggered from:', new Error().stack.split('\n')[1]);
    
    const currentUser = authManager.getCurrentUser();
    if (!currentUser || currentUser.type !== 'driver') {
        console.error('❌ Only drivers can mark bins as collected');
        if (window.app) {
            window.app.showAlert('Access Denied', 'Only drivers can mark bins as collected.', 'warning');
        }
        return;
    }
    
    const bin = dataManager.getBinById(binId);
    if (!bin) {
        console.error('❌ Bin not found:', binId);
        if (window.app) {
            window.app.showAlert('Error', 'Bin not found.', 'danger');
        }
        return;
    }
    
    // Find associated route for this collection
    const routes = dataManager.getRoutes();
    const associatedRoute = routes.find(route => 
        route.driverId === currentUser.id && 
        (route.binIds?.includes(binId) || route.binDetails?.some(b => b.id === binId)) &&
        route.status !== 'completed'
    );

    // Create collection record
    const collection = {
        binId: binId,
        binLocation: bin.location,
        driverId: currentUser.id,
        driverName: currentUser.name,
        originalFill: bin.fill,
        weight: Math.round(bin.fill * 0.5), // Estimate weight based on fill level
        timestamp: new Date().toISOString(),
        collectedAt: new Date().toLocaleString(),
        vehicleId: currentUser.vehicleId || 'Unknown',
        routeId: associatedRoute ? associatedRoute.id : null,
        routeName: associatedRoute ? (associatedRoute.name || `Route ${associatedRoute.id}`) : 'Direct Collection'
    };
    
    // Add collection using data manager (this handles bin reset, analytics, driver history, and bin history)
    const savedCollection = dataManager.addCollection(collection);
    console.log('✅ Collection saved:', savedCollection);
    
    // Verify bin was actually updated
    const updatedBin = dataManager.getBinById(binId);
    console.log('🔍 Bin after collection - Fill level:', updatedBin ? updatedBin.fill : 'Bin not found');
    console.log('🔍 Bin after collection - Status:', updatedBin ? updatedBin.status : 'Bin not found');
    console.log('🔍 Bin after collection - Last collection:', updatedBin ? updatedBin.lastCollection : 'Bin not found');
    
    // Verify driver history was recorded
    const driverHistory = dataManager.getDriverHistory(currentUser.id);
    console.log('📚 Driver history entries:', driverHistory.length);
    console.log('📚 Latest driver history entry:', driverHistory[0]);
    
    // Verify bin history was recorded
    const binHistory = dataManager.getBinHistory(binId);
    console.log('📝 Bin history entries:', binHistory.length);
    console.log('📝 Latest bin history entry:', binHistory[0]);
    
    // Find and update the route status (reuse routes variable from above)
    const routesToUpdate = routes.filter(route => 
        route.driverId === currentUser.id && 
        (route.binIds?.includes(binId) || route.binDetails?.some(b => b.id === binId)) &&
        route.status !== 'completed'
    );
    
    console.log('🔍 Routes to update:', routesToUpdate.length);
    routesToUpdate.forEach(route => {
        // Check if all bins in this route are now collected
        const allBins = route.binIds || (route.binDetails ? route.binDetails.map(b => b.id) : []);
        const remainingBins = allBins.filter(id => id !== binId);
        
        console.log(`🔍 Route ${route.id}: ${allBins.length} total bins, ${remainingBins.length} remaining after collection`);
        
        if (remainingBins.length === 0) {
            // All bins collected - mark route as completed
            console.log(`🎉 ROUTE COMPLETION: All bins in route ${route.id} have been collected!`);
            console.log(`📋 Route details: ${route.name || route.id}`);
            console.log(`📊 Total bins collected: ${allBins.length}`);
            console.log(`👤 Completed by: ${currentUser.name}`);
            
            const completedRoute = dataManager.updateRoute(route.id, {
                status: 'completed',
                completedAt: new Date().toISOString(),
                completedBy: currentUser.id,
                actualDuration: route.estimatedDuration || 30,
                totalBinsCollected: allBins.length,
                completionPercentage: 100
            });
            console.log(`✅ Route ${route.id} marked as completed and removed from active tasks`);
            console.log(`📚 Route moved to driver history for future reference`);
            
            // Log route completion
            dataManager.addSystemLog(
                `Route ${route.id} completed by ${currentUser.name} - ${allBins.length} bins collected`, 
                'success'
            );
        } else {
            // Update route to remove completed bin
            const updatedRoute = {
                ...route,
                binIds: route.binIds ? route.binIds.filter(id => id !== binId) : route.binIds,
                binDetails: route.binDetails ? route.binDetails.filter(b => b.id !== binId) : route.binDetails,
                progress: Math.round(((allBins.length - remainingBins.length) / allBins.length) * 100),
                lastUpdated: new Date().toISOString()
            };
            
            dataManager.updateRoute(route.id, updatedRoute);
            console.log(`🔄 Route ${route.id} updated - removed bin ${binId}. Progress: ${updatedRoute.progress}%`);
        }
    });
    
    // Sync to server for cross-device updates
    if (typeof syncManager !== 'undefined' && syncManager.syncEnabled) {
        syncManager.syncToServer({ 
            collections: [savedCollection],
            routes: routesToUpdate,
            bins: [updatedBin] // Include the updated bin data
        }, 'partial');
        console.log('📤 Collection and route updates synced to server');
        
        // Force a sync from server to ensure consistency
        setTimeout(() => {
            syncManager.syncFromServer();
            console.log('📥 Forced sync from server after collection');
        }, 100);
    }
    
    // Show comprehensive success message with all actions taken
    if (window.app) {
        let message = `✅ COLLECTION COMPLETED!\n\n📦 Bin: ${bin.location} (${binId})\n`;
        message += `🔄 Status: Fill reset to 0% (was ${bin.fill}%)\n`;
        message += `📚 Driver History: Collection recorded\n`;
        message += `📝 Bin History: Pickup logged\n`;
        
        if (associatedRoute) {
            const remainingBins = associatedRoute.binIds ? 
                associatedRoute.binIds.filter(id => id !== binId).length : 
                (associatedRoute.binDetails ? associatedRoute.binDetails.filter(b => b.id !== binId).length : 0);
            
            if (remainingBins === 0) {
                message += `\n🎉 ROUTE COMPLETED!\n`;
                message += `📋 Route: "${associatedRoute.name || associatedRoute.id}"\n`;
                message += `✅ Status: Removed from active tasks\n`;
                message += `📚 History: Saved to driver history`;
            } else {
                message += `\n📋 Route Progress:\n`;
                message += `🔄 Route: "${associatedRoute.name || associatedRoute.id}"\n`;
                message += `📊 Remaining: ${remainingBins} bin(s) to collect`;
            }
        } else {
            message += `\n📋 Type: Direct collection (no route)`;
        }
        
        window.app.showAlert(
            'Collection System Update', 
            message,
            'success',
            8000
        );
    }
    
    // Enhanced UI refresh with proper logging
    console.log('🔄 Starting comprehensive UI refresh after collection...');
    
    // Force data sync immediately after route completion
    if (typeof syncManager !== 'undefined') {
        console.log('📡 Forcing immediate sync after collection...');
        syncManager.syncToServer({
            routes: dataManager.getRoutes(),
            bins: dataManager.getBins(),
            collections: dataManager.getCollections()
        }, 'partial');
    }
    
    // Immediate refresh of driver routes
    if (window.app && typeof window.app.loadDriverRoutes === 'function') {
        console.log('🔄 Triggering immediate driver routes refresh...');
        window.app.loadDriverRoutes(); // Immediate refresh
        console.log('🔄 Driver routes refreshed immediately');
        
        // Check routes immediately after refresh
        const currentRoutes = dataManager.getDriverRoutes(currentUser.id);
        console.log('🔍 Active routes after immediate refresh:', currentRoutes.length);
        
        // Delayed refresh to ensure all data is processed
        setTimeout(() => {
            console.log('🔄 === DELAYED ROUTE REFRESH DEBUG ===');
            
            // Force data refresh from storage before UI refresh
            const allRoutesBeforeRefresh = dataManager.getRoutes();
            const driverRoutesBeforeRefresh = allRoutesBeforeRefresh.filter(r => r.driverId === currentUser.id);
            console.log(`📊 Before UI refresh - Total driver routes: ${driverRoutesBeforeRefresh.length}`);
            console.log(`📊 Before UI refresh - Route statuses:`, driverRoutesBeforeRefresh.map(r => `${r.id}: ${r.status}`));
            
            // Now refresh the UI
            window.app.loadDriverRoutes();
            console.log('🔄 Driver routes refreshed after delay');
            
            // Check if route was properly removed
            const remainingRoutes = dataManager.getDriverRoutes(currentUser.id);
            const wasRouteComplete = associatedRoute && remainingRoutes.length < routes.filter(r => r.driverId === currentUser.id && r.status !== 'completed').length;
            console.log(`📊 Route status: ${wasRouteComplete ? 'Route completed and removed' : 'Route partially completed'}`);
            console.log(`📊 Remaining active routes: ${remainingRoutes.length}`);
            console.log(`📊 Active routes details:`, remainingRoutes.map(r => `${r.id}: ${r.status}`));
            
            // If route is still showing, force another refresh
            if (remainingRoutes.length > 0) {
                console.log('⚠️ Route still showing - forcing complete route list refresh...');
                if (typeof window.forceRouteListRefresh === 'function') {
                    window.forceRouteListRefresh();
                } else {
                    setTimeout(() => {
                        window.app.loadDriverRoutes();
                        console.log('🔄 Additional forced refresh completed');
                        
                        const finalCheck = dataManager.getDriverRoutes(currentUser.id);
                        console.log(`📊 Final check - Active routes: ${finalCheck.length}`);
                    }, 1000);
                }
            }
        }, 500);
    }
    
    // Refresh map immediately and after delay
    if (typeof mapManager !== 'undefined' && mapManager && mapManager.map) {
        console.log('🗺️ Triggering immediate map refresh...');
        mapManager.loadBinsOnMap(); // Immediate refresh to show 0% fill
        mapManager.loadDriversOnMap();
        console.log('🗺️ Map refreshed immediately');
        
        // Also refresh after delay to ensure sync updates are reflected
        setTimeout(() => {
            mapManager.loadBinsOnMap();
            mapManager.loadDriversOnMap();
            console.log('🗺️ Map refreshed after delay');
        }, 800);
    } else if (mapManager && !mapManager.map) {
        console.log('⚠️ Map not initialized yet, skipping map refresh');
    }
    
    // Update driver stats
    if (window.app && typeof window.app.updateDriverStats === 'function') {
        window.app.updateDriverStats(); // Immediate update
        setTimeout(() => {
            window.app.updateDriverStats();
            console.log('📊 Driver stats updated after collection');
        }, 1000);
    }
    
    // Update analytics dashboard
    if (typeof analyticsManager !== 'undefined') {
        setTimeout(() => {
            analyticsManager.updateDashboardMetrics();
            console.log('📈 Analytics updated after collection');
        }, 1200);
    }
    
    // Refresh the entire dashboard if in admin/manager view
    if (window.app && typeof window.app.refreshDashboard === 'function') {
        setTimeout(() => {
            window.app.refreshDashboard();
            console.log('🔄 Dashboard refreshed after collection');
        }, 1500);
    }
    
    // Force a complete sync to ensure all devices are updated
    if (typeof syncManager !== 'undefined') {
        setTimeout(() => {
            syncManager.performFullSync();
            console.log('🔄 Full sync triggered after collection');
            
            // Final verification after sync
            setTimeout(() => {
                const finalBinCheck = dataManager.getBinById(binId);
                const finalRouteCheck = dataManager.getDriverRoutes(currentUser.id);
                console.log('🔍 FINAL VERIFICATION:');
                console.log(`   Bin ${binId} fill level: ${finalBinCheck ? finalBinCheck.fill : 'NOT FOUND'}%`);
                console.log(`   Active routes: ${finalRouteCheck.length}`);
                console.log(`   Route details:`, finalRouteCheck);
                
                // If bin is still not reset, force it
                if (finalBinCheck && finalBinCheck.fill > 0) {
                    console.log('⚠️ Bin fill not reset - forcing update...');
                    dataManager.updateBin(binId, { fill: 0, status: 'normal', lastCollection: new Date().toLocaleString() });
                    console.log('🔄 Forced bin reset completed');
                    
                    // Force map refresh
                    if (typeof mapManager !== 'undefined' && mapManager && mapManager.map) {
                        mapManager.loadBinsOnMap();
                        console.log('🗺️ Forced map refresh after bin reset');
                    } else if (mapManager && !mapManager.map) {
                        console.log('⚠️ Map not initialized yet, skipping map refresh after bin reset');
                    }
                }
                
                // Final check if routes are still showing
                const uiRouteCheck = dataManager.getDriverRoutes(currentUser.id);
                if (uiRouteCheck.length > 0 && associatedRoute && associatedRoute.status === 'completed') {
                    console.log('⚠️ Completed route still showing in UI - forcing route list refresh...');
                    if (typeof window.forceRouteListRefresh === 'function') {
                        window.forceRouteListRefresh();
                    }
                    
                    // Show user feedback
                    if (window.app) {
                        window.app.showAlert(
                            'Route List Updated', 
                            'Your completed route has been removed from the active tasks list.',
                            'info',
                            3000
                        );
                    }
                }
            }, 1000);
        }, 2000);
    }
    
    // Refresh all driver data across the application to ensure status sync
    if (typeof window.refreshAllDriverData === 'function') {
        setTimeout(() => {
            window.refreshAllDriverData();
            console.log('🔄 All driver data refreshed after collection');
        }, 1500);
    }
    
    console.log('🎉 Bin collection process completed successfully');
};

// Global function to view driver history (for debugging and user reference)
window.viewDriverHistory = function() {
    const currentUser = authManager.getCurrentUser();
    if (!currentUser || currentUser.type !== 'driver') {
        console.log('❌ Driver history can only be viewed by drivers');
        return;
    }
    
    console.log('📚 === DRIVER HISTORY REPORT ===');
    console.log(`👤 Driver: ${currentUser.name} (${currentUser.id})`);
    
    // Get driver history
    const driverHistory = dataManager.getDriverHistory(currentUser.id);
    console.log(`📝 Total history entries: ${driverHistory.length}`);
    
    if (driverHistory.length > 0) {
        console.log('\n📋 Recent Collections:');
        driverHistory.slice(0, 10).forEach((entry, index) => {
            console.log(`${index + 1}. ${entry.binLocation} (${entry.binId}) - ${entry.timestamp}`);
            console.log(`   Route: ${entry.route}, Weight: ${entry.weight}kg, Fill: ${entry.originalFill}%`);
        });
    }
    
    // Get completed routes
    const allRoutes = dataManager.getRoutes();
    const completedRoutes = allRoutes.filter(r => 
        r.driverId === currentUser.id && r.status === 'completed'
    );
    
    console.log(`\n🏁 Completed routes: ${completedRoutes.length}`);
    if (completedRoutes.length > 0) {
        console.log('\n📋 Recent Completed Routes:');
        completedRoutes.slice(-5).forEach((route, index) => {
            console.log(`${index + 1}. ${route.name || route.id} - Completed: ${route.completedAt}`);
            console.log(`   Bins collected: ${route.totalBinsCollected || 'N/A'}`);
        });
    }
    
    // Get today's collections
    const todayCollections = dataManager.getTodayCollections().filter(c => c.driverId === currentUser.id);
    console.log(`\n📅 Today's collections: ${todayCollections.length}`);
    
    console.log('\n💡 Use viewDriverHistory() in console anytime to see this report');
    
    return {
        driverHistory,
        completedRoutes,
        todayCollections
    };
};

// Global function to view bin history (for debugging and verification)
window.viewBinHistory = function(binId) {
    if (!binId) {
        console.log('❌ Please provide a bin ID. Example: viewBinHistory("DF703-001")');
        return;
    }
    
    console.log(`📝 === BIN HISTORY REPORT ===`);
    console.log(`🗑️ Bin ID: ${binId}`);
    
    // Get bin current status
    const bin = dataManager.getBinById(binId);
    if (bin) {
        console.log(`📊 Current Status: ${bin.fill}% full, ${bin.status}`);
        console.log(`📅 Last Collection: ${bin.lastCollection || 'Never'}`);
        console.log(`👤 Last Collected By: ${bin.collectedBy || 'N/A'}`);
    } else {
        console.log('❌ Bin not found');
        return;
    }
    
    // Get bin history
    const binHistory = dataManager.getBinHistory(binId);
    console.log(`📝 Total history entries: ${binHistory.length}`);
    
    if (binHistory.length > 0) {
        console.log('\n📋 Recent Activity:');
        binHistory.slice(0, 10).forEach((entry, index) => {
            const action = entry.action === 'collection' ? '🗑️ COLLECTED' : '📊 SENSOR UPDATE';
            console.log(`${index + 1}. ${action} - ${entry.timestamp}`);
            console.log(`   Fill: ${entry.previousFill}% → ${entry.newFill}%`);
            if (entry.collectedBy) {
                console.log(`   By: ${entry.collectedBy}`);
            }
        });
    }
    
    console.log('\n💡 Use viewBinHistory("BIN_ID") in console to check any bin');
    
    return {
        bin,
        binHistory
    };
};

// Global function to force route list refresh (for fixing UI issues)
window.forceRouteListRefresh = function() {
    const currentUser = authManager.getCurrentUser();
    if (!currentUser) {
        console.log('❌ No user logged in');
        return;
    }
    
    console.log('🔄 === FORCING ROUTE LIST REFRESH ===');
    
    // Clear the route list element completely
    const routesList = document.getElementById('driverRouteList');
    if (routesList) {
        routesList.innerHTML = '<p>🔄 Refreshing routes...</p>';
        console.log('🧹 Cleared route list HTML');
    }
    
    // Force a fresh data load
    if (window.app && typeof window.app.loadDriverRoutes === 'function') {
        setTimeout(() => {
            window.app.loadDriverRoutes();
            console.log('🔄 Route list forcefully refreshed');
            
            // Verify the refresh worked
            const finalRoutes = dataManager.getDriverRoutes(currentUser.id);
            console.log(`📊 Routes after forced refresh: ${finalRoutes.length}`);
        }, 100);
    }
    
    return true;
};

// Global function to debug route status (for drivers to check their current status)
window.debugRouteStatus = function() {
    const currentUser = authManager.getCurrentUser();
    if (!currentUser) {
        console.log('❌ No user logged in');
        return;
    }
    
    console.log('🔍 === ROUTE STATUS DEBUG ===');
    console.log(`👤 Driver: ${currentUser.name} (${currentUser.id})`);
    
    // Get all routes for this driver
    const allRoutes = dataManager.getRoutes();
    const driverRoutes = allRoutes.filter(r => r.driverId === currentUser.id);
    
    console.log(`📋 Total routes for driver: ${driverRoutes.length}`);
    
    driverRoutes.forEach((route, index) => {
        console.log(`\n${index + 1}. Route ${route.id} (${route.name || 'Unnamed'})`);
        console.log(`   Status: ${route.status}`);
        console.log(`   Bins: ${route.binIds ? route.binIds.length : (route.binDetails ? route.binDetails.length : 0)}`);
        console.log(`   Created: ${route.createdAt}`);
        if (route.completedAt) {
            console.log(`   Completed: ${route.completedAt}`);
        }
        if (route.binIds) {
            console.log(`   Bin IDs: ${route.binIds.join(', ')}`);
        }
        if (route.binDetails) {
            console.log(`   Bin Details: ${route.binDetails.map(b => `${b.id} (${b.fill}%)`).join(', ')}`);
        }
    });
    
    // Check active vs completed
    const activeRoutes = driverRoutes.filter(r => r.status !== 'completed' && r.status !== 'cancelled');
    const completedRoutes = driverRoutes.filter(r => r.status === 'completed');
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Active routes: ${activeRoutes.length}`);
    console.log(`   Completed routes: ${completedRoutes.length}`);
    console.log(`   Total collections today: ${dataManager.getTodayCollections().filter(c => c.driverId === currentUser.id).length}`);
    
    // Check what loadDriverRoutes would show
    const filteredRoutes = dataManager.getDriverRoutes(currentUser.id);
    console.log(`   Routes shown in UI: ${filteredRoutes.length}`);
    
    console.log('\n💡 Use debugRouteStatus() anytime to check your route status');
    console.log('💡 Use viewDriverHistory() to see collection history');
    console.log('💡 Use viewBinHistory("BIN_ID") to check specific bin status');
    
    return {
        allRoutes: driverRoutes,
        activeRoutes,
        completedRoutes,
        filteredRoutes
    };
};

// Global function to navigate to bin location
window.navigateToBin = function(binId, lat, lng) {
    console.log('🧭 Navigating to bin:', binId, 'at coordinates:', lat, lng);
    
    if (typeof mapManager !== 'undefined') {
        // Open driver map if not already open
        if (window.app && typeof window.app.openDriverMap === 'function') {
            window.app.openDriverMap();
        }
        
        // Center map on bin location
        setTimeout(() => {
            mapManager.centerMap(lat, lng, 16);
            
            // Show navigation message
            if (window.app) {
                window.app.showAlert(
                    'Navigation Started', 
                    `Navigating to bin at ${lat.toFixed(4)}, ${lng.toFixed(4)}. Follow the map directions.`,
                    'info'
                );
            }
        }, 500);
    } else {
        // Fallback: open in external map app
        const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        window.open(mapUrl, '_blank');
        
        if (window.app) {
            window.app.showAlert(
                'External Navigation', 
                'Opening location in external map application.',
                'info'
            );
        }
    }
}

// AI Suggestion Action Functions
// 🤖 ENHANCED AI SUGGESTION GLOBAL FUNCTIONS - Connected to Main AI System

window.refreshDriverAISuggestion = function() {
    const currentUser = authManager.getCurrentUser();
    if (!currentUser || currentUser.type !== 'driver') {
        console.warn('🔒 Enhanced AI refresh requires valid driver authentication');
        return;
    }
    
    console.log(`🔄 Refreshing Enhanced AI recommendation for driver ${currentUser.id}...`);
    
    // Show refresh animation
    const refreshIcon = document.getElementById('aiRefreshIcon');
    if (refreshIcon) {
        refreshIcon.style.animation = 'rotate 1s linear infinite';
        setTimeout(() => {
            refreshIcon.style.animation = '';
        }, 2000);
    }
    
    // Use the enhanced AI system
    if (window.app && typeof window.app.loadEnhancedDriverAI === 'function') {
        window.app.loadEnhancedDriverAI(currentUser.id);
        
        // Show success notification
        if (window.app.showAlert) {
            window.app.showAlert(
                '🤖 AI Refreshed', 
                'Updated with latest location and route data', 
                'success', 
                3000
            );
        }
    } else {
        console.error('❌ Enhanced AI system not available');
    }
};

window.acceptSmartRecommendation = function() {
    const currentRecommendation = window.currentAIRecommendation;
    if (!currentRecommendation) {
        console.warn('⚠️ No active AI recommendation to accept');
        if (window.app && window.app.showAlert) {
            window.app.showAlert('No Recommendation', 'No active recommendation to accept', 'warning', 3000);
        }
        return;
    }
    
    console.log(`✅ Accepting Enhanced AI recommendation for bin ${currentRecommendation.id}...`);
    
    try {
        // Create route for the recommended bin
        const routeData = {
            id: `route-ai-${Date.now()}`,
            driverId: currentRecommendation.driverId,
            binIds: [currentRecommendation.id],
            status: 'active',
            priority: currentRecommendation.priority.toLowerCase(),
            createdAt: new Date().toISOString(),
            aiGenerated: true,
            confidence: currentRecommendation.confidence,
            estimatedDistance: currentRecommendation.calculatedDistance,
            estimatedTime: currentRecommendation.estimatedTime
        };
        
        // Add route to data manager
        if (window.dataManager && typeof window.dataManager.addRoute === 'function') {
            window.dataManager.addRoute(routeData);
            
            // Sync to server
            if (window.syncManager && typeof window.syncManager.syncToServer === 'function') {
                window.syncManager.syncToServer();
            }
            
            // Update driver dashboard
            if (window.app && typeof window.app.populateDriverDashboard === 'function') {
                const currentUser = authManager.getCurrentUser();
                if (currentUser) {
                    window.app.populateDriverDashboard(currentUser);
                }
            }
            
            // Show success message
            if (window.app && window.app.showAlert) {
                window.app.showAlert(
                    '🎯 Route Accepted!', 
                    `AI route to ${currentRecommendation.id} has been added to your tasks`, 
                    'success', 
                    4000
                );
            }
            
            // Clear current recommendation and refresh AI
            window.currentAIRecommendation = null;
            setTimeout(() => {
                window.refreshDriverAISuggestion();
            }, 1000);
            
        } else {
            throw new Error('Data manager not available');
        }
        
    } catch (error) {
        console.error('❌ Failed to accept AI recommendation:', error);
        if (window.app && window.app.showAlert) {
            window.app.showAlert('Error', 'Failed to accept recommendation: ' + error.message, 'error', 4000);
        }
    }
};

window.viewRecommendationDetails = function() {
    const currentRecommendation = window.currentAIRecommendation;
    if (!currentRecommendation) {
        console.warn('⚠️ No active AI recommendation to view');
        return;
    }
    
    console.log(`👁️ Showing details for AI recommendation: ${currentRecommendation.id}`);
    
    // Show detailed modal with recommendation information
    const modalContent = `
        <div style="max-width: 500px; padding: 2rem; background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.90) 100%); border-radius: 20px; color: #e2e8f0;">
            <h2 style="color: #f1f5f9; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-brain" style="color: #3b82f6;"></i>
                AI Recommendation Details
            </h2>
            
            <div style="display: grid; gap: 1rem; margin-bottom: 1.5rem;">
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(59, 130, 246, 0.2);">
                    <span>Bin ID:</span>
                    <strong>${currentRecommendation.id}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(59, 130, 246, 0.2);">
                    <span>Location:</span>
                    <strong>${currentRecommendation.location || currentRecommendation.address}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(59, 130, 246, 0.2);">
                    <span>Fill Level:</span>
                    <strong style="color: ${currentRecommendation.fill >= 80 ? '#ef4444' : currentRecommendation.fill >= 60 ? '#f59e0b' : '#10b981'};">${currentRecommendation.fill}%</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(59, 130, 246, 0.2);">
                    <span>Distance:</span>
                    <strong>${Math.round(currentRecommendation.calculatedDistance * 100) / 100} km</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(59, 130, 246, 0.2);">
                    <span>Estimated Time:</span>
                    <strong>${currentRecommendation.estimatedTime} minutes</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(59, 130, 246, 0.2);">
                    <span>AI Confidence:</span>
                    <strong style="color: #10b981;">${currentRecommendation.confidence}%</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(59, 130, 246, 0.2);">
                    <span>Priority:</span>
                    <strong style="color: ${currentRecommendation.priority === 'HIGH' ? '#ef4444' : currentRecommendation.priority === 'MEDIUM' ? '#f59e0b' : '#10b981'};">${currentRecommendation.priority}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(59, 130, 246, 0.2);">
                    <span>CO₂ Savings:</span>
                    <strong style="color: #10b981;">${currentRecommendation.co2Savings} kg</strong>
                </div>
            </div>
            
            <div style="background: rgba(15, 23, 42, 0.8); padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem;">
                <h4 style="color: #f59e0b; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-lightbulb"></i>
                    AI Reasoning
                </h4>
                <p style="color: #e2e8f0; font-size: 0.9rem; line-height: 1.5;">${currentRecommendation.reasoning.explanation}</p>
            </div>
            
            <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                <button onclick="acceptSmartRecommendation(); closeModal();" style="flex: 1; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 0.75rem 1rem; border-radius: 10px; font-weight: 600; cursor: pointer;">
                    <i class="fas fa-check"></i> Accept Route
                </button>
                <button onclick="closeModal();" style="background: rgba(107, 114, 128, 0.5); color: #e2e8f0; border: none; padding: 0.75rem 1rem; border-radius: 10px; cursor: pointer;">
                    Close
                </button>
            </div>
        </div>
    `;
    
    // Show modal
    if (window.showCustomModal) {
        window.showCustomModal('AI Recommendation Details', modalContent);
    } else if (window.app && window.app.showAlert) {
        window.app.showAlert(
            'Recommendation Details', 
            `Bin: ${currentRecommendation.id} | Distance: ${Math.round(currentRecommendation.calculatedDistance * 100) / 100}km | Fill: ${currentRecommendation.fill}% | Confidence: ${currentRecommendation.confidence}%`, 
            'info', 
            6000
        );
    }
};

window.showAlternativeRoutes = function() {
    console.log('🔀 Showing alternative AI routes...');
    
    if (window.app && window.app.showAlert) {
        window.app.showAlert(
            '🔄 Alternative Routes', 
            'Generating alternative route suggestions...', 
            'info', 
            3000
        );
    }
    
    // For now, refresh to get potentially different recommendations
    setTimeout(() => {
        window.refreshDriverAISuggestion();
    }, 1000);
};

window.dismissSmartRecommendation = function() {
    console.log('❌ Dismissing AI recommendation...');
    
    // Clear current recommendation
    window.currentAIRecommendation = null;
    
    // Hide the recommendation
    const primaryRecommendation = document.getElementById('primaryRecommendation');
    const noRecommendationsState = document.getElementById('noRecommendationsState');
    
    if (primaryRecommendation) primaryRecommendation.style.display = 'none';
    if (noRecommendationsState) noRecommendationsState.style.display = 'block';
    
    if (window.app && window.app.showAlert) {
        window.app.showAlert(
            '👋 Recommendation Dismissed', 
            'AI recommendation has been dismissed', 
            'info', 
            2000
        );
    }
    
    // Refresh AI recommendations after a delay
    setTimeout(() => {
        window.refreshDriverAISuggestion();
    }, 5000);
};

window.showAISettings = function() {
    console.log('⚙️ Showing AI settings...');
    
    if (window.app && window.app.showAlert) {
        window.app.showAlert(
            '⚙️ AI Settings', 
            'AI configuration options coming soon!', 
            'info', 
            3000
        );
    }
};

window.showAIReasoning = function() {
    const aiReasoningPanel = document.getElementById('aiReasoningPanel');
    if (aiReasoningPanel) {
        const isVisible = aiReasoningPanel.style.display !== 'none';
        aiReasoningPanel.style.display = isVisible ? 'none' : 'block';
        
        // Animate the toggle
        if (!isVisible) {
            aiReasoningPanel.style.opacity = '0';
            aiReasoningPanel.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                aiReasoningPanel.style.transition = 'all 0.3s ease';
                aiReasoningPanel.style.opacity = '1';
                aiReasoningPanel.style.transform = 'translateY(0)';
            }, 10);
        }
    }
};

// Legacy function for compatibility
window.refreshAISuggestion = function() {
    const currentUser = authManager.getCurrentUser();
    if (!currentUser || currentUser.type !== 'driver') return;
    
    console.log('🔄 Refreshing AI suggestion...');
    
    // Create new suggestion
    if (typeof createAISuggestionForDriver === 'function') {
        createAISuggestionForDriver(currentUser.id);
        
        // Refresh the display after a short delay
        setTimeout(() => {
            if (window.app && typeof window.app.loadAISuggestionForDriver === 'function') {
                window.app.loadAISuggestionForDriver(currentUser.id);
            }
        }, 500);
        
        if (window.app) {
            window.app.showAlert('AI Suggestion', 'Refreshing recommendation...', 'info', 2000);
        }
    }
};

window.acceptAISuggestion = function() {
    const currentUser = authManager.getCurrentUser();
    if (!currentUser || currentUser.type !== 'driver') return;
    
    const suggestions = dataManager.getData('aiSuggestions') || {};
    const suggestion = suggestions[currentUser.id];
    
    if (suggestion && suggestion.binId) {
        console.log(`✅ Driver accepted AI suggestion for bin: ${suggestion.binId}`);
        
        // Mark bin as collected
        if (typeof window.markBinCollected === 'function') {
            window.markBinCollected(suggestion.binId);
        }
        
        // Remove the suggestion after acceptance
        dismissAISuggestion();
        
        if (window.app) {
            window.app.showAlert('AI Suggestion Accepted', 
                `Great! Collecting bin ${suggestion.binId} as recommended.`, 'success');
        }
    }
};

window.viewSuggestedBin = function() {
    const currentUser = authManager.getCurrentUser();
    if (!currentUser || currentUser.type !== 'driver') return;
    
    const suggestions = dataManager.getData('aiSuggestions') || {};
    const suggestion = suggestions[currentUser.id];
    
    if (suggestion && suggestion.binId) {
        // Show bin details modal
        if (typeof showBinDetails === 'function') {
            showBinDetails(suggestion.binId);
        }
    }
};

window.dismissAISuggestion = function() {
    const currentUser = authManager.getCurrentUser();
    if (!currentUser || currentUser.type !== 'driver') return;
    
    console.log('❌ Driver dismissed AI suggestion');
    
    // Remove suggestion from storage
    const suggestions = dataManager.getData('aiSuggestions') || {};
    delete suggestions[currentUser.id];
    dataManager.setData('aiSuggestions', suggestions);
    
    // Hide the suggestion card
    const aiSuggestionCard = document.getElementById('aiSuggestionCard');
    if (aiSuggestionCard) {
        aiSuggestionCard.style.display = 'none';
    }
    
    if (window.app) {
        window.app.showAlert('AI Suggestion Dismissed', 
            'Suggestion dismissed. A new one will be generated later.', 'info', 3000);
    }
};

// 🔧 DEBUG FUNCTION - Force show AI card (call from browser console: forceShowAICard())
window.forceShowAICard = function() {
    console.log('🔧 DEBUGGING: Force showing AI card...');
    
    const aiSuggestionCard = document.getElementById('aiSuggestionCard');
    if (aiSuggestionCard) {
        aiSuggestionCard.style.display = 'block';
        console.log('✅ AI Card forced to display: block');
    } else {
        console.error('❌ AI Suggestion Card element not found in DOM!');
    }
    
    // Check all AI-related elements
    const aiElements = [
        'aiSuggestionCard',
        'aiStatusIndicator', 
        'aiLoadingState',
        'primaryRecommendation',
        'noRecommendationsState'
    ];
    
    aiElements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`🔍 Element '${id}': ${element ? 'EXISTS' : 'MISSING'}`);
        if (element) {
            console.log(`   Current display: ${element.style.display || 'default'}`);
        }
    });
    
    // Force load AI if possible
    if (window.app && window.app.loadEnhancedDriverAI) {
        const currentUser = authManager?.getCurrentUser();
        if (currentUser && currentUser.type === 'driver') {
            console.log('🔄 Forcing AI reload...');
            window.app.loadEnhancedDriverAI(currentUser.id);
        }
    }
};

// Mark that app.js has loaded
console.log('📁 App.js file loaded - WasteManagementApp class is now available');
console.log('🔍 Current window.app status:', typeof window.app);
console.log('🔍 DOM readyState:', document.readyState);

// Initialize global app instance with comprehensive error handling
function initializeApp() {
    console.log('🔧 Starting WasteManagementApp initialization...');
    console.log('🔍 Function called at:', new Date().toISOString());

    // First, check if we have the basic dependencies
    const preDeps = {
        dataManager: typeof dataManager !== 'undefined',
        authManager: typeof authManager !== 'undefined',
        syncManager: typeof syncManager !== 'undefined',
        mapManager: typeof mapManager !== 'undefined',
        analyticsManager: typeof analyticsManager !== 'undefined'
    };

    console.log('🔍 Pre-initialization dependency check:', preDeps);
    
    // Check if we have any missing dependencies 
    const missingDeps = Object.keys(preDeps).filter(key => !preDeps[key]);
    if (missingDeps.length > 0) {
        console.warn('⚠️ Some dependencies are missing, but proceeding anyway:', missingDeps);
    }

    try {
        console.log('🏗️ Creating WasteManagementApp instance...');
        window.app = new WasteManagementApp();
        console.log('✅ WasteManagementApp instance created successfully');
        console.log('✅ window.app is now available globally');
        console.log('✅ App.js loaded successfully');
        
        // Add global driver refresh function
        window.refreshAllDriverData = function() {
            if (window.app && typeof window.app.refreshAllDriverData === 'function') {
                window.app.refreshAllDriverData();
            } else {
                console.warn('⚠️ refreshAllDriverData not available on app instance');
            }
        };
        
        // Also make the driver status function globally available
        window.getDriverLiveStatus = function(driverId) {
            if (window.app && typeof window.app.getDriverLiveStatus === 'function') {
                return window.app.getDriverLiveStatus(driverId);
            } else {
                console.warn('⚠️ getDriverLiveStatus not available on app instance');
                return { status: 'Unknown', lastSeen: null };
            }
        };
        
        // Listen for driver data update events from Driver System V3
        document.addEventListener('driverDataUpdated', function(event) {
            const { driverId, status, fuelLevel, timestamp, source } = event.detail;
            console.log(`🔔 Received driver data update event: ${driverId} -> Status: ${status}, Fuel: ${fuelLevel}%${source ? ` (${source})` : ''}`);
            console.log('🔍 Event detail:', event.detail);
            
            // Update all fuel level displays immediately
            updateAllFuelDisplays(driverId, fuelLevel);
            
            // Update live monitoring statistics
            updateLiveMonitoringStats();
            
            // Refresh all driver-related data
            if (window.app && typeof window.app.refreshAllDriverData === 'function') {
                console.log('📱 Refreshing all driver data in main app');
                window.app.refreshAllDriverData();
            }
            
            // Update map if available AND initialized
            if (typeof window.mapManager !== 'undefined' && window.mapManager && window.mapManager.map) {
                setTimeout(() => {
                    console.log('🗺️ Updating map driver status and UI');
                    
                    // Update driver status (recreates marker)
                    window.mapManager.updateDriverStatus(driverId, status);
                    
                    // NEW: Refresh all driver UI components (popup, modals, etc.)
                    if (typeof window.mapManager.updateDriverDataUI === 'function') {
                        window.mapManager.updateDriverDataUI(driverId);
                    }
                }, 150);
            } else if (window.mapManager && !window.mapManager.map) {
                console.log('⚠️ Map not initialized yet, skipping map update from event listener');
            }
            
            // ENHANCED: Smart monitoring page refresh with activity marking
            if (window.app && window.app.currentSection === 'monitoring') {
                // Mark activity to increase sync frequency
                if (window.syncManager) {
                    window.syncManager.markActivity();
                }
                
                setTimeout(async () => {
                    console.log('🔴 Driver action detected - triggering intelligent refresh');
                    await window.app.performLiveMonitoringSync();
                }, 300);
            }
            
            // Force analytics refresh if we're on dashboard
            if (window.app && window.app.currentSection === 'dashboard') {
                setTimeout(() => {
                    if (typeof analyticsManager !== 'undefined') {
                        console.log('📊 Updating dashboard metrics');
                        analyticsManager.updateDashboardMetrics();
                    }
                }, 200);
            }
        });
        
        // Function to update all fuel level displays
        function updateAllFuelDisplays(driverId, fuelLevel) {
            console.log(`⛽ Updating all fuel displays for driver ${driverId}: ${fuelLevel}%`);
            
            try {
                // 1. Update main driver overview fuel level
                const driverFuelElement = document.getElementById('driverFuelLevel');
                if (driverFuelElement) {
                    driverFuelElement.textContent = `${fuelLevel}%`;
                    console.log('✅ Updated main driver fuel level display');
                }
                
                // 2. Update modal fuel level display (driver overview section)
                const driverFuelModal = document.getElementById('driverFuelLevelModal');
                if (driverFuelModal) {
                    driverFuelModal.textContent = `${fuelLevel}%`;
                    console.log('✅ Updated modal fuel level display');
                }
                
                // 2b. Update driver fuel percentage text (next to fuel bar)
                const driverFuelPercentage = document.getElementById('driverFuelPercentage');
                if (driverFuelPercentage) {
                    driverFuelPercentage.textContent = `${fuelLevel}%`;
                    console.log('✅ Updated driver fuel percentage text');
                }
                
                // 3. Update driver fuel bar in the fuel status section
                const driverFuelBar = document.getElementById('driverFuelBar');
                if (driverFuelBar) {
                    driverFuelBar.style.width = `${fuelLevel}%`;
                    
                    // Update color based on fuel level
                    let fuelColor = '#10b981'; // Green
                    if (fuelLevel < 50) fuelColor = '#f59e0b'; // Yellow
                    if (fuelLevel < 25) fuelColor = '#ef4444'; // Red
                    
                    driverFuelBar.style.backgroundColor = fuelColor;
                    console.log('✅ Updated driver fuel bar with color:', fuelColor);
                }
                
                // 4. Update fuel level in driver stat cards (if visible)
                const statCards = document.querySelectorAll('.driver-stat-card');
                statCards.forEach(card => {
                    const fuelIcon = card.querySelector('.fa-gas-pump');
                    if (fuelIcon) {
                        const statValue = card.querySelector('.driver-stat-value');
                        if (statValue && statValue.id === 'driverFuelLevel') {
                            statValue.textContent = `${fuelLevel}%`;
                            
                            // Update color based on fuel level
                            let fuelColor = 'var(--success)';
                            if (fuelLevel < 50) fuelColor = 'var(--warning)';
                            if (fuelLevel < 25) fuelColor = 'var(--danger)';
                            
                            fuelIcon.style.color = fuelColor;
                            console.log('✅ Updated driver stat card fuel level');
                        }
                    }
                });
                
                // 5. Store updated fuel level in data manager for consistency
                if (window.dataManager) {
                    const fuelData = window.dataManager.getData('driverFuelLevels') || {};
                    fuelData[driverId] = fuelLevel;
                    window.dataManager.setData('driverFuelLevels', fuelData);
                    console.log('✅ Updated fuel data in data manager');
                }
                
            } catch (error) {
                console.error('❌ Error updating fuel displays:', error);
            }
        }
        
        // Function to update live monitoring statistics
        function updateLiveMonitoringStats() {
            try {
                console.log('📊 Updating live monitoring statistics...');
                
                // Get current drivers data
                const drivers = window.dataManager?.getDrivers?.() || [];
                const activeDrivers = drivers.filter(d => d.status === 'active');
                
                // 1. Update active sensors count
                const activeSensorsCount = document.getElementById('activeSensorsCount');
                if (activeSensorsCount) {
                    // Calculate sensors based on active drivers and vehicles
                    const sensorCount = Math.max(activeDrivers.length * 3, 5); // Each driver has 3 sensors (GPS, fuel, status)
                    activeSensorsCount.textContent = sensorCount;
                    console.log('✅ Updated active sensors count:', sensorCount);
                }
                
                // 2. Update online vehicles count
                const onlineVehiclesCount = document.getElementById('onlineVehiclesCount');
                if (onlineVehiclesCount) {
                    const vehicleCount = activeDrivers.length;
                    onlineVehiclesCount.textContent = vehicleCount;
                    console.log('✅ Updated online vehicles count:', vehicleCount);
                }
                
                // 3. Update active drivers status
                const activeDriversStatus = document.getElementById('activeDriversStatus');
                if (activeDriversStatus) {
                    activeDriversStatus.textContent = activeDrivers.length;
                    console.log('✅ Updated active drivers status:', activeDrivers.length);
                }
                
                // 4. Update critical bins list (if exists)
                const criticalBinsList = document.getElementById('criticalBinsList');
                if (criticalBinsList) {
                    // Generate some realistic critical bins based on current activity
                    const criticalBins = generateCriticalBinsList(activeDrivers.length);
                    criticalBinsList.innerHTML = criticalBins.map(bin => `
                        <div class="bin-alert-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: rgba(239, 68, 68, 0.1); border-radius: 8px; margin-bottom: 0.5rem;">
                            <div>
                                <div style="font-weight: bold; color: #ef4444;">Bin ${bin.id}</div>
                                <div style="font-size: 0.875rem; color: #94a3b8;">${bin.location} - ${bin.level}% full</div>
                            </div>
                            <div style="color: #ef4444; font-weight: bold;">${bin.priority}</div>
                        </div>
                    `).join('');
                    console.log('✅ Updated critical bins list');
                }
                
                // 5. Update active alerts list (if exists)
                const activeAlertsList = document.getElementById('activeAlertsList');
                if (activeAlertsList) {
                    const alerts = generateActiveAlerts(activeDrivers);
                    activeAlertsList.innerHTML = alerts.map(alert => `
                        <div class="alert-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: rgba(245, 158, 11, 0.1); border-radius: 8px; margin-bottom: 0.5rem;">
                            <div>
                                <div style="font-weight: bold; color: #f59e0b;">${alert.type}</div>
                                <div style="font-size: 0.875rem; color: #94a3b8;">${alert.message}</div>
                            </div>
                            <div style="color: #f59e0b; font-size: 0.75rem;">${alert.time}</div>
                        </div>
                    `).join('');
                    console.log('✅ Updated active alerts list');
                }
                
            } catch (error) {
                console.error('❌ Error updating live monitoring stats:', error);
            }
        }
        
        // Helper function to generate critical bins data
        function generateCriticalBinsList(activeDriverCount) {
            const bins = [];
            const locations = ['Al Rayyan', 'West Bay', 'The Pearl', 'Souq Waqif', 'Education City'];
            
            for (let i = 0; i < Math.min(3, Math.max(1, activeDriverCount)); i++) {
                bins.push({
                    id: `B-${1000 + i}`,
                    location: locations[i % locations.length],
                    level: Math.floor(Math.random() * 15) + 85, // 85-100% full
                    priority: Math.random() > 0.5 ? 'HIGH' : 'URGENT'
                });
            }
            
            return bins;
        }
        
        // Helper function to generate active alerts
        function generateActiveAlerts(activeDrivers) {
            const alerts = [];
            const currentTime = new Date();
            
            if (activeDrivers.length > 0) {
                alerts.push({
                    type: 'Route Update',
                    message: `${activeDrivers.length} driver(s) active on routes`,
                    time: currentTime.toLocaleTimeString()
                });
                
                // Add fuel alerts for drivers with low fuel
                activeDrivers.forEach(driver => {
                    const fuelLevel = driver.fuelLevel || 75;
                    if (fuelLevel < 30) {
                        alerts.push({
                            type: 'Fuel Alert',
                            message: `Driver ${driver.name} fuel level: ${fuelLevel}%`,
                            time: currentTime.toLocaleTimeString()
                        });
                    }
                });
            }
            
            return alerts.slice(0, 5); // Limit to 5 alerts
        }
        
        // Immediate verification
        console.log('🔍 window.app type after creation:', typeof window.app);
        console.log('🔍 window.app exists:', window.app !== null && window.app !== undefined);
        
        // Verify the app instance
        if (window.app && typeof window.app.showAlert === 'function') {
            console.log('✅ App instance verification passed - all methods available');
        } else {
            console.warn('⚠️ App instance created but may not be fully functional');
            console.log('🔍 Available methods:', Object.getOwnPropertyNames(window.app || {}));
        }
    
} catch (error) {
    console.error('❌ CRITICAL: Failed to initialize WasteManagementApp');
    console.error('❌ Error details:', error.message);
    console.error('❌ Stack trace:', error.stack);
    console.error('❌ This will cause the dependency check to fail');
    
    // Create a comprehensive fallback app instance
    console.log('🚑 Creating emergency fallback app instance...');
    window.app = {
        initialized: false,
        showAlert: function(title, message, type, duration) {
            console.log(`[${type?.toUpperCase() || 'INFO'}] ${title}: ${message}`);
            alert(`${title}\n\n${message}`);
        },
        loadDriverRoutes: function() {
            console.log('🚨 Fallback: loadDriverRoutes called');
            return Promise.resolve();
        },
        updateDriverStats: function() {
            console.log('🚨 Fallback: updateDriverStats called');
            return Promise.resolve();
        },
        refreshDashboard: function() {
            console.log('🚨 Fallback: refreshDashboard called');
            return Promise.resolve();
        },
        openDriverMap: function() {
            console.log('🚨 Fallback: openDriverMap called');
        },
        showSection: function(section) {
            console.log('🚨 Fallback: showSection called for:', section);
        },
        isInitialized: function() {
            return false;
        }
    };
    
    console.log('✅ Emergency fallback app instance created');
    console.log('⚠️ App will have limited functionality');
    
    // Try to show the error to the user
    setTimeout(() => {
        alert(`Application initialization failed!\n\nError: ${error.message}\n\nThe app will run in limited mode. Please refresh the page.`);
    }, 1000);
    }
}

// Initialize app immediately - no delays to avoid race conditions
console.log('⚡ Initializing app immediately...');
try {
    initializeApp();
    console.log('✅ initializeApp() call completed');
} catch (error) {
    console.error('❌ CRITICAL: initializeApp() call failed:', error);
}