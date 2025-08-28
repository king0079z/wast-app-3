// ai-chart-visualizer.js - Advanced AI-Powered Chart Visualization System
// Real-time AI charts, predictive visualizations, and intelligent data presentation

class AIChartVisualizer {
    constructor() {
        this.charts = new Map();
        this.chartConfigs = new Map();
        this.animationCallbacks = new Map();
        this.animationIntervals = new Map();
        this.isInitialized = false;
        
        console.log('📊🧠 Initializing AI Chart Visualizer...');
        this.initialize();
    }

    async initialize() {
        try {
            // Wait for Chart.js
            await this.waitForChartJS();
            
            // Setup Chart.js defaults
            this.setupChartDefaults();
            
            // Initialize AI-powered visualizations
            this.initializeAIVisualizations();
            
            // Set up real-time updates
            this.setupRealTimeUpdates();
            
            // Set up responsive behavior
            this.setupResponsiveBehavior();
            
            this.isInitialized = true;
            console.log('✅ AI Chart Visualizer initialized successfully');
            
        } catch (error) {
            console.error('❌ AI Chart Visualizer initialization failed:', error);
        }
    }

    async waitForChartJS() {
        const maxWait = 15000; // Increased wait time for slow connections
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWait) {
            if (window.Chart && typeof window.Chart === 'function') {
                console.log('✅ Chart.js is ready');
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Check for fallback Chart.js implementation
        if (window.Chart && typeof window.Chart === 'object') {
            console.log('✅ Chart.js fallback is ready');
            return;
        }
        
        console.warn('⚠️ Chart.js failed to load, creating emergency fallback...');
        this.createEmergencyChartFallback();
    }

    createEmergencyChartFallback() {
        // Create the most basic Chart fallback if everything else fails
        window.Chart = function(ctx, config) {
            this.ctx = ctx;
            this.config = config;
            this.data = config.data || {};
            this.options = config.options || {};
            
            // Draw simple fallback visualization
            if (ctx && ctx.getContext) {
                const canvas = ctx.getContext('2d');
                const width = ctx.width || ctx.clientWidth || 400;
                const height = ctx.height || ctx.clientHeight || 200;
                
                // Clear canvas
                canvas.clearRect(0, 0, width, height);
                
                // Draw background
                canvas.fillStyle = '#f5f5f5';
                canvas.fillRect(0, 0, width, height);
                
                // Draw border
                canvas.strokeStyle = '#ddd';
                canvas.strokeRect(0, 0, width, height);
                
                // Draw title
                canvas.fillStyle = '#333';
                canvas.font = 'bold 16px Arial';
                canvas.textAlign = 'center';
                const title = config.options?.plugins?.title?.text || `${config.type || 'Chart'} Data`;
                canvas.fillText(title, width/2, 30);
                
                // Draw simple data visualization
                canvas.fillStyle = '#2196F3';
                canvas.font = '12px Arial';
                canvas.fillText('📊 Data Visualization', width/2, height/2);
                canvas.fillText('(External libraries unavailable)', width/2, height/2 + 20);
            }
            
            return {
                update: function(mode) { console.log('Chart update requested:', mode); },
                destroy: function() { console.log('Chart destroy requested'); },
                resize: function() { console.log('Chart resize requested'); },
                data: this.data,
                options: this.options,
                canvas: ctx
            };
        };
        
        console.log('📊 Emergency Chart.js fallback created');
    }

    setupChartDefaults() {
        if (!window.Chart) return;

        // Dark theme optimized defaults
        Chart.defaults.color = '#ffffff';
        Chart.defaults.borderColor = 'rgba(148, 163, 184, 0.1)';
        Chart.defaults.backgroundColor = 'rgba(0, 212, 255, 0.1)';
        Chart.defaults.font.family = "'Inter', 'Segoe UI', sans-serif";
        Chart.defaults.font.weight = '500';
        Chart.defaults.plugins.legend.labels.usePointStyle = true;
        Chart.defaults.plugins.legend.labels.padding = 20;
        Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        Chart.defaults.plugins.tooltip.cornerRadius = 8;
        Chart.defaults.plugins.tooltip.titleColor = '#ffffff';
        Chart.defaults.plugins.tooltip.bodyColor = '#ffffff';
        Chart.defaults.plugins.tooltip.borderColor = 'rgba(0, 212, 255, 0.3)';
        Chart.defaults.plugins.tooltip.borderWidth = 1;
        
        // Animation defaults
        Chart.defaults.animation.duration = 1000;
        Chart.defaults.animation.easing = 'easeOutQuart';
        
        console.log('✅ Chart.js defaults configured for AI visualization');
    }

    initializeAIVisualizations() {
        // Initialize all AI-powered charts
        this.initializeAIPerformanceChart();
        this.initializePredictiveModelAccuracy();
        this.initializeRouteOptimizationMetrics();
        this.initializeDriverPerformanceRadar();
        this.initializeBinFillPrediction();
        this.initializeEnvironmentalImpact();
        this.initializeCostBenefitAnalysis();
        this.initializeSystemHealthMonitor();
        this.initializeAITrainingProgress();
    }

    // ==================== AI PERFORMANCE CHART ====================

    initializeAIPerformanceChart() {
        const ctx = document.getElementById('ai-performance-chart');
        if (!ctx) return;

        // Destroy existing chart if it exists - more aggressive cleanup
        const existingChart = this.charts.get('ai-performance');
        if (existingChart) {
            existingChart.destroy();
            this.charts.delete('ai-performance');
        }
        
        // Also check for any existing Chart instances on this canvas
        const existingChartInstance = Chart.getChart(ctx);
        if (existingChartInstance) {
            existingChartInstance.destroy();
        }

        const config = {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(24),
                datasets: [
                    {
                        label: '🚀 Route Optimization',
                        data: this.generateAIPerformanceData(24, 92, 3, 'improving'),
                        borderColor: '#00d4ff',
                        backgroundColor: 'rgba(0, 212, 255, 0.1)',
                        pointBackgroundColor: '#00d4ff',
                        pointBorderColor: '#ffffff',
                        pointHoverRadius: 8,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: '🔮 Predictive Analytics',
                        data: this.generateAIPerformanceData(24, 94, 2, 'stable'),
                        borderColor: '#7c3aed',
                        backgroundColor: 'rgba(124, 58, 237, 0.1)',
                        pointBackgroundColor: '#7c3aed',
                        pointBorderColor: '#ffffff',
                        pointHoverRadius: 8,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: '🧠 Driver Assistant',
                        data: this.generateAIPerformanceData(24, 89, 4, 'improving'),
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        pointBackgroundColor: '#10b981',
                        pointBorderColor: '#ffffff',
                        pointHoverRadius: 8,
                        tension: 0.4,
                        fill: true
                    }
                ]
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
                        position: 'top',
                        labels: {
                            color: '#ffffff',
                            font: { size: 14, weight: 'bold' },
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
                            },
                            afterBody: function() {
                                return ['📊 Real-time AI performance metrics', '🎯 Target: >90% accuracy'];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { 
                            color: '#94a3b8',
                            font: { weight: 'bold' }
                        },
                        grid: { 
                            color: 'rgba(148, 163, 184, 0.1)',
                            drawBorder: false
                        },
                        title: {
                            display: true,
                            text: 'Time (24h)',
                            color: '#ffffff',
                            font: { size: 14, weight: 'bold' }
                        }
                    },
                    y: {
                        min: 80,
                        max: 100,
                        ticks: { 
                            color: '#94a3b8',
                            font: { weight: 'bold' },
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: { 
                            color: 'rgba(148, 163, 184, 0.1)',
                            drawBorder: false
                        },
                        title: {
                            display: true,
                            text: 'AI Performance (%)',
                            color: '#ffffff',
                            font: { size: 14, weight: 'bold' }
                        }
                    }
                }
            }
        };

        const chart = new Chart(ctx, config);
        this.charts.set('ai-performance', chart);
        this.chartConfigs.set('ai-performance', config);
        
        // Set up real-time updates
        this.setupChartAnimation('ai-performance', this.updateAIPerformanceData.bind(this));
    }

