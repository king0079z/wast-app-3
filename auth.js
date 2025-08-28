// auth.js - Fixed Authentication and User Management Module

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.sessionTimer = null;
        // Delay initialization to ensure dataManager is loaded
        this.initialized = false;
        setTimeout(() => this.init(), 100);
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;
        
        // Check if dataManager exists
        if (typeof dataManager === 'undefined') {
            console.error('DataManager not loaded yet, retrying...');
            setTimeout(() => this.init(), 500);
            return;
        }
        
        // Fix any corrupted accounts first
        dataManager.fixCorruptedAccounts();
        
        // Check for existing session
        const session = this.getSession();
        if (session && new Date(session.expiresAt) > new Date()) {
            this.currentUser = session.user;
            this.startSessionTimer();
            console.log('Session restored for user:', this.currentUser.name);
        }
    }

    // Login function - Fixed for all user types
    async login(username, password, userType) {
        try {
            console.log('Login attempt:', { username, userType });
            
            // Ensure dataManager is loaded
            if (typeof dataManager === 'undefined') {
                console.error('DataManager not loaded');
                throw new Error('System not ready. Please refresh the page and try again.');
            }
            
            // Get user from database
            const allUsers = dataManager.getUsers();
            console.log('🔍 All available users:', allUsers.map(u => `${u.username} (${u.type})`));
            
            const user = dataManager.getUserByUsername(username);
            
            if (!user) {
                console.log('❌ User not found:', username);
                console.log('Available usernames:', allUsers.map(u => u.username));
                throw new Error('User not found. Please check your username.');
            }
            
            console.log('Found user:', user);
            
            // Check password
            if (user.password !== password) {
                console.log('Invalid password for user:', username);
                throw new Error('Invalid password. Please try again.');
            }
            
            // Check user type
            if (user.type !== userType) {
                console.log('User type mismatch:', user.type, 'vs', userType);
                throw new Error(`This account is registered as ${user.type}. Please select the correct user type.`);
            }
            
            // Check account status
            if (user.status !== 'active') {
                console.log('Account not active:', user.status);
                throw new Error('Your account is not active. Please contact the administrator for approval.');
            }
            
            // Set current user
            this.currentUser = user;
            
            // Create session
            this.createSession(user);
            
            // Update user's last login
            dataManager.updateUser(user.id, { 
                lastLogin: new Date().toISOString() 
            });
            
            // Log the login
            dataManager.addSystemLog(`User logged in: ${user.name} (${user.type})`, 'info');
            
            console.log('Login successful for:', user.name);
            
            return {
                success: true,
                user: user
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Logout function
    logout() {
        if (this.currentUser) {
            dataManager.addSystemLog(`User logged out: ${this.currentUser.name}`, 'info');
            console.log('User logged out:', this.currentUser.name);
        }
        
        this.currentUser = null;
        this.clearSession();
        
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }
        
        // Redirect to login
        window.location.reload();
    }

    // Registration function - Fixed
    async register(userData) {
        try {
            console.log('Registration attempt:', userData);
            
            // Ensure dataManager is loaded
            if (typeof dataManager === 'undefined') {
                console.error('DataManager not loaded');
                throw new Error('System not ready. Please refresh the page and try again.');
            }
            
            // Validate required fields
            if (!userData.username || !userData.password || !userData.name || !userData.email) {
                throw new Error('Please fill in all required fields');
            }
            
            // Check if username already exists
            const existingUser = dataManager.getUserByUsername(userData.username);
            if (existingUser) {
                console.log('Username already exists:', userData.username);
                throw new Error('Username already exists. Please choose a different username.');
            }
            
            // Check if email already exists
            const users = dataManager.getUsers();
            const emailExists = users.some(u => u.email === userData.email);
            if (emailExists) {
                console.log('Email already exists:', userData.email);
                throw new Error('Email already registered. Please use a different email.');
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userData.email)) {
                throw new Error('Please enter a valid email address');
            }
            
            // Validate phone format (optional)
            if (userData.phone) {
                const phoneRegex = /^[\d\s\-\+\(\)]+$/;
                if (!phoneRegex.test(userData.phone)) {
                    throw new Error('Please enter a valid phone number');
                }
            }
            
            // Add to pending registrations
            const registration = dataManager.addPendingRegistration({
                userType: userData.userType || 'driver',
                name: userData.name,
                username: userData.username,
                email: userData.email,
                phone: userData.phone || '',
                password: userData.password,
                vehicleId: userData.vehicleId || '',
                license: userData.license || '',
                submittedAt: new Date().toISOString(),
                status: 'pending'
            });
            
            console.log('Registration submitted:', registration);
            
            // Log the registration
            dataManager.addSystemLog(`New registration submitted: ${userData.name} (${userData.userType})`, 'info');
            
            return {
                success: true,
                message: 'Registration submitted successfully! Please wait for admin approval. You will be notified via email once approved.',
                registrationId: registration.id
            };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Session Management
    createSession(user) {
        const session = {
            user: user,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + this.sessionTimeout).toISOString()
        };
        
        localStorage.setItem('waste_mgmt_session', JSON.stringify(session));
        this.startSessionTimer();
        console.log('Session created for:', user.name);
    }

    getSession() {
        const sessionData = localStorage.getItem('waste_mgmt_session');
        return sessionData ? JSON.parse(sessionData) : null;
    }

    clearSession() {
        localStorage.removeItem('waste_mgmt_session');
        console.log('Session cleared');
    }

    refreshSession() {
        if (this.currentUser) {
            this.createSession(this.currentUser);
            console.log('Session refreshed for:', this.currentUser.name);
        }
    }

    startSessionTimer() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }
        
        this.sessionTimer = setTimeout(() => {
            this.showSessionExpiredAlert();
            this.logout();
        }, this.sessionTimeout);
    }

    showSessionExpiredAlert() {
        if (typeof showAlert === 'function') {
            showAlert('Session Expired', 'Your session has expired. Please login again.', 'warning');
        }
    }

    // Permission Checks
    hasPermission(action) {
        if (!this.currentUser) return false;
        
        const permissions = {
            admin: ['all'],
            manager: [
                'view_dashboard',
                'manage_bins',
                'manage_routes',
                'view_analytics',
                'manage_complaints',
                'manage_drivers',
                'generate_reports'
            ],
            driver: [
                'view_driver_dashboard',
                'update_location',
                'complete_collection',
                'report_issue',
                'view_assigned_routes'
            ]
        };
        
        const userPermissions = permissions[this.currentUser.type] || [];
        return userPermissions.includes('all') || userPermissions.includes(action);
    }

    isAdmin() {
        return this.currentUser && this.currentUser.type === 'admin';
    }

    isManager() {
        return this.currentUser && this.currentUser.type === 'manager';
    }

    isDriver() {
        return this.currentUser && this.currentUser.type === 'driver';
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // Update user profile
    async updateProfile(updates) {
        if (!this.currentUser) {
            return { success: false, error: 'Not logged in' };
        }
        
        try {
            const updatedUser = dataManager.updateUser(this.currentUser.id, updates);
            if (updatedUser) {
                this.currentUser = updatedUser;
                this.refreshSession();
                console.log('Profile updated for:', this.currentUser.name);
                return { success: true, user: updatedUser };
            }
            throw new Error('Failed to update profile');
        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, error: error.message };
        }
    }

    // Change password
    async changePassword(currentPassword, newPassword) {
        if (!this.currentUser) {
            return { success: false, error: 'Not logged in' };
        }
        
        if (this.currentUser.password !== currentPassword) {
            return { success: false, error: 'Current password is incorrect' };
        }
        
        // Validate new password
        if (newPassword.length < 6) {
            return { success: false, error: 'New password must be at least 6 characters long' };
        }
        
        try {
            const updatedUser = dataManager.updateUser(this.currentUser.id, { password: newPassword });
            if (updatedUser) {
                this.currentUser = updatedUser;
                this.refreshSession();
                dataManager.addSystemLog(`Password changed for user: ${this.currentUser.name}`, 'info');
                console.log('Password changed for:', this.currentUser.name);
                return { success: true, message: 'Password changed successfully' };
            }
            throw new Error('Failed to change password');
        } catch (error) {
            console.error('Password change error:', error);
            return { success: false, error: error.message };
        }
    }

    // Admin functions - Fixed
    async approveRegistration(registrationId) {
        if (!this.isAdmin()) {
            console.log('Unauthorized: Not an admin');
            return { success: false, error: 'Unauthorized: Admin access required' };
        }
        
        try {
            console.log('Approving registration:', registrationId);
            
            const pending = dataManager.getPendingRegistrations();
            const registration = pending.find(r => r.id === registrationId);
            
            if (!registration) {
                throw new Error('Registration not found');
            }
            
            // Check if username still available
            const existingUser = dataManager.getUserByUsername(registration.username);
            if (existingUser) {
                throw new Error('Username is no longer available');
            }
            
            // Create the user account
            const newUser = {
                id: dataManager.generateId('USR'),
                username: registration.username,
                password: registration.password,
                name: registration.name,
                email: registration.email,
                phone: registration.phone || '',
                type: registration.userType || 'driver',
                vehicleId: registration.vehicleId || '',
                license: registration.license || '',
                status: 'active',
                createdAt: new Date().toISOString(),
                rating: 5.0
            };
            
            // Add user to system
            const users = dataManager.getUsers();
            users.push(newUser);
            dataManager.setData('users', users);
            
            // Remove from pending registrations
            const updatedPending = pending.filter(r => r.id !== registrationId);
            dataManager.setData('pendingRegistrations', updatedPending);
            
            // Log the approval
            dataManager.addSystemLog(`Registration approved: ${newUser.name} (${newUser.type}) by ${this.currentUser.name}`, 'success');
            
            console.log('User created:', newUser);
            
            return { 
                success: true, 
                message: `Registration approved successfully. User ${newUser.name} can now login.`,
                user: newUser
            };
        } catch (error) {
            console.error('Registration approval error:', error);
            return { success: false, error: error.message };
        }
    }

    async rejectRegistration(registrationId) {
        if (!this.isAdmin()) {
            console.log('Unauthorized: Not an admin');
            return { success: false, error: 'Unauthorized: Admin access required' };
        }
        
        try {
            console.log('Rejecting registration:', registrationId);
            
            const pending = dataManager.getPendingRegistrations();
            const registration = pending.find(r => r.id === registrationId);
            
            if (!registration) {
                throw new Error('Registration not found');
            }
            
            // Remove from pending registrations
            const updatedPending = pending.filter(r => r.id !== registrationId);
            dataManager.setData('pendingRegistrations', updatedPending);
            
            // Log the rejection
            dataManager.addSystemLog(`Registration rejected: ${registration.name} by ${this.currentUser.name}`, 'warning');
            
            console.log('Registration rejected:', registration.name);
            
            return { 
                success: true, 
                message: `Registration for ${registration.name} has been rejected.`
            };
        } catch (error) {
            console.error('Registration rejection error:', error);
            return { success: false, error: error.message };
        }
    }

    async updateUserStatus(userId, status) {
        if (!this.isAdmin()) {
            return { success: false, error: 'Unauthorized: Admin access required' };
        }
        
        try {
            const updatedUser = dataManager.updateUser(userId, { status });
            if (updatedUser) {
                console.log('User status updated:', updatedUser.name, status);
                return { success: true, user: updatedUser };
            }
            throw new Error('Failed to update user status');
        } catch (error) {
            console.error('User status update error:', error);
            return { success: false, error: error.message };
        }
    }

    // Driver specific functions
    async updateDriverLocation(latitude, longitude) {
        if (!this.isDriver()) {
            return { success: false, error: 'Not a driver account' };
        }
        
        try {
            const location = dataManager.updateDriverLocation(this.currentUser.id, latitude, longitude);
            console.log('Driver location updated:', this.currentUser.name, location);
            return { success: true, location };
        } catch (error) {
            console.error('Location update error:', error);
            return { success: false, error: error.message };
        }
    }

    async getAssignedRoutes() {
        if (!this.isDriver()) {
            return [];
        }
        
        return dataManager.getDriverRoutes(this.currentUser.id);
    }

    async completeCollection(binId, weight = 50) {
        if (!this.isDriver()) {
            return { success: false, error: 'Not a driver account' };
        }
        
        try {
            const collection = dataManager.addCollection({
                binId,
                driverId: this.currentUser.id,
                driverName: this.currentUser.name,
                weight
            });
            
            console.log('Collection completed:', collection);
            
            return { success: true, collection };
        } catch (error) {
            console.error('Collection error:', error);
            return { success: false, error: error.message };
        }
    }

    // Manager specific functions
    async assignRoute(driverId, binIds) {
        if (!this.isManager() && !this.isAdmin()) {
            return { success: false, error: 'Unauthorized' };
        }
        
        try {
            const route = dataManager.addRoute({
                driverId,
                binIds,
                assignedBy: this.currentUser.id,
                assignedByName: this.currentUser.name
            });
            
            console.log('Route assigned:', route);
            
            return { success: true, route };
        } catch (error) {
            console.error('Route assignment error:', error);
            return { success: false, error: error.message };
        }
    }

    async updateBinStatus(binId, updates) {
        if (!this.isManager() && !this.isAdmin()) {
            return { success: false, error: 'Unauthorized' };
        }
        
        try {
            const bin = dataManager.updateBin(binId, updates);
            console.log('Bin status updated:', bin);
            return { success: true, bin };
        } catch (error) {
            console.error('Bin update error:', error);
            return { success: false, error: error.message };
        }
    }

    // Activity tracking
    trackActivity(action, details = {}) {
        if (this.currentUser) {
            dataManager.addSystemLog(
                `${action} by ${this.currentUser.name} (${this.currentUser.type})`,
                'activity',
                { userId: this.currentUser.id, ...details }
            );
        }
    }

}

// Create global instance with delay to ensure dataManager is ready
window.authManager = null;

// Initialize AuthManager after ensuring dataManager is loaded
function initializeAuthManager() {
    if (typeof dataManager === 'undefined') {
        console.log('Waiting for dataManager to load...');
        setTimeout(initializeAuthManager, 100);
        return;
    }
    
    console.log('Initializing AuthManager...');
    window.authManager = new AuthManager();
    console.log('AuthManager initialized successfully');
}

// Start initialization with error handling
try {
    console.log('🔐 Loading Auth Manager...');
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAuthManager);
    } else {
        initializeAuthManager();
    }
    
    console.log('✅ Auth.js loaded successfully');
} catch (error) {
    console.error('❌ Failed to load Auth Manager:', error);
    console.error('❌ Stack trace:', error.stack);
}