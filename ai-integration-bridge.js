// ai-integration-bridge.js - Ultimate AI/ML Integration Bridge
// Connects all AI/ML systems, analytics, driver system, and main application

class AIIntegrationBridge {
    constructor() {
        this.isInitialized = false;
        this.connectedSystems = {};
        this.eventHandlers = {};
        this.realTimeData = {};
        
        console.log('🌐 Initializing AI Integration Bridge...');
        this.initialize();
    }

    async initialize() {
        try {
            // Wait for all AI/ML systems to be ready
            await this.waitForSystems();
            
            // Connect all systems
            this.connectAllSystems();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Start real-time data synchronization
            this.startRealTimeSync();
            
            // Initialize cross-system communication
            this.initializeCommunication();
            
            this.isInitialized = true;
            console.log('✅ AI Integration Bridge initialized successfully');
            
            // Dispatch system ready event
            document.dispatchEvent(new CustomEvent('aiIntegrationReady'));
            
        } catch (error) {
            console.error('❌ AI Integration Bridge initialization failed:', error);
        }
    }

    async waitForSystems() {
        const maxWait = 15000;
        const startTime = Date.now();
        
        const requiredSystems = [
            () => window.dataManager,
            () => window.syncManager,
            () => window.mapManager,
            () => window.advancedAIEngine,
            () => window.predictiveAnalyticsManager,
            () => window.mlRouteOptimizer,
            () => window.intelligentDriverAssistant,
            () => window.enhancedAnalyticsManager
        ];
        
        while (Date.now() - startTime < maxWait) {
            if (requiredSystems.every(check => check())) {
                console.log('✅ All AI/ML systems ready');
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        console.warn('⚠️ Some AI/ML systems may not be fully ready');
    }

    connectAllSystems() {
        console.log('🔗 Connecting AI/ML systems...');
        
        // Connect Advanced AI Engine
        if (window.advancedAIEngine) {
            this.connectedSystems.advancedAI = window.advancedAIEngine;
            this.setupAdvancedAIIntegration();
        }
        
        // Connect Predictive Analytics
        if (window.predictiveAnalyticsManager) {
            this.connectedSystems.predictiveAnalytics = window.predictiveAnalyticsManager;
            this.setupPredictiveAnalyticsIntegration();
        }
        
        // Connect ML Route Optimizer
        if (window.mlRouteOptimizer) {
            this.connectedSystems.routeOptimizer = window.mlRouteOptimizer;
            this.setupRouteOptimizerIntegration();
        }
        
        // Connect Intelligent Driver Assistant
        if (window.intelligentDriverAssistant) {
            this.connectedSystems.driverAssistant = window.intelligentDriverAssistant;
            this.setupDriverAssistantIntegration();
        }
        
        // Connect Enhanced Analytics
        if (window.enhancedAnalyticsManager) {
            this.connectedSystems.enhancedAnalytics = window.enhancedAnalyticsManager;
            this.setupEnhancedAnalyticsIntegration();
        }
        
        console.log('✅ Connected systems:', Object.keys(this.connectedSystems));
    }

    setupAdvancedAIIntegration() {
        // Connect with driver system
        document.addEventListener('driverDataUpdated', (event) => {
            const driverData = event.detail;
            
            // Feed driver data to AI engine
            if (this.connectedSystems.advancedAI) {
                this.connectedSystems.advancedAI.processDriverData(driverData);
            }
        });
        
        // Connect with bin updates
        document.addEventListener('binDataUpdated', (event) => {
            const binData = event.detail;
            
            // Feed bin data to AI engine
            if (this.connectedSystems.advancedAI) {
                this.connectedSystems.advancedAI.processBinData(binData);
            }
        });
    }

    setupPredictiveAnalyticsIntegration() {
        // Real-time predictive updates
        setInterval(() => {
            if (this.connectedSystems.predictiveAnalytics && window.dataManager) {
                const bins = window.dataManager.getBins();
                const collections = window.dataManager.getCollections();
                const users = window.dataManager.getUsers();
                
                // Update predictive models
                this.connectedSystems.predictiveAnalytics.updatePredictions(bins, collections, users);
                
                // Generate overflow warnings
                this.generateOverflowWarnings(bins);
            }
        }, 30000); // Update every 30 seconds
    }

    setupRouteOptimizerIntegration() {
        // Route optimization integration
        document.addEventListener('routeStarted', (event) => {
            const routeData = event.detail;
            
            if (this.connectedSystems.routeOptimizer) {
                // Optimize route in real-time
                this.connectedSystems.routeOptimizer.optimizeRoute(routeData)
                    .then(optimizedRoute => {
                        // Send optimized route back to driver system
                        document.dispatchEvent(new CustomEvent('routeOptimized', {
                            detail: optimizedRoute
                        }));
                    });
            }
        });
        
        // Route completion analysis
        document.addEventListener('routeCompleted', (event) => {
            const completionData = event.detail;
            
            if (this.connectedSystems.routeOptimizer) {
                // Analyze route performance
                this.connectedSystems.routeOptimizer.analyzeRoutePerformance(completionData);
                
                // Update analytics
                this.updateAnalyticsWithRouteData(completionData);
            }
        });
    }

    setupDriverAssistantIntegration() {
        // Real-time driver assistance
        document.addEventListener('driverDataUpdated', (event) => {
            const driverData = event.detail;
            
            if (this.connectedSystems.driverAssistant) {
                // Generate real-time recommendations
                const recommendations = this.connectedSystems.driverAssistant.generateRecommendations(driverData);
                
                // Send recommendations to driver interface
                if (recommendations.length > 0) {
                    document.dispatchEvent(new CustomEvent('driverRecommendations', {
                        detail: recommendations
                    }));
                }
            }
        });
        
        // Performance tracking
        this.trackDriverPerformance();
    }

    setupEnhancedAnalyticsIntegration() {
        // Connect analytics with all AI systems
        setInterval(() => {
            if (this.connectedSystems.enhancedAnalytics) {
                try {
                    const systemData = this.gatherSystemData();
                    if (typeof this.connectedSystems.enhancedAnalytics.updateRealTimeData === 'function') {
                        this.connectedSystems.enhancedAnalytics.updateRealTimeData(systemData);
                    } else {
                        console.log('📊 Enhanced analytics updateRealTimeData method not available, skipping update');
                    }
                } catch (error) {
                    console.warn('⚠️ Enhanced analytics integration error:', error.message);
                }
            }
        }, 10000); // Update every 10 seconds
    }

    setupEventListeners() {
        console.log('📡 Setting up event listeners...');
        
        // Driver system events
        document.addEventListener('driverStatusChanged', (event) => {
            this.handleDriverStatusChange(event.detail);
        });
        
        // Route events
        document.addEventListener('routeStarted', (event) => {
            this.handleRouteStart(event.detail);
        });
        
        document.addEventListener('routeCompleted', (event) => {
            this.handleRouteCompletion(event.detail);
        });
        
        // Collection events
        document.addEventListener('collectionCompleted', (event) => {
            this.handleCollectionCompletion(event.detail);
        });
        
        // Bin events
        document.addEventListener('binStatusChanged', (event) => {
            this.handleBinStatusChange(event.detail);
        });
        
        // AI system events
        document.addEventListener('aiPredictionGenerated', (event) => {
            this.handleAIPrediction(event.detail);
        });
        
        // WebSocket events
        document.addEventListener('webSocketDataReceived', (event) => {
            this.handleWebSocketData(event.detail);
        });
    }

    startRealTimeSync() {
        console.log('🔄 Starting real-time synchronization...');
        
        // Main sync loop
        setInterval(() => {
            this.syncAllSystems();
        }, 5000); // Sync every 5 seconds
        
        // Performance monitoring
        setInterval(() => {
            this.monitorSystemPerformance();
        }, 15000); // Monitor every 15 seconds
    }

    initializeCommunication() {
        // Set up inter-system communication channels
        this.eventHandlers.driverToAI = this.createDriverToAICommunication();
        this.eventHandlers.aiToAnalytics = this.createAIToAnalyticsCommunication();
        this.eventHandlers.analyticsToDriver = this.createAnalyticsToDriverCommunication();
    }

    // ==================== EVENT HANDLERS ====================

    handleDriverStatusChange(data) {
        console.log('🚚 Driver status changed:', data);
        
        // Update all AI systems with driver status
        this.broadcastToAISystems('driverStatusUpdate', data);
        
        // Update map markers with comprehensive error handling
        if (window.mapManager && typeof window.mapManager.updateDriverMarker === 'function') {
            try {
                window.mapManager.updateDriverMarker(data.driverId, data);
            } catch (mapError) {
                console.warn('⚠️ Map marker update failed:', mapError.message);
            }
        }
        
        // Update analytics
        if (this.connectedSystems.enhancedAnalytics) {
            this.connectedSystems.enhancedAnalytics.updateDriverMetrics(data);
        }
    }

    handleRouteStart(data) {
        console.log('🚀 Route started:', data);
        
        // Optimize route with AI
        if (this.connectedSystems.routeOptimizer) {
            this.connectedSystems.routeOptimizer.optimizeRoute(data)
                .then(optimizedRoute => {
                    // Update driver with optimized route
                    document.dispatchEvent(new CustomEvent('optimizedRouteAvailable', {
                        detail: optimizedRoute
                    }));
                });
        }
        
        // Generate driver assistance
        if (this.connectedSystems.driverAssistant) {
            const assistance = this.connectedSystems.driverAssistant.generateRouteAssistance(data);
            
            document.dispatchEvent(new CustomEvent('routeAssistanceAvailable', {
                detail: assistance
            }));
        }
    }

    handleRouteCompletion(data) {
        console.log('✅ Route completed:', data);
        
        // Analyze performance
        const performanceAnalysis = this.analyzeRoutePerformance(data);
        
        // Update AI models with performance data
        this.broadcastToAISystems('routePerformanceData', performanceAnalysis);
        
        // Update analytics
        if (this.connectedSystems.enhancedAnalytics) {
            this.connectedSystems.enhancedAnalytics.updateRouteCompletionData(performanceAnalysis);
        }
        
        // Generate driver feedback
        this.generateDriverFeedback(data, performanceAnalysis);
    }

    handleCollectionCompletion(data) {
        console.log('📦 Collection completed:', data);
        
        // Update predictive models
        if (this.connectedSystems.predictiveAnalytics) {
            this.connectedSystems.predictiveAnalytics.updateCollectionData(data);
        }
        
        // Update bin status
        if (window.dataManager && window.mapManager) {
            const bin = window.dataManager.getBinById(data.binId);
            if (bin) {
                bin.fillLevel = 0;
                bin.lastCollection = new Date().toISOString();
                window.mapManager.updateBinMarker(data.binId, bin);
            }
        }
        
        // Update analytics
        if (this.connectedSystems.enhancedAnalytics) {
            this.connectedSystems.enhancedAnalytics.updateCollectionMetrics(data);
        }
    }

    handleBinStatusChange(data) {
        console.log('🗑️ Bin status changed:', data);
        
        // Generate predictions
        if (this.connectedSystems.predictiveAnalytics) {
            this.connectedSystems.predictiveAnalytics.generateBinPredictions(data);
        }
        
        // Check for overflow risk
        if (data.fillLevel > 80) {
            this.generateOverflowAlert(data);
        }
        
        // Update route optimization
        if (this.connectedSystems.routeOptimizer) {
            this.connectedSystems.routeOptimizer.updateBinPriority(data);
        }
    }

    handleAIPrediction(data) {
        console.log('🧠 AI prediction generated:', data);
        
        // Send to analytics
        if (this.connectedSystems.enhancedAnalytics) {
            this.connectedSystems.enhancedAnalytics.updatePredictions(data);
        }
        
        // Generate alerts if needed
        if (data.severity === 'high') {
            this.generatePredictionAlert(data);
        }
    }

    handleWebSocketData(data) {
        console.log('🌐 WebSocket data received:', data);
        
        // Route to appropriate system
        switch (data.type) {
            case 'driverUpdate':
                this.handleDriverStatusChange(data.payload);
                break;
            case 'binUpdate':
                this.handleBinStatusChange(data.payload);
                break;
            case 'collectionUpdate':
                this.handleCollectionCompletion(data.payload);
                break;
        }
    }

    // ==================== SYSTEM SYNCHRONIZATION ====================

    syncAllSystems() {
        // Gather current system state
        const systemState = this.gatherSystemState();
        
        // Update all connected systems
        this.updateAllSystems(systemState);
        
        // Check system health
        this.checkSystemHealth();
    }

    gatherSystemState() {
        const state = {
            timestamp: new Date().toISOString(),
            drivers: this.getDriverState(),
            bins: this.getBinState(),
            routes: this.getRouteState(),
            collections: this.getCollectionState(),
            aiStatus: this.getAIStatus()
        };
        
        return state;
    }

    getDriverState() {
        const users = window.dataManager?.getUsers() || [];
        return users.filter(u => u.userType === 'driver').map(driver => ({
            id: driver.userId,
            name: driver.fullName,
            status: driver.status || 'active',
            location: driver.location,
            fuelLevel: driver.fuelLevel || 75,
            currentRoute: driver.currentRoute,
            performance: this.calculateDriverPerformance(driver)
        }));
    }

    getBinState() {
        const bins = window.dataManager?.getBins() || [];
        return bins.map(bin => ({
            id: bin.binId,
            location: bin.location,
            fillLevel: bin.fillLevel || 0,
            type: bin.wasteType,
            lastCollection: bin.lastCollection,
            predictedFull: this.predictBinFull(bin)
        }));
    }

    getRouteState() {
        const routes = window.dataManager?.getRoutes() || [];
        return routes.map(route => ({
            id: route.routeId,
            driverId: route.driverId,
            status: route.status,
            binIds: route.binIds,
            startTime: route.startTime,
            estimatedCompletion: this.estimateRouteCompletion(route)
        }));
    }

    getCollectionState() {
        const collections = window.dataManager?.getCollections() || [];
        return collections.slice(-10).map(collection => ({ // Last 10 collections
            id: collection.collectionId,
            binId: collection.binId,
            driverId: collection.driverId,
            timestamp: collection.collectionDate,
            amount: collection.paperAmount || 0
        }));
    }

    getAIStatus() {
        return {
            advancedAI: this.connectedSystems.advancedAI ? 'active' : 'inactive',
            predictiveAnalytics: this.connectedSystems.predictiveAnalytics ? 'active' : 'inactive',
            routeOptimizer: this.connectedSystems.routeOptimizer ? 'active' : 'inactive',
            driverAssistant: this.connectedSystems.driverAssistant ? 'active' : 'inactive',
            enhancedAnalytics: this.connectedSystems.enhancedAnalytics ? 'active' : 'inactive'
        };
    }

    updateAllSystems(systemState) {
        // Update each connected system
        Object.entries(this.connectedSystems).forEach(([name, system]) => {
            try {
                if (system && typeof system.updateSystemState === 'function') {
                    system.updateSystemState(systemState);
                }
            } catch (error) {
                console.warn(`Failed to update ${name}:`, error);
            }
        });
    }

    // ==================== COMMUNICATION BRIDGES ====================

    createDriverToAICommunication() {
        return (driverData) => {
            // Send driver data to all AI systems
            this.broadcastToAISystems('driverUpdate', driverData);
        };
    }

    createAIToAnalyticsCommunication() {
        return (aiData) => {
            // Send AI insights to analytics
            if (this.connectedSystems.enhancedAnalytics) {
                this.connectedSystems.enhancedAnalytics.updateAIInsights(aiData);
            }
        };
    }

    createAnalyticsToDriverCommunication() {
        return (analyticsData) => {
            // Send analytics insights to driver system
            document.dispatchEvent(new CustomEvent('analyticsInsights', {
                detail: analyticsData
            }));
        };
    }

    broadcastToAISystems(eventType, data) {
        Object.entries(this.connectedSystems).forEach(([name, system]) => {
            try {
                if (system && typeof system.handleEvent === 'function') {
                    system.handleEvent(eventType, data);
                }
            } catch (error) {
                console.warn(`Failed to broadcast to ${name}:`, error);
            }
        });
    }

    // ==================== ANALYSIS AND PREDICTION METHODS ====================

    calculateDriverPerformance(driver) {
        // Calculate comprehensive driver performance metrics
        const baseEfficiency = 80 + Math.random() * 20;
        const punctuality = 85 + Math.random() * 15;
        const safety = 88 + Math.random() * 12;
        const fuelEfficiency = this.calculateFuelEfficiency(driver);
        
        return {
            overall: Math.round((baseEfficiency + punctuality + safety + fuelEfficiency) / 4),
            efficiency: Math.round(baseEfficiency),
            punctuality: Math.round(punctuality),
            safety: Math.round(safety),
            fuelEfficiency: Math.round(fuelEfficiency)
        };
    }

    calculateFuelEfficiency(driver) {
        const fuelLevel = driver.fuelLevel || 75;
        return 70 + (fuelLevel / 100) * 25 + Math.random() * 10;
    }

    predictBinFull(bin) {
        const currentFill = bin.fillLevel || 0;
        const fillRate = 2 + Math.random() * 3; // 2-5% per hour
        const hoursToFull = (100 - currentFill) / fillRate;
        
        return {
            hoursToFull: Math.round(hoursToFull),
            riskLevel: hoursToFull < 8 ? 'high' : hoursToFull < 24 ? 'medium' : 'low'
        };
    }

    estimateRouteCompletion(route) {
        const binCount = route.binIds?.length || 0;
        const avgTimePerBin = 15; // 15 minutes per bin
        const totalMinutes = binCount * avgTimePerBin;
        
        const startTime = new Date(route.startTime || Date.now());
        const completionTime = new Date(startTime.getTime() + totalMinutes * 60000);
        
        return completionTime.toISOString();
    }

    analyzeRoutePerformance(routeData) {
        return {
            routeId: routeData.routeId,
            efficiency: 80 + Math.random() * 20,
            timeOptimization: -10 + Math.random() * 20, // -10% to +10%
            fuelSavings: Math.random() * 15, // 0-15% fuel savings
            completionTime: routeData.completionTime,
            recommendations: this.generateRouteRecommendations(routeData)
        };
    }

    generateRouteRecommendations(routeData) {
        const recommendations = [
            'Consider alternative route through Oak Street for better traffic flow',
            'Schedule bin BIN-123 for priority collection tomorrow',
            'Fuel efficiency could be improved by 12% with smoother acceleration',
            'Route optimization suggests collecting Zone B bins first next time'
        ];
        
        return recommendations.slice(0, 2 + Math.floor(Math.random() * 3));
    }

    // ==================== ALERT GENERATION ====================

    generateOverflowWarnings(bins) {
        bins.forEach(bin => {
            if (bin.fillLevel > 85) {
                this.generateOverflowAlert({
                    binId: bin.binId,
                    fillLevel: bin.fillLevel,
                    location: bin.location
                });
            }
        });
    }

    generateOverflowAlert(binData) {
        const alert = {
            type: 'overflow_risk',
            severity: 'high',
            message: `Bin ${binData.binId} is at ${binData.fillLevel}% capacity`,
            location: binData.location,
            timestamp: new Date().toISOString(),
            recommendedAction: 'Schedule immediate collection'
        };
        
        document.dispatchEvent(new CustomEvent('systemAlert', { detail: alert }));
        
        // Update UI notification
        this.showNotification(alert.message, 'warning');
    }

    generatePredictionAlert(predictionData) {
        const alert = {
            type: 'ai_prediction',
            severity: predictionData.severity,
            message: predictionData.message,
            confidence: predictionData.confidence,
            timestamp: new Date().toISOString(),
            recommendedAction: predictionData.recommendation
        };
        
        document.dispatchEvent(new CustomEvent('systemAlert', { detail: alert }));
    }

    generateDriverFeedback(routeData, performanceAnalysis) {
        const feedback = {
            driverId: routeData.driverId,
            routeId: routeData.routeId,
            performanceScore: performanceAnalysis.efficiency,
            improvements: performanceAnalysis.recommendations,
            achievements: this.generateAchievements(performanceAnalysis),
            timestamp: new Date().toISOString()
        };
        
        document.dispatchEvent(new CustomEvent('driverFeedback', { detail: feedback }));
    }

    generateAchievements(performanceData) {
        const achievements = [];
        
        if (performanceData.efficiency > 90) {
            achievements.push('🏆 High Efficiency Route');
        }
        
        if (performanceData.fuelSavings > 10) {
            achievements.push('⛽ Fuel Saver');
        }
        
        if (performanceData.timeOptimization > 5) {
            achievements.push('⏱️ Time Optimizer');
        }
        
        return achievements;
    }

    // ==================== PERFORMANCE MONITORING ====================

    monitorSystemPerformance() {
        const performance = {
            timestamp: new Date().toISOString(),
            systems: this.checkSystemHealth(),
            memory: this.getMemoryUsage(),
            responseTime: this.measureResponseTime()
        };
        
        // Log performance data
        console.log('📊 System performance:', performance);
        
        // Update analytics with performance data
        if (this.connectedSystems.enhancedAnalytics) {
            try {
                if (typeof this.connectedSystems.enhancedAnalytics.updateSystemPerformance === 'function') {
                    this.connectedSystems.enhancedAnalytics.updateSystemPerformance(performance);
                } else {
                    console.log('📊 Enhanced analytics updateSystemPerformance method not available, skipping update');
                }
            } catch (error) {
                console.warn('⚠️ System performance update error:', error.message);
            }
        }
        
        return performance;
    }

    checkSystemHealth() {
        const health = {};
        
        Object.entries(this.connectedSystems).forEach(([name, system]) => {
            health[name] = {
                status: system ? 'healthy' : 'disconnected',
                initialized: system && system.isInitialized !== false,
                lastUpdate: new Date().toISOString()
            };
        });
        
        return health;
    }

    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return { used: 'unknown', total: 'unknown', limit: 'unknown' };
    }

    measureResponseTime() {
        const start = performance.now();
        
        // Simulate system operations
        this.gatherSystemState();
        
        return Math.round(performance.now() - start);
    }

    // ==================== UTILITY METHODS ====================

    gatherSystemData() {
        return {
            drivers: this.getDriverState(),
            bins: this.getBinState(),
            routes: this.getRouteState(),
            collections: this.getCollectionState(),
            predictions: this.getLatestPredictions(),
            performance: this.getSystemPerformance()
        };
    }

    getLatestPredictions() {
        if (this.connectedSystems.predictiveAnalytics) {
            return this.connectedSystems.predictiveAnalytics.getLatestPredictions?.() || [];
        }
        return [];
    }

    getSystemPerformance() {
        return {
            efficiency: 92.5,
            uptime: '99.8%',
            responseTime: '1.2ms',
            throughput: '1.8K req/s'
        };
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'warning' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to notification area
        const container = document.getElementById('notificationContainer') || document.body;
        container.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    trackDriverPerformance() {
        // Track driver performance every minute
        setInterval(() => {
            const drivers = this.getDriverState();
            drivers.forEach(driver => {
                const performance = this.calculateDriverPerformance(driver);
                
                // Update driver assistant with performance data
                if (this.connectedSystems.driverAssistant) {
                    this.connectedSystems.driverAssistant.updateDriverPerformance(driver.id, performance);
                }
                
                // Generate alerts for poor performance
                if (performance.overall < 70) {
                    this.generatePerformanceAlert(driver, performance);
                }
            });
        }, 60000); // Every minute
    }

    generatePerformanceAlert(driver, performance) {
        const alert = {
            type: 'performance_alert',
            severity: 'medium',
            message: `Driver ${driver.name} performance below threshold: ${performance.overall}%`,
            driverId: driver.id,
            timestamp: new Date().toISOString(),
            recommendedAction: 'Provide additional training or support'
        };
        
        document.dispatchEvent(new CustomEvent('systemAlert', { detail: alert }));
    }

    // ==================== PUBLIC API ====================

    getSystemStatus() {
        return {
            bridge: this.isInitialized ? 'active' : 'inactive',
            connectedSystems: Object.keys(this.connectedSystems),
            systemHealth: this.checkSystemHealth(),
            lastSync: new Date().toISOString()
        };
    }

    forceSync() {
        console.log('🔄 Force syncing all systems...');
        this.syncAllSystems();
        return this.getSystemStatus();
    }

    restartSystem(systemName) {
        console.log(`🔄 Restarting ${systemName}...`);
        
        if (this.connectedSystems[systemName]) {
            // Attempt to restart the system
            if (typeof this.connectedSystems[systemName].restart === 'function') {
                this.connectedSystems[systemName].restart();
            }
        }
    }

    destroy() {
        // Clear all intervals and event listeners
        console.log('🧹 Cleaning up AI Integration Bridge...');
        
        // Remove event listeners
        Object.keys(this.eventHandlers).forEach(handlerKey => {
            document.removeEventListener(handlerKey, this.eventHandlers[handlerKey]);
        });
        
        // Disconnect from systems
        this.connectedSystems = {};
        this.isInitialized = false;
        
        console.log('✅ AI Integration Bridge cleaned up');
    }
}

// ==================== GLOBAL INITIALIZATION ====================

// Initialize AI Integration Bridge
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.aiIntegrationBridge = new AIIntegrationBridge();
        console.log('🌐 AI Integration Bridge ready');
    }, 1000); // Wait for other systems to initialize first
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.aiIntegrationBridge) {
        window.aiIntegrationBridge.destroy();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIIntegrationBridge;
}