    // ==================== PREDICTIVE MODEL ACCURACY ====================

    initializePredictiveModelAccuracy() {
        const ctx = document.getElementById('ml-accuracy-chart');
        if (!ctx) return;

        // Destroy existing chart if it exists - more aggressive cleanup
        const existingChart = this.charts.get('ml-accuracy');
        if (existingChart) {
            existingChart.destroy();
            this.charts.delete('ml-accuracy');
        }
        
        // Also check for any existing Chart instances on this canvas
        const existingChartInstance = Chart.getChart(ctx);
        if (existingChartInstance) {
            existingChartInstance.destroy();
        }

        const config = {
            type: 'doughnut',
            data: {
                labels: ['🚀 Route Optimization', '🔮 Demand Prediction', '⚠️ Anomaly Detection', '👨‍💼 Driver Analysis', '📊 Waste Forecasting'],
                datasets: [{
                    data: [96.2, 94.7, 97.8, 91.3, 93.9],
                    backgroundColor: [
                        '#00d4ff',
                        '#7c3aed',
                        '#f59e0b',
                        '#10b981',
                        '#ef4444'
                    ],
                    borderWidth: 3,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    hoverOffset: 15,
                    cutout: '60%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#ffffff',
                            font: { size: 13, weight: 'bold' },
                            padding: 20,
                            usePointStyle: true,
                            generateLabels: function(chart) {
                                const data = chart.data;
                                return data.labels.map((label, i) => ({
                                    text: `${label} ${data.datasets[0].data[i]}%`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    strokeStyle: data.datasets[0].backgroundColor[i],
                                    pointStyle: 'circle',
                                    hidden: false,
                                    index: i
                                }));
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `Accuracy: ${context.parsed}% (${percentage}% of total)`;
                            },
                            afterBody: function() {
                                return ['🎯 Machine Learning Model Performance', '📈 Continuously improving'];
                            }
                        }
                    }
                }
            }
        };

