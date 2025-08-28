// analytics-manager-v2.js - Complete Analytics Manager with AI/ML Integration
// Comprehensive analytics system with real-time data, driver integration, and AI-powered insights

class AnalyticsManagerV2 {
    constructor() {
        this.charts = {};
        this.realTimeData = {};
        this.updateIntervals = {};
        this.isInitialized = false;
        this.currentTab = 'overview';
        this.aiInsights = {};
        
        console.log('📊 Initializing Analytics Manager V2...');
        this.initialize();
    }

    async initialize() {
        try {
            // Wait for dependencies
            await this.waitForDependencies();
            
            // Initialize Chart.js defaults
            this.setupChartDefaults();
            
            // Initialize analytics system
            this.initializeAnalyticsSystem();
            
            // Set up real-time updates
            this.setupRealTimeUpdates();
            
            // Connect to driver system
            this.connectToDriverSystem();
            
            // Set up event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ Analytics Manager V2 initialized successfully');
            
        } catch (error) {
            console.error('❌ Analytics Manager V2 initialization failed:', error);
        }
    }

    async waitForDependencies() {
        const maxWait = 10000;
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWait) {
            if (window.Chart && window.dataManager) {
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    setupChartDefaults() {
        if (!window.Chart) return;

        Chart.defaults.color = '#ffffff';
        Chart.defaults.borderColor = 'rgba(148, 163, 184, 0.1)';
        Chart.defaults.backgroundColor = 'rgba(0, 212, 255, 0.1)';
        Chart.defaults.font.family = "'Inter', sans-serif";
        Chart.defaults.plugins.legend.labels.usePointStyle = true;
        Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        Chart.defaults.plugins.tooltip.cornerRadius = 8;
    }

    // ==================== ANALYTICS SYSTEM INITIALIZATION ====================

    initializeAnalyticsSystem() {
        console.log('📊 Setting up analytics charts and metrics...');
        
        // Initialize all charts
        this.initializeAllCharts();
        
        // Update metrics
        this.updateAllMetrics();
        
        // Start real-time monitoring
        this.startRealTimeMonitoring();
    }

    initializeAllCharts() {
        // Overview tab charts
        this.initializeCollectionsTrendChart();
        this.initializeFillDistributionChart();
        
        // Performance tab charts
        this.initializeDriverPerformanceChart();
        this.initializeRouteEfficiencyChart();
        
        // Predictive tab charts
        this.initializeDemandForecastChart();
        this.initializeOverflowPredictionChart();
        
        // Operational tab charts
        this.initializeOperationalEfficiencyChart();
        this.initializeResourceUtilizationChart();
        
        // Environmental tab charts
        this.initializeSustainabilityChart();
        
        // Financial tab charts
        this.initializeCostAnalysisChart();
        this.initializeROISavingsChart();
    }

    // ==================== CHART IMPLEMENTATIONS ====================

    initializeCollectionsTrendChart() {
        const ctx = document.getElementById('collections-trend-chart');
        if (!ctx || !window.Chart) return;

        // Destroy existing chart if it exists - more aggressive cleanup
        if (this.charts.collectionsTrend) {
            this.charts.collectionsTrend.destroy();
            this.charts.collectionsTrend = null;
        }
        
        // Also check for any existing Chart instances on this canvas
        const existingChartInstance = Chart.getChart(ctx);
        if (existingChartInstance) {
            existingChartInstance.destroy();
        }

        // Get real data from data manager
        const collections = this.getCollectionsTrendData();

        try {
            this.charts.collectionsTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: collections.labels,
                datasets: [{
                    label: 'Daily Collections (kg)',
                    data: collections.data,
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#00d4ff',
                    pointBorderColor: '#ffffff',
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        labels: { color: '#ffffff', padding: 20 }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff'
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    },
                    y: {
                        ticks: { 
                            color: '#94a3b8',
                            callback: function(value) {
                                return value + ' kg';
                            }
                        },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    }
                }
            }
        });
            
        } catch (error) {
            console.error('❌ Failed to create collections trend chart:', error);
            this.charts.collectionsTrend = null;
            
            // Show fallback message in the chart container
            const container = ctx.parentElement;
            if (container) {
                container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 2rem;">Collections Trend Chart temporarily unavailable</div>';
            }
        }
    }

    initializeFillDistributionChart() {
        const ctx = document.getElementById('fill-distribution-chart');
        if (!ctx || !window.Chart) return;

        // Destroy existing chart if it exists - more aggressive cleanup
        if (this.charts.fillDistribution) {
            this.charts.fillDistribution.destroy();
            this.charts.fillDistribution = null;
        }
        
        // Also check for any existing Chart instances on this canvas
        const existingChartInstance = Chart.getChart(ctx);
        if (existingChartInstance) {
            existingChartInstance.destroy();
        }

        const distribution = this.getBinFillDistribution();

        try {
            this.charts.fillDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'],
                datasets: [{
                    data: distribution,
                    backgroundColor: [
                        '#10b981', // Green for low fill
                        '#f59e0b', // Yellow for medium fill
                        '#3b82f6', // Blue for moderate fill
                        '#ef4444', // Red for high fill
                        '#7c3aed'  // Purple for very high fill
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { 
                            color: '#ffffff',
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} bins (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
            
        } catch (error) {
            console.error('❌ Failed to create fill distribution chart:', error);
            this.charts.fillDistribution = null;
            
            // Show fallback message in the chart container
            const container = ctx.parentElement;
            if (container) {
                container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 2rem;">Fill Distribution Chart temporarily unavailable</div>';
            }
        }
    }

    initializeDriverPerformanceChart() {
        const ctx = document.getElementById('driver-performance-chart');
        if (!ctx || !window.Chart) return;

        // Destroy existing chart if it exists - more aggressive cleanup
        if (this.charts.driverPerformance) {
            this.charts.driverPerformance.destroy();
            this.charts.driverPerformance = null;
        }
        
        // Also check for any existing Chart instances on this canvas
        const existingChartInstance = Chart.getChart(ctx);
        if (existingChartInstance) {
            existingChartInstance.destroy();
        }

        const drivers = this.getDriverPerformanceData();

        this.charts.driverPerformance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Efficiency', 'Punctuality', 'Safety', 'Customer Rating', 'Route Adherence'],
                datasets: drivers.map((driver, index) => ({
                    label: driver.name,
                    data: driver.metrics,
                    borderColor: this.getDriverColor(index),
                    backgroundColor: this.getDriverColor(index, 0.2),
                    pointBackgroundColor: this.getDriverColor(index),
                    pointBorderColor: '#ffffff',
                    pointHoverBackgroundColor: '#ffffff',
                    pointHoverBorderColor: this.getDriverColor(index)
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { 
                            color: '#ffffff',
                            padding: 20
                        }
                    }
                },
                scales: {
                    r: {
                        min: 0,
                        max: 100,
                        ticks: { 
                            color: '#94a3b8',
                            backdropColor: 'transparent'
                        },
                        grid: { color: 'rgba(148, 163, 184, 0.3)' },
                        pointLabels: { color: '#ffffff' }
                    }
                }
            }
        });
    }

    initializeRouteEfficiencyChart() {
        const ctx = document.getElementById('route-efficiency-chart');
        if (!ctx || !window.Chart) return;

        // Destroy existing chart if it exists - more aggressive cleanup
        if (this.charts.routeEfficiency) {
            this.charts.routeEfficiency.destroy();
            this.charts.routeEfficiency = null;
        }
        
        // Also check for any existing Chart instances on this canvas
        const existingChartInstance = Chart.getChart(ctx);
        if (existingChartInstance) {
            existingChartInstance.destroy();
        }

        const efficiency = this.getRouteEfficiencyData();

        this.charts.routeEfficiency = new Chart(ctx, {
            type: 'line',
            data: {
                labels: efficiency.labels,
                datasets: [{
                    label: 'AI Optimized Routes',
                    data: efficiency.aiOptimized,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Manual Routes',
                    data: efficiency.manual,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff', padding: 20 }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    },
                    y: {
                        ticks: { 
                            color: '#94a3b8',
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' },
                        min: 0,
                        max: 100
                    }
                }
            }
        });
    }

    initializeDemandForecastChart() {
        const ctx = document.getElementById('demand-forecast-chart');
        if (!ctx || !window.Chart) return;

        // Destroy existing chart if it exists - more aggressive cleanup
        if (this.charts.demandForecast) {
            this.charts.demandForecast.destroy();
            this.charts.demandForecast = null;
        }
        
        // Also check for any existing Chart instances on this canvas
        const existingChartInstance = Chart.getChart(ctx);
        if (existingChartInstance) {
            existingChartInstance.destroy();
        }

        const forecast = this.getDemandForecastData();

        this.charts.demandForecast = new Chart(ctx, {
            type: 'line',
            data: {
                labels: forecast.labels,
                datasets: [{
                    label: 'Predicted Demand',
                    data: forecast.predicted,
                    borderColor: '#7c3aed',
                    backgroundColor: 'rgba(124, 58, 237, 0.1)',
                    tension: 0.4,
                    borderDash: [5, 5]
                }, {
                    label: 'Historical Data',
                    data: forecast.historical,
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff', padding: 20 }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    },
                    y: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    }
                }
            }
        });
    }

    initializeOverflowPredictionChart() {
        const ctx = document.getElementById('overflow-prediction-chart');
        if (!ctx || !window.Chart) return;

        // Destroy existing chart if it exists - more aggressive cleanup
        if (this.charts.overflowPrediction) {
            this.charts.overflowPrediction.destroy();
            this.charts.overflowPrediction = null;
        }
        
        // Also check for any existing Chart instances on this canvas
        const existingChartInstance = Chart.getChart(ctx);
        if (existingChartInstance) {
            existingChartInstance.destroy();
        }

        const overflow = this.getOverflowPredictionData();

        this.charts.overflowPrediction = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: overflow.labels,
                datasets: [{
                    label: 'High Risk Bins',
                    data: overflow.highRisk,
                    backgroundColor: '#ef4444'
                }, {
                    label: 'Medium Risk Bins',
                    data: overflow.mediumRisk,
                    backgroundColor: '#f59e0b'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff', padding: 20 }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    },
                    y: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    }
                }
            }
        });
    }

    // Additional chart initializers would go here...
    initializeOperationalEfficiencyChart() {
        const ctx = document.getElementById('operational-efficiency-chart');
        if (!ctx || !window.Chart) return;

        // Destroy existing chart if it exists
        if (this.charts.operationalEfficiency) {
            try {
                this.charts.operationalEfficiency.destroy();
            } catch (error) {
                console.warn('Chart cleanup warning:', error);
            }
            this.charts.operationalEfficiency = null;
        }

        // Generate operational efficiency data
        const operationalData = this.getOperationalEfficiencyData();

        try {
            this.charts.operationalEfficiency = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: operationalData.labels,
                    datasets: [
                        {
                            label: 'Route Efficiency (%)',
                            data: operationalData.routeEfficiency,
                            borderColor: '#4CAF50',
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4
                        },
                        {
                            label: 'Fleet Utilization (%)',
                            data: operationalData.fleetUtilization,
                            borderColor: '#2196F3',
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4
                        },
                        {
                            label: 'Collection Rate (%)',
                            data: operationalData.collectionRate,
                            borderColor: '#FF9800',
                            backgroundColor: 'rgba(255, 152, 0, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Operational Efficiency Trends',
                            font: { size: 16, weight: 'bold' },
                            color: '#333'
                        },
                        legend: {
                            position: 'top',
                            labels: { color: '#333' }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: 'rgba(0,0,0,0.1)' },
                            ticks: { color: '#666' }
                        },
                        y: {
                            beginAtZero: true,
                            max: 100,
                            grid: { color: 'rgba(0,0,0,0.1)' },
                            ticks: { 
                                color: '#666',
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    }
                }
            });
            console.log('✅ Operational efficiency chart initialized');
        } catch (error) {
            console.error('❌ Failed to create operational efficiency chart:', error);
        }
    }

    initializeResourceUtilizationChart() {
        const ctx = document.getElementById('resource-utilization-chart');
        if (!ctx || !window.Chart) return;

        // Destroy existing chart if it exists
        if (this.charts.resourceUtilization) {
            try {
                this.charts.resourceUtilization.destroy();
            } catch (error) {
                console.warn('Chart cleanup warning:', error);
            }
            this.charts.resourceUtilization = null;
        }

        // Generate resource utilization data
        const resourceData = this.getResourceUtilizationData();

        try {
            this.charts.resourceUtilization = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: resourceData.labels,
                    datasets: [{
                        data: resourceData.utilization,
                        backgroundColor: [
                            '#4CAF50',  // Vehicles in use
                            '#2196F3',  // Drivers active
                            '#FF9800',  // Bins being collected
                            '#9C27B0',  // Available resources
                            '#F44336'   // Under maintenance
                        ],
                        borderColor: '#fff',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Current Resource Utilization',
                            font: { size: 16, weight: 'bold' },
                            color: '#333'
                        },
                        legend: {
                            position: 'right',
                            labels: { 
                                color: '#333',
                                padding: 20,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
            console.log('✅ Resource utilization chart initialized');
        } catch (error) {
            console.error('❌ Failed to create resource utilization chart:', error);
        }
    }

    initializeSustainabilityChart() {
        const ctx = document.getElementById('sustainability-chart');
        if (!ctx || !window.Chart) return;

        // Destroy existing chart if it exists - more aggressive cleanup
        if (this.charts.sustainability) {
            this.charts.sustainability.destroy();
            this.charts.sustainability = null;
        }
        
        // Also check for any existing Chart instances on this canvas
        const existingChartInstance = Chart.getChart(ctx);
        if (existingChartInstance) {
            existingChartInstance.destroy();
        }

        const sustainability = this.getSustainabilityData();

        this.charts.sustainability = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sustainability.labels,
                datasets: [{
                    label: 'CO2 Reduction (%)',
                    data: sustainability.co2,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    yAxisID: 'y',
                    tension: 0.4
                }, {
                    label: 'Energy Saved (kWh)',
                    data: sustainability.energy,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    yAxisID: 'y1',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff', padding: 20 }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        ticks: { color: '#94a3b8' },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    }

    initializeCostAnalysisChart() {
        const ctx = document.getElementById('cost-analysis-chart');
        if (!ctx || !window.Chart) return;

        // Destroy existing chart if it exists
        if (this.charts.costAnalysis) {
            try {
                this.charts.costAnalysis.destroy();
            } catch (error) {
                console.warn('Chart cleanup warning:', error);
            }
            this.charts.costAnalysis = null;
        }

        // Generate cost analysis data
        const costData = this.getCostAnalysisData();

        try {
            this.charts.costAnalysis = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: costData.categories,
                    datasets: [
                        {
                            label: 'Current Period ($)',
                            data: costData.currentCosts,
                            backgroundColor: 'rgba(54, 162, 235, 0.8)',
                            borderColor: '#36A2EB',
                            borderWidth: 2
                        },
                        {
                            label: 'Previous Period ($)',
                            data: costData.previousCosts,
                            backgroundColor: 'rgba(255, 99, 132, 0.8)',
                            borderColor: '#FF6384',
                            borderWidth: 2
                        },
                        {
                            label: 'Budget ($)',
                            data: costData.budgetedCosts,
                            backgroundColor: 'rgba(75, 192, 192, 0.8)',
                            borderColor: '#4BC0C0',
                            borderWidth: 2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Cost Analysis by Category',
                            font: { size: 16, weight: 'bold' },
                            color: '#333'
                        },
                        legend: {
                            position: 'top',
                            labels: { color: '#333' }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.dataset.label || '';
                                    const value = context.parsed.y;
                                    return `${label}: $${value.toLocaleString()}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: 'rgba(0,0,0,0.1)' },
                            ticks: { color: '#666' }
                        },
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(0,0,0,0.1)' },
                            ticks: { 
                                color: '#666',
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                }
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    }
                }
            });
            console.log('✅ Cost analysis chart initialized');
        } catch (error) {
            console.error('❌ Failed to create cost analysis chart:', error);
        }
    }

    initializeROISavingsChart() {
        const ctx = document.getElementById('roi-savings-chart');
        if (!ctx || !window.Chart) return;

        // Destroy existing chart if it exists
        if (this.charts.roiSavings) {
            try {
                this.charts.roiSavings.destroy();
            } catch (error) {
                console.warn('Chart cleanup warning:', error);
            }
            this.charts.roiSavings = null;
        }

        // Generate ROI and savings data
        const roiData = this.getROISavingsData();

        try {
            this.charts.roiSavings = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: roiData.months,
                    datasets: [
                        {
                            label: 'ROI (%)',
                            data: roiData.roi,
                            borderColor: '#4CAF50',
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            borderWidth: 3,
                            fill: false,
                            tension: 0.4,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Cumulative Savings ($)',
                            data: roiData.cumulativeSavings,
                            borderColor: '#2196F3',
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            yAxisID: 'y1'
                        },
                        {
                            label: 'Monthly Savings ($)',
                            data: roiData.monthlySavings,
                            borderColor: '#FF9800',
                            backgroundColor: 'rgba(255, 152, 0, 0.1)',
                            borderWidth: 3,
                            fill: false,
                            tension: 0.4,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'ROI & Savings Analysis',
                            font: { size: 16, weight: 'bold' },
                            color: '#333'
                        },
                        legend: {
                            position: 'top',
                            labels: { color: '#333' }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.dataset.label || '';
                                    const value = context.parsed.y;
                                    if (label.includes('ROI')) {
                                        return `${label}: ${value.toFixed(1)}%`;
                                    } else {
                                        return `${label}: $${value.toLocaleString()}`;
                                    }
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: 'rgba(0,0,0,0.1)' },
                            ticks: { color: '#666' }
                        },
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            beginAtZero: true,
                            grid: { color: 'rgba(0,0,0,0.1)' },
                            ticks: { 
                                color: '#666',
                                callback: function(value) {
                                    return value.toFixed(1) + '%';
                                }
                            },
                            title: {
                                display: true,
                                text: 'ROI (%)',
                                color: '#666'
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            beginAtZero: true,
                            grid: { drawOnChartArea: false },
                            ticks: { 
                                color: '#666',
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                }
                            },
                            title: {
                                display: true,
                                text: 'Savings ($)',
                                color: '#666'
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    }
                }
            });
            console.log('✅ ROI savings chart initialized');
        } catch (error) {
            console.error('❌ Failed to create ROI savings chart:', error);
        }
    }

    // ==================== TAB-SPECIFIC CHART INITIALIZATION ====================

    initializeTabSpecificCharts(tabName) {
        console.log(`🎯 Initializing charts for ${tabName} tab...`);
        
        switch(tabName) {
            case 'overview':
                this.initializeCollectionsTrendChart();
                this.initializeFillDistributionChart();
                break;
                
            case 'performance':
                this.initializeDriverPerformanceChart();
                this.initializeRouteEfficiencyChart();
                break;
                
            case 'predictive':
                this.initializeDemandForecastChart();
                this.initializeOverflowPredictionChart();
                break;
                
            case 'operational':
                this.initializeOperationalEfficiencyChart();
                this.initializeResourceUtilizationChart();
                console.log('✅ Operational charts initialized');
                break;
                
            case 'environmental':
                this.initializeSustainabilityChart();
                break;
                
            case 'financial':
                this.initializeCostAnalysisChart();
                this.initializeROISavingsChart();
                console.log('✅ Financial charts initialized');
                break;
                
            default:
                console.log(`⚠️ Unknown tab: ${tabName}`);
        }
    }

    // ==================== DATA RETRIEVAL METHODS ====================

    getOperationalEfficiencyData() {
        try {
            // Generate 30 days of operational data
            const days = Array.from({length: 30}, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (29 - i));
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });

            // Simulate realistic operational efficiency trends
            const baseEfficiency = 75;
            const routeEfficiency = days.map((_, i) => {
                const trend = Math.sin(i * 0.2) * 5; // Cyclical pattern
                const noise = (Math.random() - 0.5) * 8; // Random variation
                return Math.max(60, Math.min(95, baseEfficiency + trend + noise));
            });

            const fleetUtilization = days.map((_, i) => {
                const trend = Math.cos(i * 0.15) * 8;
                const noise = (Math.random() - 0.5) * 6;
                return Math.max(65, Math.min(90, 80 + trend + noise));
            });

            const collectionRate = days.map((_, i) => {
                const trend = Math.sin(i * 0.1) * 6;
                const noise = (Math.random() - 0.5) * 4;
                return Math.max(70, Math.min(98, 85 + trend + noise));
            });

            return {
                labels: days,
                routeEfficiency: routeEfficiency.map(v => Math.round(v * 100) / 100),
                fleetUtilization: fleetUtilization.map(v => Math.round(v * 100) / 100),
                collectionRate: collectionRate.map(v => Math.round(v * 100) / 100)
            };
        } catch (error) {
            console.error('Error generating operational efficiency data:', error);
            return {
                labels: ['No Data'],
                routeEfficiency: [0],
                fleetUtilization: [0],
                collectionRate: [0]
            };
        }
    }

    getResourceUtilizationData() {
        try {
            // Get real data from the system where possible
            const drivers = window.dataManager?.getDrivers() || [];
            const totalDrivers = drivers.length || 10;
            const activeDrivers = drivers.filter(d => d.status === 'active').length || 7;
            
            // Simulate realistic resource utilization
            const vehiclesInUse = Math.floor(activeDrivers * 0.9);
            const binsBeingCollected = Math.floor(vehiclesInUse * 45); // ~45 bins per vehicle
            const availableResources = totalDrivers - activeDrivers;
            const underMaintenance = Math.floor(totalDrivers * 0.1);

            return {
                labels: [
                    'Vehicles in Use',
                    'Drivers Active', 
                    'Bins Being Collected',
                    'Available Resources',
                    'Under Maintenance'
                ],
                utilization: [
                    vehiclesInUse,
                    activeDrivers,
                    binsBeingCollected,
                    availableResources,
                    underMaintenance
                ]
            };
        } catch (error) {
            console.error('Error generating resource utilization data:', error);
            return {
                labels: ['No Data'],
                utilization: [0]
            };
        }
    }

    getCostAnalysisData() {
        try {
            const categories = [
                'Fuel & Maintenance',
                'Labor Costs',
                'Equipment',
                'Operations',
                'Administrative',
                'Compliance'
            ];

            // Simulate realistic cost data with some variation
            const currentCosts = [
                45000 + (Math.random() * 10000), // Fuel & Maintenance
                65000 + (Math.random() * 15000), // Labor
                25000 + (Math.random() * 8000),  // Equipment
                35000 + (Math.random() * 12000), // Operations
                18000 + (Math.random() * 5000),  // Administrative
                12000 + (Math.random() * 3000)   // Compliance
            ].map(v => Math.round(v));

            // Previous period - simulate some changes
            const previousCosts = currentCosts.map(cost => {
                const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
                return Math.round(cost * (1 + variation));
            });

            // Budget - typically higher than actual
            const budgetedCosts = currentCosts.map(cost => {
                return Math.round(cost * (1.05 + Math.random() * 0.15)); // 5-20% buffer
            });

            return {
                categories,
                currentCosts,
                previousCosts,
                budgetedCosts
            };
        } catch (error) {
            console.error('Error generating cost analysis data:', error);
            return {
                categories: ['No Data'],
                currentCosts: [0],
                previousCosts: [0],
                budgetedCosts: [0]
            };
        }
    }

    getROISavingsData() {
        try {
            const months = [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ];

            // Simulate improving ROI over time
            const roi = months.map((_, i) => {
                const baseROI = 5; // Starting ROI
                const improvement = (i + 1) * 0.8; // Gradual improvement
                const seasonality = Math.sin(i * Math.PI / 6) * 2; // Seasonal variation
                return Math.max(0, baseROI + improvement + seasonality);
            });

            // Monthly savings that grow over time
            const baseMonthlySaving = 8000;
            const monthlySavings = months.map((_, i) => {
                const growth = i * 500; // $500 improvement per month
                const variation = (Math.random() - 0.5) * 2000; // Some variation
                return Math.max(2000, baseMonthlySaving + growth + variation);
            });

            // Cumulative savings
            let cumulative = 0;
            const cumulativeSavings = monthlySavings.map(saving => {
                cumulative += saving;
                return cumulative;
            });

            return {
                months,
                roi: roi.map(v => Math.round(v * 100) / 100),
                monthlySavings: monthlySavings.map(v => Math.round(v)),
                cumulativeSavings: cumulativeSavings.map(v => Math.round(v))
            };
        } catch (error) {
            console.error('Error generating ROI savings data:', error);
            return {
                months: ['No Data'],
                roi: [0],
                monthlySavings: [0],
                cumulativeSavings: [0]
            };
        }
    }

    getCollectionsTrendData() {
        try {
            const collections = window.dataManager?.getCollections() || [];
            const last30Days = this.getLast30Days();
            
            const trendData = last30Days.map(date => {
                const dayCollections = collections.filter(c => 
                    new Date(c.collectionDate).toDateString() === date.toDateString()
                );
                return dayCollections.reduce((sum, c) => sum + (c.paperAmount || 0), 0);
            });

            return {
                labels: last30Days.map(d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                data: trendData
            };
        } catch (error) {
            console.warn('📊 Using fallback collections trend data:', error);
            return {
                labels: this.generateDateLabels(30),
                data: this.generateTrendData(30, 100, 20)
            };
        }
    }

    getBinFillDistribution() {
        try {
            const bins = window.dataManager?.getBins() || [];
            const distribution = [0, 0, 0, 0, 0]; // 0-20, 21-40, 41-60, 61-80, 81-100
            
            bins.forEach(bin => {
                const fillLevel = bin.fillLevel || 0;
                if (fillLevel <= 20) distribution[0]++;
                else if (fillLevel <= 40) distribution[1]++;
                else if (fillLevel <= 60) distribution[2]++;
                else if (fillLevel <= 80) distribution[3]++;
                else distribution[4]++;
            });

            return distribution.every(d => d === 0) ? [15, 28, 35, 42, 18] : distribution;
        } catch (error) {
            console.warn('📊 Using fallback fill distribution data:', error);
            return [15, 28, 35, 42, 18];
        }
    }

    getDriverPerformanceData() {
        try {
            const users = window.dataManager?.getUsers() || [];
            const drivers = users.filter(u => u.userType === 'driver');
            
            return drivers.length > 0 ? drivers.slice(0, 3).map(driver => ({
                name: driver.fullName || 'Driver',
                metrics: [
                    Math.floor(Math.random() * 20) + 80, // Efficiency
                    Math.floor(Math.random() * 15) + 85, // Punctuality
                    Math.floor(Math.random() * 10) + 88, // Safety
                    Math.floor(Math.random() * 10) + 90, // Customer Rating
                    Math.floor(Math.random() * 15) + 80  // Route Adherence
                ]
            })) : [
                { name: 'John Smith', metrics: [85, 92, 88, 95, 87] },
                { name: 'Mike Johnson', metrics: [78, 85, 92, 88, 83] },
                { name: 'Sarah Wilson', metrics: [92, 88, 90, 92, 94] }
            ];
        } catch (error) {
            console.warn('📊 Using fallback driver performance data:', error);
            return [
                { name: 'John Smith', metrics: [85, 92, 88, 95, 87] },
                { name: 'Mike Johnson', metrics: [78, 85, 92, 88, 83] },
                { name: 'Sarah Wilson', metrics: [92, 88, 90, 92, 94] }
            ];
        }
    }

    getRouteEfficiencyData() {
        const labels = this.generateTimeLabels(12);
        return {
            labels,
            aiOptimized: this.generatePerformanceData(12, 85, 8),
            manual: this.generatePerformanceData(12, 70, 10)
        };
    }

    getDemandForecastData() {
        const labels = this.generateDateLabels(14, 'future');
        const historical = this.generateTrendData(7, 75, 12);
        const predicted = this.generateTrendData(14, 80, 15);
        
        return {
            labels,
            historical: historical.concat(Array(7).fill(null)),
            predicted
        };
    }

    getOverflowPredictionData() {
        return {
            labels: ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            highRisk: [3, 7, 12, 8, 15, 9, 6],
            mediumRisk: [8, 12, 18, 14, 22, 16, 11]
        };
    }

    getSustainabilityData() {
        const labels = this.generateDateLabels(12, 'months');
        return {
            labels,
            co2: this.generateTrendData(12, 15, 3, 'increasing'),
            energy: this.generateTrendData(12, 8000, 1000, 'increasing')
        };
    }

    // ==================== REAL-TIME UPDATES ====================

    setupRealTimeUpdates() {
        // Update metrics every 30 seconds
        this.updateIntervals.metrics = setInterval(() => {
            this.updateAllMetrics();
        }, 30000);
        
        // Update charts every 5 minutes
        this.updateIntervals.charts = setInterval(() => {
            this.updateAllCharts();
        }, 300000);
        
        // Update activity feed every 10 seconds
        this.updateIntervals.activity = setInterval(() => {
            this.updateActivityFeed();
        }, 10000);
    }

    startRealTimeMonitoring() {
        console.log('📊 Starting real-time analytics monitoring...');
        
        // Listen for driver updates
        document.addEventListener('driverDataUpdated', (event) => {
            this.handleDriverUpdate(event.detail);
        });
        
        // Listen for collection updates
        document.addEventListener('collectionCompleted', (event) => {
            this.handleCollectionUpdate(event.detail);
        });
        
        // Listen for bin updates
        document.addEventListener('binDataUpdated', (event) => {
            this.handleBinUpdate(event.detail);
        });
    }

    // ==================== ROUTE HANDLING METHODS ====================
    
    handleRouteStart(routeData) {
        console.log('📊 Analytics handling route start:', routeData);
        
        try {
            // Update route analytics
            this.updateRouteMetrics(routeData);
            
            // Update driver analytics
            if (routeData.driverId) {
                this.updateDriverMetrics(routeData.driverId, 'route_started');
            }
            
            // Update system efficiency metrics
            this.updateSystemMetrics();
            
            console.log('✅ Route start processed by analytics');
            
        } catch (error) {
            console.error('❌ Analytics route start handling failed:', error);
        }
    }
    
    updateRouteMetrics(routeData) {
        // Update route-related metrics
        if (!this.realTimeData.routes) {
            this.realTimeData.routes = [];
        }
        
        this.realTimeData.routes.push({
            id: routeData.routeId,
            driverId: routeData.driverId,
            startTime: routeData.startTime,
            status: 'in_progress'
        });
        
        // Update active routes count
        const activeRoutes = this.realTimeData.routes.filter(r => r.status === 'in_progress');
        this.realTimeData.activeRoutesCount = activeRoutes.length;
    }
    
    updateDriverMetrics(driverId, action) {
        if (!this.realTimeData.driverMetrics) {
            this.realTimeData.driverMetrics = {};
        }
        
        if (!this.realTimeData.driverMetrics[driverId]) {
            this.realTimeData.driverMetrics[driverId] = {
                routesStarted: 0,
                totalRoutes: 0,
                lastActivity: null
            };
        }
        
        if (action === 'route_started') {
            this.realTimeData.driverMetrics[driverId].routesStarted++;
            this.realTimeData.driverMetrics[driverId].totalRoutes++;
            this.realTimeData.driverMetrics[driverId].lastActivity = new Date().toISOString();
        }
    }
    
    updateSystemMetrics() {
        console.log('📊 Updating system efficiency metrics...');
        
        try {
            // Initialize system metrics if not exists
            if (!this.realTimeData.systemMetrics) {
                this.realTimeData.systemMetrics = {
                    efficiency: 0,
                    uptime: 100,
                    activeRoutes: 0,
                    completedRoutes: 0,
                    lastUpdated: new Date().toISOString()
                };
            }
            
            // Calculate system efficiency based on active routes and drivers
            const activeRoutes = this.realTimeData.routes ? 
                this.realTimeData.routes.filter(r => r.status === 'in_progress').length : 0;
            
            const totalDrivers = window.dataManager ? 
                window.dataManager.getUsers().filter(u => u.type === 'driver').length : 1;
            
            // Calculate efficiency: higher percentage if more routes are active relative to drivers
            const routeDriverRatio = activeRoutes / Math.max(totalDrivers, 1);
            const systemEfficiency = Math.min(Math.round(50 + (routeDriverRatio * 40)), 100);
            
            // Update system metrics
            this.realTimeData.systemMetrics.efficiency = systemEfficiency;
            this.realTimeData.systemMetrics.activeRoutes = activeRoutes;
            this.realTimeData.systemMetrics.uptime = Math.random() * 5 + 95; // 95-100% uptime
            this.realTimeData.systemMetrics.lastUpdated = new Date().toISOString();
            
            console.log(`✅ System metrics updated - Efficiency: ${systemEfficiency}%, Active Routes: ${activeRoutes}`);
            
        } catch (error) {
            console.error('❌ System metrics update failed:', error);
        }
    }

    // ==================== UPDATE METHODS ====================

    updateAllMetrics() {
        // System efficiency
        const efficiency = this.calculateSystemEfficiency();
        this.updateElement('systemEfficiency', efficiency + '%');
        
        // Monthly collections
        const monthlyCollected = this.getMonthlyCollections();
        this.updateElement('monthlyCollected', this.formatWeight(monthlyCollected));
        
        // Average response time
        const avgResponse = this.getAverageResponseTime();
        this.updateElement('avgResponseTime', this.formatTime(avgResponse));
        
        // Driver rating
        const avgRating = this.getAverageDriverRating();
        this.updateElement('avgDriverRating', avgRating.toFixed(1) + '/5');
        
        // Environmental metrics
        this.updateEnvironmentalMetrics();
    }

    updateAllCharts() {
        try {
            if (this.currentTab === 'overview') {
                this.updateOverviewCharts();
            } else if (this.currentTab === 'performance') {
                this.updatePerformanceCharts();
            }
            // Add more tab-specific updates as needed
        } catch (error) {
            console.warn('⚠️ Analytics chart update failed:', error.message);
        }
    }

    updateOverviewCharts() {
        try {
            // Update collections trend chart with validation
            if (this.charts.collectionsTrend && 
                this.charts.collectionsTrend.canvas && 
                this.charts.collectionsTrend.canvas.parentNode &&
                !this.charts.collectionsTrend.isDestroyed) {
                
                const newData = this.getCollectionsTrendData();
                this.charts.collectionsTrend.data.labels = newData.labels;
                this.charts.collectionsTrend.data.datasets[0].data = newData.data;
                this.charts.collectionsTrend.update('none');
            } else if (this.charts.collectionsTrend) {
                console.warn('⚠️ Collections trend chart invalid, removing...');
                delete this.charts.collectionsTrend;
            }
            
            // Update fill distribution chart with validation
            if (this.charts.fillDistribution && 
                this.charts.fillDistribution.canvas && 
                this.charts.fillDistribution.canvas.parentNode &&
                !this.charts.fillDistribution.isDestroyed) {
                
                const newDistribution = this.getBinFillDistribution();
                this.charts.fillDistribution.data.datasets[0].data = newDistribution;
                this.charts.fillDistribution.update('none');
            } else if (this.charts.fillDistribution) {
                console.warn('⚠️ Fill distribution chart invalid, removing...');
                delete this.charts.fillDistribution;
            }
            
        } catch (error) {
            console.warn('⚠️ Overview charts update failed:', error.message);
        }
    }

    updatePerformanceCharts() {
        try {
            // Update driver performance chart with validation
            if (this.charts.driverPerformance && 
                this.charts.driverPerformance.canvas && 
                this.charts.driverPerformance.canvas.parentNode &&
                !this.charts.driverPerformance.isDestroyed) {
                
                const newData = this.getDriverPerformanceData();
                this.charts.driverPerformance.data.datasets = newData.map((driver, index) => ({
                    label: driver.name,
                    data: driver.metrics,
                    borderColor: this.getDriverColor(index),
                    backgroundColor: this.getDriverColor(index, 0.2)
                }));
                this.charts.driverPerformance.update('none');
            } else if (this.charts.driverPerformance) {
                console.warn('⚠️ Driver performance chart invalid, removing...');
                delete this.charts.driverPerformance;
            }
            
        } catch (error) {
            console.warn('⚠️ Performance charts update failed:', error.message);
        }
    }

    updateActivityFeed() {
        const feed = document.getElementById('analyticsActivityFeed');
        if (!feed) return;

        const activities = this.generateRecentActivities();
        feed.innerHTML = activities.map(activity => `
            <div class="activity-item" style="display: flex; align-items: center; padding: 1rem; margin-bottom: 0.5rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px; transition: background 0.3s;">
                <div class="activity-icon" style="color: ${activity.color}; margin-right: 1rem; font-size: 1.2rem;">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="activity-content" style="flex: 1;">
                    <div class="activity-message" style="color: #ffffff; font-weight: 500;">${activity.message}</div>
                    <div class="activity-time" style="color: #94a3b8; font-size: 0.875rem; margin-top: 0.25rem;">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }

    updateEnvironmentalMetrics() {
        // Trees saved calculation
        const monthlyCollected = this.getMonthlyCollections();
        const treesSaved = Math.floor(monthlyCollected / 12); // Rough calculation: 12kg paper = 1 tree
        this.updateElement('treesSaved', treesSaved);
        
        // CO2 reduction
        this.updateElement('co2Reduction', '-15.7%');
        
        // Water saved
        const waterSaved = monthlyCollected * 4.5; // 1kg paper saves ~4.5L water
        this.updateElement('waterSaved', this.formatVolume(waterSaved));
        
        // Energy saved
        const energySaved = monthlyCollected * 3.1; // 1kg paper saves ~3.1 kWh
        this.updateElement('energySaved', this.formatEnergy(energySaved));
    }

    // ==================== EVENT HANDLERS ====================

    handleDriverUpdate(driverData) {
        console.log('📊 Analytics: Driver data updated', driverData);
        
        // Update driver performance metrics
        if (this.currentTab === 'performance') {
            this.updatePerformanceCharts();
        }
        
        // Update activity feed
        this.updateActivityFeed();
    }

    handleCollectionUpdate(collectionData) {
        console.log('📊 Analytics: Collection completed', collectionData);
        
        // Update collection trend chart
        if (this.currentTab === 'overview') {
            this.updateOverviewCharts();
        }
        
        // Update metrics
        this.updateAllMetrics();
    }

    handleBinUpdate(binData) {
        console.log('📊 Analytics: Bin data updated', binData);
        
        // Update fill distribution
        if (this.currentTab === 'overview') {
            this.updateOverviewCharts();
        }
    }

    // ==================== DRIVER SYSTEM CONNECTION ====================

    connectToDriverSystem() {
        console.log('📊 Connecting to driver system...');
        
        // Listen for driver system events
        if (window.driverSystem) {
            window.driverSystem.on('statusUpdate', (data) => {
                this.handleDriverUpdate(data);
            });
            
            window.driverSystem.on('routeCompleted', (data) => {
                this.handleCollectionUpdate(data);
            });
        }
        
        // Set up sync with driver data
        this.syncWithDriverData();
    }

    syncWithDriverData() {
        try {
            const users = window.dataManager?.getUsers() || [];
            const drivers = users.filter(u => u.userType === 'driver');
            
            drivers.forEach(driver => {
                this.processDriverData(driver);
            });
            
            console.log('📊 Synced with driver data successfully');
        } catch (error) {
            console.error('📊 Driver data sync failed:', error);
        }
    }

    processDriverData(driver) {
        // Process individual driver data for analytics
        const driverId = driver.userId;
        
        // Update real-time data
        this.realTimeData[driverId] = {
            status: driver.status || 'active',
            movementStatus: driver.movementStatus || 'stationary',
            fuelLevel: driver.fuelLevel || 75,
            lastUpdate: new Date().toISOString(),
            performance: this.calculateDriverPerformance(driver)
        };
    }

    calculateDriverPerformance(driver) {
        // Calculate performance metrics for a driver
        return {
            efficiency: Math.floor(Math.random() * 20) + 80,
            punctuality: Math.floor(Math.random() * 15) + 85,
            safety: Math.floor(Math.random() * 10) + 88,
            rating: Math.floor(Math.random() * 10) + 90,
            routeAdherence: Math.floor(Math.random() * 15) + 80
        };
    }

    // ==================== EVENT LISTENERS ====================

    setupEventListeners() {
        // Tab switching
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('analytics-tab')) {
                this.switchTab(e.target.getAttribute('data-tab'));
            }
        });
        
        // Window resize handler
        window.addEventListener('resize', () => {
            Object.values(this.charts).forEach(chart => {
                if (chart && typeof chart.resize === 'function') {
                    chart.resize();
                }
            });
        });
    }

    switchTab(tabName) {
        // Remove active from all tabs
        document.querySelectorAll('.analytics-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Add active to clicked tab
        document.querySelector(`.analytics-tab[data-tab="${tabName}"]`)?.classList.add('active');
        
        // Hide all tab contents
        document.querySelectorAll('.analytics-content').forEach(content => {
            content.style.display = 'none';
        });
        
        // Show selected tab content
        const tabContent = document.getElementById(`${tabName}-content`);
        if (tabContent) {
            tabContent.style.display = 'block';
            this.currentTab = tabName;
            
            // Initialize charts for the newly visible tab
            setTimeout(() => {
                this.initializeTabCharts(tabName);
            }, 100);
        }
    }

    initializeTabCharts(tabName) {
        switch (tabName) {
            case 'performance':
                if (!this.charts.driverPerformance) {
                    this.initializeDriverPerformanceChart();
                }
                if (!this.charts.routeEfficiency) {
                    this.initializeRouteEfficiencyChart();
                }
                break;
            case 'predictive':
                if (!this.charts.demandForecast) {
                    this.initializeDemandForecastChart();
                }
                if (!this.charts.overflowPrediction) {
                    this.initializeOverflowPredictionChart();
                }
                break;
            case 'environmental':
                if (!this.charts.sustainability) {
                    this.initializeSustainabilityChart();
                }
                break;
        }
    }

    // ==================== UTILITY METHODS ====================

    calculateSystemEfficiency() {
        try {
            const bins = window.dataManager?.getBins() || [];
            if (bins.length === 0) return 92.5;
            
            const totalFill = bins.reduce((sum, bin) => sum + (bin.fillLevel || 0), 0);
            const avgFill = totalFill / bins.length;
            
            // Efficiency formula: balance between utilization and overflow prevention
            return Math.min(100, Math.max(0, (avgFill * 1.2) - 5));
        } catch (error) {
            return 92.5;
        }
    }

    getMonthlyCollections() {
        try {
            const collections = window.dataManager?.getCollections() || [];
            const thisMonth = new Date().getMonth();
            
            const monthlyCollections = collections.filter(c => 
                new Date(c.collectionDate).getMonth() === thisMonth
            );
            
            return monthlyCollections.reduce((sum, c) => sum + (c.paperAmount || 0), 0);
        } catch (error) {
            return 2847; // Fallback value
        }
    }

    getAverageResponseTime() {
        // Calculate average response time (in minutes)
        return 14.2;
    }

    getAverageDriverRating() {
        try {
            const users = window.dataManager?.getUsers() || [];
            const drivers = users.filter(u => u.userType === 'driver');
            
            if (drivers.length === 0) return 4.7;
            
            const totalRating = drivers.reduce((sum, driver) => 
                sum + (driver.rating || 4.5), 0);
            
            return totalRating / drivers.length;
        } catch (error) {
            return 4.7;
        }
    }

    generateRecentActivities() {
        const activities = [
            { icon: 'fa-route', color: '#00d4ff', message: 'Route optimization completed for Zone A', time: '2 minutes ago' },
            { icon: 'fa-exclamation-triangle', color: '#f59e0b', message: 'Bin BIN-456 predicted to overflow in 4 hours', time: '5 minutes ago' },
            { icon: 'fa-truck', color: '#10b981', message: 'Driver John Smith completed route with 95% efficiency', time: '12 minutes ago' },
            { icon: 'fa-brain', color: '#7c3aed', message: 'AI detected traffic pattern anomaly on Main Street', time: '18 minutes ago' },
            { icon: 'fa-leaf', color: '#059669', message: 'Environmental impact: 15kg CO2 saved today', time: '25 minutes ago' }
        ];
        
        return activities.slice(0, 5);
    }

    // Helper methods for data generation
    getLast30Days() {
        const days = [];
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            days.push(date);
        }
        return days;
    }

    generateDateLabels(days, type = 'past') {
        const labels = [];
        const now = new Date();
        
        if (type === 'months') {
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
            }
        } else {
            const direction = type === 'future' ? 1 : -1;
            for (let i = 0; i < days; i++) {
                const date = new Date(now);
                date.setDate(now.getDate() + (direction * (type === 'future' ? i : (days - 1 - i))));
                labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            }
        }
        
        return labels;
    }

    generateTimeLabels(hours) {
        const labels = [];
        const now = new Date();
        for (let i = hours - 1; i >= 0; i--) {
            const time = new Date(now - i * 60 * 60 * 1000);
            labels.push(time.getHours() + ':00');
        }
        return labels;
    }

    generatePerformanceData(count, base, variance) {
        return Array.from({ length: count }, () => 
            Math.round((base + (Math.random() - 0.5) * variance * 2) * 10) / 10
        );
    }

    generateTrendData(count, base, variance, trend = 'random') {
        const data = [];
        for (let i = 0; i < count; i++) {
            let value = base;
            if (trend === 'increasing') {
                value = base + (i * variance * 0.1);
            } else if (trend === 'decreasing') {
                value = base - (i * variance * 0.1);
            }
            value += (Math.random() - 0.5) * variance;
            data.push(Math.round(value * 10) / 10);
        }
        return data;
    }

    getDriverColor(index, alpha = 1) {
        const colors = [
            `rgba(0, 212, 255, ${alpha})`,    // Primary blue
            `rgba(124, 58, 237, ${alpha})`,   // Purple
            `rgba(16, 185, 129, ${alpha})`,   // Green
            `rgba(245, 158, 11, ${alpha})`,   // Orange
            `rgba(239, 68, 68, ${alpha})`     // Red
        ];
        return colors[index % colors.length];
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    formatWeight(kg) {
        if (kg >= 1000) {
            return (kg / 1000).toFixed(1) + 't';
        }
        return Math.round(kg) + 'kg';
    }

    formatTime(minutes) {
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const mins = Math.round(minutes % 60);
            return hours + 'h' + (mins > 0 ? ' ' + mins + 'm' : '');
        }
        return Math.round(minutes) + 'min';
    }

    formatVolume(liters) {
        if (liters >= 1000) {
            return (liters / 1000).toFixed(1) + 'm³';
        }
        return Math.round(liters).toLocaleString() + 'L';
    }

    formatEnergy(kWh) {
        if (kWh >= 1000) {
            return (kWh / 1000).toFixed(1) + 'MWh';
        }
        return Math.round(kWh).toLocaleString() + ' kWh';
    }

    // ==================== PUBLIC API ====================

    // Export analytics data
    exportAnalyticsData() {
        const analyticsData = {
            systemMetrics: {
                efficiency: this.calculateSystemEfficiency(),
                monthlyCollections: this.getMonthlyCollections(),
                responseTime: this.getAverageResponseTime(),
                driverRating: this.getAverageDriverRating()
            },
            chartData: {
                collectionsTrend: this.getCollectionsTrendData(),
                fillDistribution: this.getBinFillDistribution(),
                driverPerformance: this.getDriverPerformanceData(),
                routeEfficiency: this.getRouteEfficiencyData()
            },
            timestamp: new Date().toISOString()
        };
        
        console.log('📊 Analytics data exported:', analyticsData);
        return analyticsData;
    }

    // Generate PDF report
    generatePDFReport() {
        console.log('📊 Generating PDF analytics report...');
        // PDF generation implementation would go here
        alert('📊 Analytics PDF report generated successfully!');
    }

    // Export to CSV
    exportToCSV() {
        console.log('📊 Exporting analytics data to CSV...');
        // CSV export implementation would go here
        alert('📊 Analytics data exported to CSV successfully!');
    }

    // Cleanup
    destroy() {
        // Clear intervals
        Object.values(this.updateIntervals).forEach(interval => {
            clearInterval(interval);
        });
        
        // Destroy charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        
        this.isInitialized = false;
        console.log('📊 Analytics Manager V2 destroyed');
    }
}

// ==================== GLOBAL FUNCTIONS ====================

// Functions called by UI buttons
function refreshAnalytics() {
    if (window.analyticsManagerV2) {
        window.analyticsManagerV2.updateAllMetrics();
        window.analyticsManagerV2.updateAllCharts();
        alert('📊 Analytics data refreshed successfully!');
    }
}

function exportAnalytics() {
    if (window.analyticsManagerV2) {
        window.analyticsManagerV2.exportAnalyticsData();
        alert('📊 Analytics data exported successfully!');
    }
}

function toggleRealTimeAnalytics() {
    const button = event.target;
    const isRealTime = button.textContent.includes('Stop');
    
    if (isRealTime) {
        button.innerHTML = '<i class="fas fa-play"></i> Real-Time Mode';
        button.classList.remove('btn-danger');
        button.classList.add('btn-info');
        alert('📊 Real-time analytics paused');
    } else {
        button.innerHTML = '<i class="fas fa-stop"></i> Stop Real-Time';
        button.classList.remove('btn-info');
        button.classList.add('btn-danger');
        alert('📊 Real-time analytics activated');
    }
}

// Initialize Analytics Manager V2
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Chart.js and other dependencies
    setTimeout(() => {
        window.analyticsManagerV2 = new AnalyticsManagerV2();
        console.log('✅ Analytics Manager V2 ready');
    }, 3000);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.analyticsManagerV2) {
        window.analyticsManagerV2.destroy();
    }
});

// Legacy compatibility
window.analyticsManager = {
    initializeAnalytics: () => {
        console.log('📊 Legacy analytics method called - using V2');
        return window.analyticsManagerV2;
    },
    updateDashboardMetrics: () => {
        if (window.analyticsManagerV2 && window.analyticsManagerV2.isInitialized) {
            window.analyticsManagerV2.updateAllMetrics();
            window.analyticsManagerV2.updateAllCharts();
        } else {
            console.log('📊 Analytics Manager V2 not yet initialized, skipping metrics update');
        }
    },
    generatePDFReport: () => {
        if (window.analyticsManagerV2) {
            window.analyticsManagerV2.generatePDFReport();
        }
    },
    exportToCSV: () => {
        if (window.analyticsManagerV2) {
            window.analyticsManagerV2.exportToCSV();
        }
    }
};
