# ðŸš› Autonautics Smart Waste Management System

AI-Powered Smart Waste Management System with Real-time GPS Tracking, IoT Integration, and Advanced Analytics

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)

## ðŸ“‹ Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## âœ¨ Features

### Core Functionality
- ðŸ” **Multi-tier Authentication** - Admin, Manager, and Driver roles
- ðŸ“ **Real-time GPS Tracking** - Live driver location monitoring
- ðŸ—ºï¸ **Interactive Maps** - Leaflet-based mapping with custom markers
- ðŸ“Š **Advanced Analytics** - Real-time charts and metrics
- ðŸ¤– **ML Route Optimization** - AI-powered route planning
- ðŸš¨ **Alert System** - Automatic alerts for critical bins
- ðŸ“± **Mobile-Responsive** - Optimized driver interface
- ðŸ’¾ **Persistent Storage** - LocalStorage data management
- ðŸ“ˆ **Environmental Impact** - CO2 and resource tracking
- ðŸ“„ **PDF Reports** - Automated report generation

### User Features

#### Admin
- User registration approval
- System data management
- Complete access control
- Backup and restore

#### Manager
- Live monitoring dashboard
- Fleet management
- Route optimization
- Complaint handling
- Analytics and reporting

#### Driver
- GPS auto-tracking
- Route navigation
- Collection registration
- Issue reporting
- Shift management

## ðŸ› ï¸ Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Maps:** Leaflet.js
- **Charts:** Chart.js
- **PDF:** jsPDF
- **Icons:** Font Awesome
- **Storage:** LocalStorage API
- **GPS:** Geolocation API

## ðŸ“¦ Installation

### Option 1: Direct Browser (No Installation)
Simply open `index.html` in a modern web browser. All dependencies load from CDN.

### Option 2: NPM Installation
```bash
# Clone the repository
git clone https://github.com/autonautics/waste-management-system.git
cd waste-management-system

# Install dependencies
npm install

# Start development server
npm start
```

### Option 3: Production Build
```bash
# Install dependencies
npm install

# Create production build
npm run build

# Serve production build
npm run serve
```

## ðŸš€ Quick Start

### Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Manager | manager1 | manager123 |
| Driver | driver1 | driver123 |

### First Steps

1. **Login as Admin**
   - Approve pending registrations
   - Configure system settings

2. **Add Paper Bins**
   - Click the floating action button (FAB)
   - Select "Add New Bin"
   - Enter location and GPS coordinates

3. **Assign Routes**
   - Login as Manager
   - Go to Fleet Management
   - Click "Optimize All Routes"

4. **Start Collection**
   - Login as Driver
   - GPS tracking starts automatically
   - View assigned routes
   - Register pickups

## ðŸ“ Project Structure

```
waste-management-system/
â”œâ”€â”€ index.html           # Main application HTML
â”œâ”€â”€ styles.css          # Application styles
â”œâ”€â”€ app.js             # Main application controller
â”œâ”€â”€ data-manager.js    # Data persistence layer
â”œâ”€â”€ auth.js           # Authentication module
â”œâ”€â”€ map-manager.js    # Map and GPS functionality
â”œâ”€â”€ analytics.js      # Analytics and reporting
â”œâ”€â”€ package.json      # NPM configuration
â”œâ”€â”€ webpack.config.js # Webpack bundler config
â”œâ”€â”€ .gitignore       # Git ignore rules
â””â”€â”€ README.md        # Documentation
```

## ðŸ“– Usage Guide

### Adding New Bins
1. Click the FAB button (bottom-right)
2. Select "Add New Bin"
3. Fill in:
   - Bin ID (unique identifier)
   - Location name
   - GPS coordinates
   - Bin type and capacity
4. Submit to add to system

### Managing Drivers
1. Navigate to Fleet Management
2. View driver performance metrics
3. Assign routes to available drivers
4. Monitor real-time locations

### Generating Reports
1. Go to Analytics section
2. Click "Generate PDF Report"
3. Report includes:
   - System statistics
   - Bin status
   - Collection metrics
   - Environmental impact

### Handling Complaints
1. Navigate to Complaints section
2. Click "New Complaint" to register
3. Update status as resolved
4. Track complaint history

## ðŸ”§ Configuration

### Environment Variables
Create a `.env` file for custom configuration:

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# Map Settings
MAP_CENTER_LAT=25.2854
MAP_CENTER_LNG=51.5310
MAP_ZOOM=13

# Storage
STORAGE_PREFIX=waste_mgmt_

# Session
SESSION_TIMEOUT=1800000
```

### Customization

#### Change Map Tiles
Edit `map-manager.js`:
```javascript
L.tileLayer('YOUR_TILE_SERVER_URL', {
    attribution: 'Your Attribution'
}).addTo(this.map);
```

#### Modify Alert Thresholds
Edit `data-manager.js`:
```javascript
// Change bin alert levels
if (bins[index].fill >= 85) { // Modify this value
    bins[index].status = 'critical';
}
```

## ðŸŒ Deployment

### Deploy to GitHub Pages
```bash
# Build the project
npm run build

# Push to gh-pages branch
git add dist && git commit -m "Deploy"
git subtree push --prefix dist origin gh-pages
```

### Deploy to Netlify
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker Deployment
```dockerfile
FROM nginx:alpine
COPY dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## ðŸ“Š API Documentation

### DataManager API

```javascript
// Add new bin
dataManager.addBin({
    id: 'BIN-001',
    location: 'Main Street',
    lat: 25.2854,
    lng: 51.5310,
    capacity: 100
});

// Update bin status
dataManager.updateBin('BIN-001', {
    fill: 75,
    status: 'warning'
});

// Get all bins
const bins = dataManager.getBins();
```

### AuthManager API

```javascript
// Login
authManager.login(username, password, userType);

// Check permissions
if (authManager.hasPermission('manage_bins')) {
    // Authorized action
}

// Update driver location
authManager.updateDriverLocation(latitude, longitude);
```

### MapManager API

```javascript
// Initialize map
mapManager.initializeMainMap('mapElementId');

// Add bin marker
mapManager.addBinMarker(binData);

// Start GPS tracking
mapManager.startDriverTracking();
```

## ðŸ§ª Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

## ðŸ¤ Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## ðŸ“„ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ðŸ‘¥ Authors

- **Autonautics Team** - *Initial work*

## ðŸ™ Acknowledgments

- Leaflet.js for mapping
- Chart.js for analytics
- Font Awesome for icons
- OpenStreetMap for map data

## ðŸ“ž Support

For support, email support@autonautics.com or open an issue in the repository.

## ðŸ”„ Version History

- **1.0.0** - Initial release
  - Full authentication system
  - Real-time GPS tracking
  - Analytics dashboard
  - Route optimization

---
**Made with â¤ï¸ by Autonautics**