        // Add center text plugin
        const centerTextPlugin = {
            id: 'centerText',
            afterDraw: function(chart) {
                const ctx = chart.ctx;
                ctx.save();
                
                const centerX = chart.getDatasetMeta(0).data[0].x;
                const centerY = chart.getDatasetMeta(0).data[0].y;
                
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 24px Inter';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('94.8%', centerX, centerY - 10);
                
                ctx.font = 'bold 14px Inter';
                ctx.fillStyle = '#94a3b8';
                ctx.fillText('Avg Accuracy', centerX, centerY + 15);
                
                ctx.restore();
            }
        };

        Chart.register(centerTextPlugin);
        
        const chart = new Chart(ctx, config);
        this.charts.set('ml-accuracy', chart);
        this.chartConfigs.set('ml-accuracy', config);
    }

    // ==================== ROUTE OPTIMIZATION METRICS ====================

    initializeRouteOptimizationMetrics() {
        const ctx = document.getElementById('route-optimization-metrics');
        if (!ctx) return;

        // Destroy existing chart if it exists - more aggressive cleanup
        const existingChart = this.charts.get('route-optimization');
        if (existingChart) {
            existingChart.destroy();
            this.charts.delete('route-optimization');
        }
        
        // Also check for any existing Chart instances on this canvas
        const existingChartInstance = Chart.getChart(ctx);
        if (existingChartInstance) {
            existingChartInstance.destroy();
        }

        const config = {
            type: 'bar',
            data: {
                labels: ['Distance Saved', 'Time Saved', 'Fuel Saved', 'Efficiency Gain', 'Cost Reduction'],
                datasets: [
                    {
                        label: '📈 This Week',
                        data: [18.5, 22.1, 15.8, 28.3, 19.7],
                        backgroundColor: 'rgba(16, 185, 129, 0.8)',
                        borderColor: '#10b981',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                    },
                    {
                        label: '📊 Last Week',
                        data: [14.2, 18.9, 12.1, 23.7, 16.4],
                        backgroundColor: 'rgba(0, 212, 255, 0.6)',
                        borderColor: '#00d4ff',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff',
                            font: { size: 14, weight: 'bold' },
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y}% improvement`;
                            },
                            afterBody: function() {
                                return ['🚀 AI-powered route optimization', '📊 Week-over-week comparison'];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { 
                            color: '#94a3b8',
                            font: { weight: 'bold' }
                        },
                        grid: { display: false }
                    },
                    y: {
                        beginAtZero: true,
                        max: 35,
                        ticks: { 
                            color: '#94a3b8',
                            font: { weight: 'bold' },
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: { 
                            color: 'rgba(148, 163, 184, 0.1)',
                            drawBorder: false
                        }
                    }
                }
            }
        };

        const chart = new Chart(ctx, config);
        this.charts.set('route-optimization', chart);
        this.chartConfigs.set('route-optimization', config);
    }

    // ==================== DRIVER PERFORMANCE RADAR ====================

    initializeDriverPerformanceRadar() {
        const ctx = document.getElementById('driver-performance-radar');
        if (!ctx) return;

        // Destroy existing chart if it exists - more aggressive cleanup
        const existingChart = this.charts.get('driver-performance');
        if (existingChart) {
            existingChart.destroy();
            this.charts.delete('driver-performance');
        }
        
        // Also check for any existing Chart instances on this canvas
        const existingChartInstance = Chart.getChart(ctx);
        if (existingChartInstance) {
            existingChartInstance.destroy();
        }

        const config = {
            type: 'radar',
            data: {
                labels: ['⚡ Efficiency', '⏰ Punctuality', '🛡️ Safety', '⭐ Rating', '📍 Route Adherence', '⛽ Fuel Economy'],
                datasets: [
                    {
                        label: '👨‍💼 John Smith (AI-Assisted)',
                        data: [92, 88, 95, 91, 87, 94],
                        borderColor: '#00d4ff',
                        backgroundColor: 'rgba(0, 212, 255, 0.2)',
                        pointBackgroundColor: '#00d4ff',
                        pointBorderColor: '#ffffff',
                        pointHoverBackgroundColor: '#ffffff',
                        pointHoverBorderColor: '#00d4ff',
                        borderWidth: 3,
                        pointRadius: 6
                    },
                    {
                        label: '👨‍💼 Mike Johnson (Standard)',
                        data: [78, 82, 88, 85, 79, 81],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        pointBackgroundColor: '#ef4444',
                        pointBorderColor: '#ffffff',
                        pointHoverBackgroundColor: '#ffffff',
                        pointHoverBorderColor: '#ef4444',
                        borderWidth: 3,
                        pointRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff',
                            font: { size: 14, weight: 'bold' },
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.r}%`;
                            }
                        }
                    }
                },
                scales: {
                    r: {
                        min: 0,
                        max: 100,
                        ticks: { 
                            color: '#94a3b8',
                            font: { weight: 'bold' },
                            backdropColor: 'transparent',
                            stepSize: 20
                        },
                        grid: { 
                            color: 'rgba(148, 163, 184, 0.3)',
                            circular: true
                        },
                        pointLabels: { 
                            color: '#ffffff',
                            font: { size: 12, weight: 'bold' }
                        }
                    }
                }
            }
        };

        const chart = new Chart(ctx, config);
        this.charts.set('driver-performance-radar', chart);
        this.chartConfigs.set('driver-performance-radar', config);
    }

    // ==================== BIN FILL PREDICTION ====================

    initializeBinFillPrediction() {
        const ctx = document.getElementById('bin-fill-prediction');
        if (!ctx) return;

        // Destroy existing chart if it exists - more aggressive cleanup
        const existingChart = this.charts.get('bin-fill-prediction');
        if (existingChart) {
            existingChart.destroy();
            this.charts.delete('bin-fill-prediction');
        }
        
        // Also check for any existing Chart instances on this canvas
        const existingChartInstance = Chart.getChart(ctx);
        if (existingChartInstance) {
            existingChartInstance.destroy();
        }

        const config = {
            type: 'line',
            data: {
                labels: this.generateFutureDateLabels(7),
                datasets: [
                    {
                        label: '🤖 AI Prediction',
                        data: [45, 52, 61, 73, 84, 92, 97],
                        borderColor: '#7c3aed',
                        backgroundColor: 'rgba(124, 58, 237, 0.1)',
                        borderDash: [5, 5],
                        tension: 0.4,
                        pointBackgroundColor: '#7c3aed',
                        pointBorderColor: '#ffffff',
                        pointRadius: 6,
                        fill: true
                    },
                    {
                        label: '📊 Historical Pattern',
                        data: [42, 48, 58, 69, 79, 88, 94],
                        borderColor: '#00d4ff',
                        backgroundColor: 'rgba(0, 212, 255, 0.1)',
                        tension: 0.4,
                        pointBackgroundColor: '#00d4ff',
                        pointBorderColor: '#ffffff',
                        pointRadius: 4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff',
                            font: { size: 14, weight: 'bold' },
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y}% full`;
                            },
                            afterBody: function(tooltipItems) {
                                const value = tooltipItems[0].parsed.y;
                                if (value > 90) return ['🚨 Overflow Risk: HIGH'];
                                if (value > 75) return ['⚠️ Overflow Risk: MEDIUM'];
                                return ['✅ Overflow Risk: LOW'];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { 
                            color: '#94a3b8',
                            font: { weight: 'bold' }
                        },
                        grid: { 
                            color: 'rgba(148, 163, 184, 0.1)',
                            drawBorder: false
                        }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        ticks: { 
                            color: '#94a3b8',
                            font: { weight: 'bold' },
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: { 
                            color: 'rgba(148, 163, 184, 0.1)',
                            drawBorder: false
                        }
                    }
                }
            }
        };

        // Add threshold lines plugin
        const thresholdPlugin = {
            id: 'thresholdLines',
            afterDraw: function(chart) {
                const ctx = chart.ctx;
                const yAxis = chart.scales.y;
                
                // High risk line at 90%
                const y90 = yAxis.getPixelForValue(90);
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
                ctx.lineWidth = 2;
                ctx.setLineDash([10, 5]);
                ctx.beginPath();
                ctx.moveTo(chart.chartArea.left, y90);
                ctx.lineTo(chart.chartArea.right, y90);
                ctx.stroke();
                
                // Medium risk line at 75%
                const y75 = yAxis.getPixelForValue(75);
                ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
                ctx.beginPath();
                ctx.moveTo(chart.chartArea.left, y75);
                ctx.lineTo(chart.chartArea.right, y75);
                ctx.stroke();
                
                ctx.setLineDash([]);
            }
        };

        Chart.register(thresholdPlugin);
        
        const chart = new Chart(ctx, config);
        this.charts.set('bin-fill-prediction', chart);
        this.chartConfigs.set('bin-fill-prediction', config);
    }

    // ==================== ENVIRONMENTAL IMPACT ====================

    initializeEnvironmentalImpact() {
        const ctx = document.getElementById('environmental-impact-chart');
        if (!ctx) return;

        const config = {
            type: 'polarArea',
            data: {
                labels: ['🌳 Trees Saved', '💧 Water Saved', '⚡ Energy Saved', '🌍 CO2 Reduced', '♻️ Waste Recycled'],
                datasets: [{
                    data: [247, 12450, 8932, 15.7, 2847],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(124, 58, 237, 0.8)',
                        'rgba(34, 197, 94, 0.8)'
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 2
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
                            font: { size: 13, weight: 'bold' },
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        callbacks: {
                            label: function(context) {
                                const labels = ['trees', 'liters', 'kWh', 'kg CO2', 'kg'];
                                return `${context.label}: ${context.parsed.r} ${labels[context.dataIndex]}`;
                            },
                            afterBody: function() {
                                return ['🌱 Environmental impact this month', '📈 AI-optimized sustainability'];
                            }
                        }
                    }
                },
                scales: {
                    r: {
                        ticks: { 
                            color: '#94a3b8',
                            font: { weight: 'bold' },
                            backdropColor: 'transparent'
                        },
                        grid: { color: 'rgba(148, 163, 184, 0.3)' }
                    }
                }
            }
        };

        const chart = new Chart(ctx, config);
        this.charts.set('environmental-impact', chart);
        this.chartConfigs.set('environmental-impact', config);
    }

    // ==================== COST BENEFIT ANALYSIS ====================

    initializeCostBenefitAnalysis() {
        const ctx = document.getElementById('cost-benefit-chart');
        if (!ctx) return;

        const config = {
            type: 'line',
            data: {
                labels: this.generateMonthLabels(12),
                datasets: [
                    {
                        label: '💰 Cost Savings',
                        data: [12500, 15200, 18300, 21400, 24800, 28200, 31700, 35100, 38900, 42300, 45800, 49200],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        yAxisID: 'y',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 6
                    },
                    {
                        label: '📈 ROI Percentage',
                        data: [8.2, 12.5, 18.7, 25.1, 32.4, 38.9, 45.2, 51.8, 57.9, 63.4, 68.7, 73.5],
                        borderColor: '#7c3aed',
                        backgroundColor: 'rgba(124, 58, 237, 0.1)',
                        yAxisID: 'y1',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 6
                    }
                ]
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
                        labels: {
                            color: '#ffffff',
                            font: { size: 14, weight: 'bold' },
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        callbacks: {
                            label: function(context) {
                                if (context.datasetIndex === 0) {
                                    return `Cost Savings: $${context.parsed.y.toLocaleString()}`;
                                } else {
                                    return `ROI: ${context.parsed.y}%`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { 
                            color: '#94a3b8',
                            font: { weight: 'bold' }
                        },
                        grid: { 
                            color: 'rgba(148, 163, 184, 0.1)',
                            drawBorder: false
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        ticks: { 
                            color: '#94a3b8',
                            font: { weight: 'bold' },
                            callback: function(value) {
                                return '$' + (value / 1000).toFixed(0) + 'K';
                            }
                        },
                        grid: { 
                            color: 'rgba(148, 163, 184, 0.1)',
                            drawBorder: false
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        ticks: { 
                            color: '#94a3b8',
                            font: { weight: 'bold' },
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: { 
                            drawOnChartArea: false
                        }
                    }
                }
            }
        };

        const chart = new Chart(ctx, config);
        this.charts.set('cost-benefit', chart);
        this.chartConfigs.set('cost-benefit', config);
    }

    // ==================== SYSTEM HEALTH MONITOR ====================

    initializeSystemHealthMonitor() {
        const ctx = document.getElementById('system-health-monitor');
        if (!ctx) return;

        const config = {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(12),
                datasets: [
                    {
                        label: '🖥️ CPU Usage',
                        data: this.generateMetricData(12, 35, 15),
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: '💾 Memory Usage',
                        data: this.generateMetricData(12, 68, 12),
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: '⚡ Processing Speed',
                        data: this.generateMetricData(12, 92, 5),
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff',
                            font: { size: 14, weight: 'bold' },
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { 
                            color: '#94a3b8',
                            font: { weight: 'bold' }
                        },
                        grid: { 
                            color: 'rgba(148, 163, 184, 0.1)',
                            drawBorder: false
                        }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        ticks: { 
                            color: '#94a3b8',
                            font: { weight: 'bold' },
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: { 
                            color: 'rgba(148, 163, 184, 0.1)',
                            drawBorder: false
                        }
                    }
                }
            }
        };

        const chart = new Chart(ctx, config);
        this.charts.set('system-health', chart);
        this.chartConfigs.set('system-health', config);
        
        // Set up real-time updates
        this.setupChartAnimation('system-health', this.updateSystemHealthData.bind(this));
    }

    // ==================== AI TRAINING PROGRESS ====================

    initializeAITrainingProgress() {
        const ctx = document.getElementById('ai-training-progress');
        if (!ctx) return;

        const config = {
            type: 'bar',
            data: {
                labels: ['Route Optimizer', 'Demand Predictor', 'Anomaly Detector', 'Driver Assistant', 'Waste Analyzer'],
                datasets: [{
                    label: 'Training Progress',
                    data: [95, 87, 92, 89, 91],
                    backgroundColor: [
                        'rgba(0, 212, 255, 0.8)',
                        'rgba(124, 58, 237, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ],
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        callbacks: {
                            label: function(context) {
                                return `Training: ${context.parsed.y}% complete`;
                            },
                            afterBody: function() {
                                return ['🧠 Neural network training status', '📊 Continuous learning enabled'];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { 
                            color: '#94a3b8',
                            font: { weight: 'bold' }
                        },
                        grid: { display: false }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        ticks: { 
                            color: '#94a3b8',
                            font: { weight: 'bold' },
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: { 
                            color: 'rgba(148, 163, 184, 0.1)',
                            drawBorder: false
                        }
                    }
                }
            }
        };

        const chart = new Chart(ctx, config);
        this.charts.set('ai-training', chart);
        this.chartConfigs.set('ai-training', config);
    }

    // ==================== REAL-TIME UPDATES ====================

    setupRealTimeUpdates() {
        // Update charts every 10 seconds
        setInterval(() => {
            this.updateAllCharts();
        }, 10000);
        
        // Update specific metrics every 5 seconds
        setInterval(() => {
            this.updateRealTimeMetrics();
        }, 5000);
    }

    setupChartAnimation(chartName, updateCallback) {
        const intervalId = setInterval(() => {
            try {
                // Check if chart still exists and is valid
                if (!this.charts.has(chartName)) {
                    console.warn(`⚠️ Chart ${chartName} no longer exists, clearing animation interval`);
                    clearInterval(intervalId);
                    return;
                }
                
                const chart = this.charts.get(chartName);
                
                // Verify chart canvas still exists
                if (!chart || !chart.canvas || !chart.canvas.parentNode || chart.isDestroyed) {
                    console.warn(`⚠️ Chart ${chartName} canvas invalid, clearing animation interval`);
                    this.charts.delete(chartName);
                    clearInterval(intervalId);
                    return;
                }
                
                // Only update if callback exists and chart is properly initialized
                if (updateCallback && typeof updateCallback === 'function') {
                    updateCallback(chartName);
                }
                
            } catch (error) {
                console.error(`❌ Chart animation error for ${chartName}:`, error.message);
                // Clear the problematic interval and remove the chart
                this.charts.delete(chartName);
                clearInterval(intervalId);
            }
        }, 15000); // Update every 15 seconds
        
        // Store interval ID for cleanup if needed
        if (!this.animationIntervals) {
            this.animationIntervals = new Map();
        }
        this.animationIntervals.set(chartName, intervalId);
    }

    updateAllCharts() {
        this.charts.forEach((chart, name) => {
            if (this.isChartVisible(name)) {
                this.updateChartData(chart, name);
            }
        });
    }

    updateChartData(chart, chartName) {
        try {
            switch (chartName) {
                case 'ai-performance':
                    this.updateAIPerformanceData(chartName);
                    break;
                case 'system-health':
                    this.updateSystemHealthData(chartName);
                    break;
                case 'route-optimization':
                    this.updateRouteOptimizationData(chartName);
                    break;
                case 'bin-fill-prediction':
                    this.updateBinPredictionData(chartName);
                    break;
                default:
                    // Generic update
                    chart.update('none');
            }
        } catch (error) {
            console.warn(`Failed to update ${chartName}:`, error);
        }
    }

    updateAIPerformanceData(chartName) {
        try {
            const chart = this.charts.get(chartName);
            if (!chart) {
                console.warn(`⚠️ Chart ${chartName} not found in charts map`);
                return;
            }
            
            // Check if canvas still exists in the DOM
            if (!chart.canvas || !chart.canvas.parentNode) {
                console.warn(`⚠️ Canvas for chart ${chartName} no longer exists in DOM, removing from charts`);
                this.charts.delete(chartName);
                return;
            }
            
            // Verify chart is still valid and not destroyed
            if (chart.isDestroyed) {
                console.warn(`⚠️ Chart ${chartName} has been destroyed, removing from charts`);
                this.charts.delete(chartName);
                return;
            }
            
            // Add new data points
            if (chart.data && chart.data.datasets) {
                chart.data.datasets.forEach((dataset, index) => {
                    if (dataset && Array.isArray(dataset.data)) {
                        const newValue = this.generateSingleAIPerformanceValue(dataset.label);
                        dataset.data.push(newValue);
                        
                        // Keep only last 24 data points
                        if (dataset.data.length > 24) {
                            dataset.data.shift();
                        }
                    }
                });
            }
            
            // Update labels
            if (chart.data && chart.data.labels && Array.isArray(chart.data.labels)) {
                chart.data.labels.push(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
                if (chart.data.labels.length > 24) {
                    chart.data.labels.shift();
                }
            }
            
            // Safe chart update with error handling
            if (typeof chart.update === 'function') {
                chart.update('none');
            }
            
        } catch (error) {
            console.error(`❌ Error updating AI performance chart ${chartName}:`, error.message);
            // Remove the problematic chart from the map
            this.charts.delete(chartName);
        }
    }

    updateSystemHealthData(chartName) {
        const chart = this.charts.get(chartName);
        if (!chart) return;
        
        // Update with realistic system metrics
        const cpuUsage = 30 + Math.random() * 20;
        const memoryUsage = 60 + Math.random() * 15;
        const processingSpeed = 88 + Math.random() * 10;
        
        chart.data.datasets[0].data.push(cpuUsage);
        chart.data.datasets[1].data.push(memoryUsage);
        chart.data.datasets[2].data.push(processingSpeed);
        
        // Keep only last 12 data points
        chart.data.datasets.forEach(dataset => {
            if (dataset.data.length > 12) {
                dataset.data.shift();
            }
        });
        
        // Update labels
        chart.data.labels.push(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        if (chart.data.labels.length > 12) {
            chart.data.labels.shift();
        }
        
        chart.update('none');
    }

    updateRealTimeMetrics() {
        // Update UI elements with real-time metrics
        this.updateElement('aiProcessingSpeed', (Math.random() * 2 + 1).toFixed(1) + 'ms');
        this.updateElement('aiMemoryUsage', Math.floor(Math.random() * 20) + 65 + '%');
        this.updateElement('aiCpuUsage', Math.floor(Math.random() * 30) + 35 + '%');
        this.updateElement('aiThroughput', (Math.random() * 1 + 1).toFixed(1) + 'K/s');
    }

    // ==================== RESPONSIVE BEHAVIOR ====================

    setupResponsiveBehavior() {
        window.addEventListener('resize', () => {
            this.charts.forEach(chart => {
                chart.resize();
            });
        });
        
        // Handle visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateAllCharts();
            }
        });
    }

    // ==================== UTILITY METHODS ====================

    isChartVisible(chartName) {
        const element = document.getElementById(chartName.replace(/([A-Z])/g, '-$1').toLowerCase());
        return element && element.offsetParent !== null;
    }

    generateTimeLabels(hours) {
        const labels = [];
        const now = new Date();
        for (let i = hours - 1; i >= 0; i--) {
            const time = new Date(now - i * 60 * 60 * 1000);
            labels.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        }
        return labels;
    }

    generateFutureDateLabels(days) {
        const labels = [];
        const now = new Date();
        for (let i = 0; i < days; i++) {
            const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        return labels;
    }

    generateMonthLabels(months) {
        const labels = [];
        const now = new Date();
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
        }
        return labels;
    }

    generateAIPerformanceData(count, base, variance, trend = 'random') {
        const data = [];
        for (let i = 0; i < count; i++) {
            let value = base;
            
            if (trend === 'improving') {
                value = base + (i * 0.5); // Gradual improvement
            } else if (trend === 'stable') {
                value = base; // Stable performance
            }
            
            // Add some realistic variation
            value += (Math.random() - 0.5) * variance;
            
            // Ensure within realistic bounds
            value = Math.max(80, Math.min(100, value));
            data.push(Number(value.toFixed(1)));
        }
        return data;
    }

    generateSingleAIPerformanceValue(datasetLabel) {
        const baseValues = {
            '🚀 Route Optimization': 92,
            '🔮 Predictive Analytics': 94,
            '🧠 Driver Assistant': 89
        };
        
        const base = baseValues[datasetLabel] || 90;
        const variation = (Math.random() - 0.5) * 4; // ±2% variation
        return Number((base + variation).toFixed(1));
    }

    generateMetricData(count, base, variance) {
        return Array.from({ length: count }, () => 
            Math.max(0, Math.min(100, base + (Math.random() - 0.5) * variance))
        );
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    // ==================== PUBLIC API ====================

    getChart(chartName) {
        return this.charts.get(chartName);
    }

    updateChart(chartName, newData) {
        const chart = this.charts.get(chartName);
        if (chart && newData) {
            chart.data = { ...chart.data, ...newData };
            chart.update();
        }
    }

    refreshAllCharts() {
        this.updateAllCharts();
        console.log('📊 All AI charts refreshed');
    }

    exportChartImage(chartName) {
        const chart = this.charts.get(chartName);
        if (chart) {
            const url = chart.toBase64Image();
            const link = document.createElement('a');
            link.download = `${chartName}-chart.png`;
            link.href = url;
            link.click();
        }
    }

    destroy() {
        // Clear all animation intervals first
        if (this.animationIntervals) {
            this.animationIntervals.forEach((intervalId, chartName) => {
                clearInterval(intervalId);
                console.log(`⏹️ Cleared animation interval for ${chartName}`);
            });
            this.animationIntervals.clear();
        }
        
        // Destroy all charts
        this.charts.forEach((chart, chartName) => {
            try {
                if (chart && typeof chart.destroy === 'function') {
                    chart.destroy();
                    console.log(`🗑️ Destroyed chart: ${chartName}`);
                }
            } catch (error) {
                console.warn(`⚠️ Error destroying chart ${chartName}:`, error.message);
            }
        });
        
        this.charts.clear();
        this.chartConfigs.clear();
        this.animationCallbacks.clear();
        this.isInitialized = false;
        
        console.log('✅ AI Chart Visualizer destroyed completely');
    }
}

// ==================== GLOBAL INITIALIZATION ====================

// Initialize AI Chart Visualizer
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.aiChartVisualizer = new AIChartVisualizer();
        console.log('📊🧠 AI Chart Visualizer ready');
    }, 2500); // Wait for Chart.js and other dependencies
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.aiChartVisualizer) {
        window.aiChartVisualizer.destroy();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIChartVisualizer;
}

