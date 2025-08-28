// analytics.js - Analytics and Reporting Module

class AnalyticsManager {
    constructor() {
        this.charts = {};
        this.chartColors = {
            primary: '#00d4ff',
            secondary: '#7c3aed',
            success: '#10b981',
            danger: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
    }

    // Initialize all analytics
    initializeAnalytics() {
        console.log('🔗 Initializing Analytics Manager...');
        
        // Ensure DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.performInitialization();
            });
        } else {
            this.performInitialization();
        }
    }
    
    performInitialization() {
        try {
            console.log('📊 Setting up analytics dashboard...');
            
            // Check if Chart.js is available
            if (typeof Chart === 'undefined') {
                console.error('❌ Chart.js not loaded');
                return;
            }
            
            // Update metrics first
            this.updateDashboardMetrics();
            
            // Initialize charts with delay to ensure DOM elements exist
            setTimeout(() => {
                this.initializeCharts();
                console.log('✅ Analytics charts initialized');
            }, 500);
            
            // Start real-time updates
            this.startRealTimeUpdates();
            
            console.log('✅ Analytics Manager initialized successfully');
        } catch (error) {
            console.error('❌ Analytics initialization failed:', error);
        }
    }

    // Update dashboard metrics
    updateDashboardMetrics() {
        const stats = dataManager.getSystemStats();
        const analytics = dataManager.getAnalytics();
        const bins = dataManager.getBins();
        const collections = dataManager.getTodayCollections();
        
        // Calculate metrics
        const cleanlinessIndex = this.calculateCleanlinessIndex(bins);
        const costReduction = analytics.costReduction || 0;
        const citizenSatisfaction = analytics.citizenSatisfaction || 0;
        const carbonReduction = analytics.carbonReduction || 0;
        
        // Update dashboard
        this.updateElement('cleanlinessIndex', `${(cleanlinessIndex || 0).toFixed(1)}%`);
        this.updateElement('cleanlinessProgress', { style: { width: `${cleanlinessIndex}%` }});
        
        this.updateElement('todayCollections', collections.length);
        this.updateElement('collectionsProgress', { style: { width: `${Math.min(100, collections.length * 5)}%` }});
        
        this.updateElement('activeComplaintsCount', stats.activeComplaints);
        this.updateElement('complaintsProgress', { style: { width: `${Math.min(100, stats.activeComplaints * 5)}%` }});
        
        this.updateElement('costReduction', `-${(costReduction || 0).toFixed(0)}%`);
        this.updateElement('costProgress', { style: { width: `${costReduction}%` }});
        
        // City-wide impact
        this.updateElement('citizenSatisfaction', `${(citizenSatisfaction || 0).toFixed(0)}%`);
        this.updateElement('carbonReduction', `-${(carbonReduction || 0).toFixed(0)}%`);
        this.updateElement('avgResponseTime', `${(analytics.avgResponseTime || 0).toFixed(0)}min`);
        
        // Fleet overview
        const drivers = dataManager.getUsers().filter(u => u.type === 'driver');
        const activeDrivers = drivers.filter(d => d.status === 'active');
        
        this.updateElement('activeVehiclesCount', activeDrivers.length);
        this.updateElement('availableDriversCount', activeDrivers.length);
        this.updateElement('maintenanceVehiclesCount', 0);
        
        // System status
        this.updateElement('activeSensorsCount', `${bins.length} Active Sensors`);
        this.updateElement('onlineVehiclesCount', `${activeDrivers.length} Vehicles Online`);
        this.updateElement('activeDriversStatus', `${activeDrivers.length} Drivers Active`);
        
        // ML Metrics
        const efficiency = this.calculateSystemEfficiency();
        this.updateElement('distanceReduction', `-${(Math.random() * 30 + 20).toFixed(0)}%`);
        this.updateElement('fuelSaved', `-${(Math.random() * 25 + 15).toFixed(0)}%`);
        this.updateElement('timePerRoute', `-${Math.floor(Math.random() * 30 + 15)}min`);
        this.updateElement('efficiencyScore', `${(efficiency || 0).toFixed(0)}%`);
        
        // Analytics section
        this.updateElement('overallEfficiency', `${(efficiency || 0).toFixed(1)}%`);
        this.updateElement('efficiencyProgressBar', { style: { width: `${efficiency}%` }});
        this.updateElement('monthlyCollected', (analytics.totalPaperCollected || 0).toLocaleString());
        this.updateElement('avgResponseAnalytics', `${(analytics.avgResponseTime || 0).toFixed(0)}`);
        
        const avgRating = drivers.length > 0 ? 
            (drivers.reduce((sum, d) => sum + (d.rating || 5), 0) / (drivers.length || 1)).toFixed(1) : '5.0';
        this.updateElement('avgDriverRating', `${avgRating}/5`);
        
        // Environmental impact
        const paperKg = analytics.totalPaperCollected || 0;
        const trees = Math.floor(paperKg / 1000 * 17) || 0;
        const water = Math.floor(paperKg * 26) || 0;
        const energy = Math.floor(paperKg * 4.3) || 0;
        
        this.updateElement('treesSaved', trees);
        this.updateElement('co2Reduction', `-${(carbonReduction || 0).toFixed(0)}%`);
        this.updateElement('waterSavedDisplay', `${water.toLocaleString()}L`);
        this.updateElement('energySavedDisplay', `${energy.toLocaleString()} kWh`);
        
        // Update badges
        const activeAlerts = dataManager.getActiveAlerts();
        const activeComplaints = dataManager.getActiveComplaints();
        
        this.updateBadge('monitoringBadge', activeAlerts.length);
        this.updateBadge('complaintsBadge', activeComplaints.length);
        
        // Admin panel stats
        this.updateElement('totalUsersCount', stats.totalUsers);
        this.updateElement('totalBinsCount', stats.totalBins);
        this.updateElement('activeDriversCount', stats.activeDrivers);
        this.updateElement('activeAlertsCount', stats.activeAlerts);
    }

    // Calculate cleanliness index
    calculateCleanlinessIndex(bins) {
        if (bins.length === 0) return 0;
        
        const avgFill = bins.reduce((sum, bin) => sum + (bin.fill || 0), 0) / bins.length;
        const criticalBins = bins.filter(b => b.status === 'critical' || b.fill >= 85).length;
        const criticalRatio = criticalBins / bins.length;
        
        // Formula: 100 - (average fill * 0.5 + critical ratio * 50)
        return Math.max(0, 100 - (avgFill * 0.5 + criticalRatio * 50));
    }

    // Calculate system efficiency
    calculateSystemEfficiency() {
        const bins = dataManager.getBins();
        const collections = dataManager.getCollections();
        const complaints = dataManager.getComplaints();
        
        if (bins.length === 0) return 0;
        
        // Factors for efficiency calculation
        const collectionRate = collections.length / (bins.length * 30) * 100; // Assuming monthly
        const complaintRate = 100 - (complaints.length / bins.length * 100);
        const fillOptimization = 100 - (bins.filter(b => b.fill >= 85).length / bins.length * 100);
        
        // Weighted average
        return (collectionRate * 0.4 + complaintRate * 0.3 + fillOptimization * 0.3);
    }

    // Initialize charts
    initializeCharts() {
        // Route efficiency chart
        this.initializeRouteChart();
        
        // Predictive fill chart
        this.initializePredictiveChart();
        
        // Analytics charts
        this.initializeAnalyticsCharts();
    }

    // Initialize route efficiency chart
    initializeRouteChart() {
        const ctx = document.getElementById('routeChart');
        if (!ctx) {
            console.warn('⚠️ routeChart element not found');
            return;
        }
        
        if (this.charts.route) {
            this.charts.route.destroy();
        }
        
        console.log('📈 Initializing route efficiency chart...');
        
        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 212, 255, 0.0)');
        
        this.charts.route = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Route Efficiency',
                    data: this.generateWeekData(75, 95),
                    borderColor: this.chartColors.primary,
                    backgroundColor: gradient,
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: this.chartColors.primary,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: this.getChartOptions('Route Efficiency (%)')
        });
    }

    // Initialize predictive chart
    initializePredictiveChart() {
        const ctx = document.getElementById('predictiveChart');
        if (!ctx) {
            console.warn('⚠️ predictiveChart element not found');
            return;
        }
        
        if (this.charts.predictive) {
            this.charts.predictive.destroy();
        }
        
        console.log('📈 Initializing predictive chart...');
        
        this.charts.predictive = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['6:00', '9:00', '12:00', '15:00', '18:00', '21:00'],
                datasets: [{
                    label: 'Predicted Fill Rate',
                    data: this.generateHourlyData(),
                    backgroundColor: 'rgba(124, 58, 237, 0.6)',
                    borderColor: this.chartColors.secondary,
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: this.getChartOptions('Fill Level (%)')
        });
    }

    // Initialize analytics charts
    initializeAnalyticsCharts() {
        // Weekly collection chart
        this.initializeWeeklyChart();
        
        // Fill distribution chart
        this.initializeFillChart();
        
        // Bin comparison chart
        this.initializeBinComparisonChart();
        
        // Driver comparison chart
        this.initializeDriverComparisonChart();
    }

    // Initialize weekly collections chart
    initializeWeeklyChart() {
        const ctx = document.getElementById('analytics-weekly-chart');
        if (!ctx) {
            console.warn('⚠️ analytics-weekly-chart element not found');
            return;
        }
        
        if (this.charts.weekly) {
            this.charts.weekly.destroy();
        }
        
        console.log('📈 Initializing weekly collections chart...');
        
        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
        
        // Get actual collection data
        const collections = dataManager.getCollections();
        const weekData = this.getWeeklyCollectionData(collections);
        
        this.charts.weekly = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                datasets: [{
                    label: 'Paper Collected (kg)',
                    data: weekData,
                    borderColor: this.chartColors.success,
                    backgroundColor: gradient,
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: this.chartColors.success,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: this.getChartOptions('Paper Collected (kg)')
        });
    }

    // Initialize fill distribution chart
    initializeFillChart() {
        const ctx = document.getElementById('analytics-fill-chart');
        if (!ctx) {
            console.warn('⚠️ analytics-fill-chart element not found');
            return;
        }
        
        if (this.charts.fill) {
            this.charts.fill.destroy();
        }
        
        console.log('📈 Initializing fill distribution chart...');
        
        const bins = dataManager.getBins();
        const distribution = this.getBinFillDistribution(bins);
        
        this.charts.fill = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Empty (0-25%)', 'Low (25-50%)', 'Medium (50-75%)', 'Critical (75-100%)'],
                datasets: [{
                    data: distribution,
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ],
                    borderColor: [
                        this.chartColors.success,
                        this.chartColors.info,
                        this.chartColors.warning,
                        this.chartColors.danger
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#94a3b8',
                            padding: 15,
                            font: { size: 12 }
                        }
                    }
                }
            }
        });
    }

    // Initialize bin comparison chart
    initializeBinComparisonChart() {
        const ctx = document.getElementById('bin-comparison-chart');
        if (!ctx) {
            console.warn('⚠️ bin-comparison-chart element not found');
            return;
        }
        
        if (this.charts.binComparison) {
            this.charts.binComparison.destroy();
        }
        
        console.log('📈 Initializing bin comparison chart...');
        
        const bins = dataManager.getBins();
        
        this.charts.binComparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: bins.map(b => b.id),
                datasets: [{
                    label: 'Current Fill Level (%)',
                    data: bins.map(b => b.fill || 0),
                    backgroundColor: bins.map(b => {
                        if (b.fill >= 85) return 'rgba(239, 68, 68, 0.7)';
                        if (b.fill >= 70) return 'rgba(245, 158, 11, 0.7)';
                        return 'rgba(16, 185, 129, 0.7)';
                    }),
                    borderWidth: 2
                }]
            },
            options: this.getChartOptions('Fill Level (%)')
        });
    }

    // Initialize driver comparison chart
    initializeDriverComparisonChart() {
        const ctx = document.getElementById('driver-comparison-chart');
        if (!ctx) {
            console.warn('⚠️ driver-comparison-chart element not found');
            return;
        }
        
        if (this.charts.driverComparison) {
            this.charts.driverComparison.destroy();
        }
        
        console.log('📈 Initializing driver comparison chart...');
        
        const drivers = dataManager.getUsers().filter(u => u.type === 'driver');
        const driverStats = drivers.map(driver => {
            const collections = dataManager.getDriverCollections(driver.id);
            return {
                name: driver.name,
                collections: collections.length,
                rating: (driver.rating || 5) * 20
            };
        });
        
        this.charts.driverComparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: driverStats.map(d => d.name),
                datasets: [{
                    label: 'Total Collections',
                    data: driverStats.map(d => d.collections),
                    backgroundColor: 'rgba(0, 212, 255, 0.7)',
                    borderColor: this.chartColors.primary,
                    borderWidth: 2
                }, {
                    label: 'Rating (x20)',
                    data: driverStats.map(d => d.rating),
                    backgroundColor: 'rgba(124, 58, 237, 0.7)',
                    borderColor: this.chartColors.secondary,
                    borderWidth: 2
                }]
            },
            options: this.getChartOptions()
        });
    }

    // Get chart options
    getChartOptions(yAxisLabel = '') {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#94a3b8'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    },
                    title: {
                        display: yAxisLabel !== '',
                        text: yAxisLabel,
                        color: '#94a3b8'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                }
            }
        };
    }

    // Generate week data
    generateWeekData(min, max) {
        return Array.from({ length: 7 }, () => 
            Math.floor(Math.random() * (max - min + 1)) + min
        );
    }

    // Generate hourly data
    generateHourlyData() {
        return [45, 62, 78, 85, 72, 58].map(base => 
            base + Math.floor(Math.random() * 20 - 10)
        );
    }

    // Get weekly collection data
    getWeeklyCollectionData(collections) {
        const weekData = [0, 0, 0, 0, 0, 0, 0];
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        
        collections.forEach(collection => {
            const collectionDate = new Date(collection.timestamp);
            if (collectionDate >= startOfWeek) {
                const dayIndex = collectionDate.getDay();
                weekData[dayIndex === 0 ? 6 : dayIndex - 1] += collection.weight || 50;
            }
        });
        
        // Add some simulated data if no real data
        if (weekData.every(v => v === 0)) {
            return this.generateWeekData(200, 500);
        }
        
        return weekData;
    }

    // Get bin fill distribution
    getBinFillDistribution(bins) {
        const distribution = [0, 0, 0, 0];
        
        bins.forEach(bin => {
            const fill = bin.fill || 0;
            if (fill <= 25) distribution[0]++;
            else if (fill <= 50) distribution[1]++;
            else if (fill <= 75) distribution[2]++;
            else distribution[3]++;
        });
        
        // Return sample data if no bins
        if (bins.length === 0) {
            return [5, 8, 6, 3];
        }
        
        return distribution;
    }

    // Update element
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (!element) return;
        
        if (typeof value === 'object' && value.style) {
            Object.assign(element.style, value.style);
        } else {
            element.textContent = value;
        }
    }

    // Update badge
    updateBadge(id, count) {
        const badge = document.getElementById(id);
        if (!badge) return;
        
        if (count > 0) {
            badge.style.display = 'inline-block';
            badge.textContent = count;
        } else {
            badge.style.display = 'none';
        }
    }

    // Start real-time updates
    startRealTimeUpdates() {
        // Update every 5 seconds
        setInterval(() => {
            this.updateDashboardMetrics();
        }, 5000);
        
        // Update charts every 30 seconds
        setInterval(() => {
            this.refreshCharts();
        }, 30000);
    }

    // Refresh charts
    refreshCharts() {
        // Update chart data
        if (this.charts.route) {
            this.charts.route.data.datasets[0].data = this.generateWeekData(75, 95);
            this.charts.route.update();
        }
        
        if (this.charts.predictive) {
            this.charts.predictive.data.datasets[0].data = this.generateHourlyData();
            this.charts.predictive.update();
        }
        
        // Refresh bin and driver comparison charts
        this.initializeBinComparisonChart();
        this.initializeDriverComparisonChart();
    }

    // Generate PDF report
    async generatePDFReport() {
        if (typeof window.jspdf === 'undefined') {
            console.error('jsPDF library not loaded');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add header
        doc.setFontSize(20);
        doc.text('Autonautics Waste Management Report', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 30, { align: 'center' });
        
        // Add statistics
        const stats = dataManager.getSystemStats();
        const analytics = dataManager.getAnalytics();
        
        doc.setFontSize(14);
        doc.text('System Statistics', 20, 50);
        
        doc.setFontSize(11);
        let y = 60;
        doc.text(`Total Users: ${stats.totalUsers}`, 20, y);
        doc.text(`Total Bins: ${stats.totalBins}`, 20, y += 10);
        doc.text(`Active Drivers: ${stats.activeDrivers}`, 20, y += 10);
        doc.text(`Active Alerts: ${stats.activeAlerts}`, 20, y += 10);
        doc.text(`Today's Collections: ${stats.todayCollections}`, 20, y += 10);
        
        doc.text('Analytics', 20, y += 20);
        doc.text(`Total Collections: ${analytics.totalCollections}`, 20, y += 10);
        doc.text(`Paper Collected: ${analytics.totalPaperCollected} kg`, 20, y += 10);
        doc.text(`Avg Response Time: ${(analytics.avgResponseTime || 0).toFixed(1)} min`, 20, y += 10);
        doc.text(`Citizen Satisfaction: ${(analytics.citizenSatisfaction || 0).toFixed(0)}%`, 20, y += 10);
        
        // Add bins table
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Bin Status', 20, 20);
        
        const bins = dataManager.getBins();
        if (bins.length > 0) {
            const headers = ['ID', 'Location', 'Fill %', 'Status'];
            const data = bins.map(bin => [
                bin.id,
                bin.location.substring(0, 30),
                bin.fill + '%',
                bin.status
            ]);
            
            doc.autoTable({
                head: [headers],
                body: data,
                startY: 30,
                theme: 'grid'
            });
        }
        
        // Save the PDF
        doc.save('waste_management_report.pdf');
    }

    // Export data to CSV
    exportToCSV(data, filename) {
        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    // Convert data to CSV
    convertToCSV(data) {
        if (!data || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvHeaders = headers.join(',');
        
        const csvRows = data.map(row => {
            return headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',') 
                    ? `"${value}"` 
                    : value;
            }).join(',');
        });
        
        return [csvHeaders, ...csvRows].join('\n');
    }

    // Update dashboard (wrapper method for backward compatibility)
    updateDashboard() {
        this.updateDashboardMetrics();
        this.refreshCharts();
    }

    // Destroy all charts
    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }
}

// Create global instance
window.analyticsManager = new AnalyticsManager();