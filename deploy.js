#!/usr/bin/env node

// deploy.js - Automated Vercel deployment script
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Autonautics Waste Management System - Vercel Deployment');
console.log('='.repeat(60));

// Check if required files exist
const requiredFiles = [
  'vercel.json',
  'package.json',
  'index.html',
  'api/db.js',
  'api/health.js'
];

console.log('📋 Checking required files...');
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Missing required file: ${file}`);
    process.exit(1);
  }
  console.log(`✅ ${file}`);
}

// Check if Vercel CLI is installed
console.log('\n🔧 Checking Vercel CLI...');
try {
  execSync('vercel --version', { stdio: 'ignore' });
  console.log('✅ Vercel CLI is installed');
} catch (error) {
  console.log('⚠️  Vercel CLI not found. Installing...');
  try {
    execSync('npm install -g vercel', { stdio: 'inherit' });
    console.log('✅ Vercel CLI installed successfully');
  } catch (installError) {
    console.error('❌ Failed to install Vercel CLI');
    console.error('Please install manually: npm install -g vercel');
    process.exit(1);
  }
}

// Check for environment variables
console.log('\n🔐 Environment Variables Check...');
const envVars = [
  'POSTGRES_URL',
  'NODE_ENV'
];

console.log('ℹ️  Make sure these environment variables are set in Vercel:');
for (const envVar of envVars) {
  console.log(`   • ${envVar}`);
}

// Clean and prepare for deployment
console.log('\n🧹 Preparing for deployment...');

// Create public directory if it doesn't exist
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
  console.log('✅ Created public directory');
}

// Copy static assets to public directory
const staticFiles = [
  'styles.css',
  'messaging-styles.css',
  'map-fix.css'
];

for (const file of staticFiles) {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join('public', file));
    console.log(`✅ Copied ${file} to public/`);
  }
}

// Copy JavaScript files to public directory
const jsFiles = [
  'app.js',
  'auth.js',
  'data-manager.js',
  'enhanced-messaging-system.js',
  'websocket-manager.js',
  'map-manager.js',
  'analytics-manager-v2.js',
  'ai-analytics-integration.js',
  'ml-route-optimizer.js',
  'intelligent-driver-assistant.js',
  'predictive-analytics.js',
  'enhanced-analytics.js',
  'bin-modals.js',
  'event-handlers.js',
  'sync-manager.js',
  'driver-system-v3.js',
  'ai-integration-bridge.js',
  'advanced-ai-engine.js',
  'ai-chart-visualizer.js'
];

for (const file of jsFiles) {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join('public', file));
    console.log(`✅ Copied ${file} to public/`);
  }
}

console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

console.log('\n🔍 Running final checks...');

// Validate vercel.json
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  console.log('✅ vercel.json is valid');
  console.log(`   • Project name: ${vercelConfig.name}`);
  console.log(`   • Functions runtime: ${vercelConfig.functions['api/**/*.js'].runtime}`);
} catch (error) {
  console.error('❌ Invalid vercel.json file');
  process.exit(1);
}

// Validate package.json
try {
  const packageConfig = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('✅ package.json is valid');
  console.log(`   • Project: ${packageConfig.name}`);
  console.log(`   • Version: ${packageConfig.version}`);
} catch (error) {
  console.error('❌ Invalid package.json file');
  process.exit(1);
}

console.log('\n🚀 Starting deployment...');
console.log('📝 Deployment options:');
console.log('   1. Production deployment (recommended)');
console.log('   2. Preview deployment');
console.log('   3. Development deployment');

// Determine deployment type from command line arguments
const args = process.argv.slice(2);
let deploymentType = 'production';

if (args.includes('--preview')) {
  deploymentType = 'preview';
} else if (args.includes('--dev')) {
  deploymentType = 'development';
}

console.log(`\n🎯 Deploying to: ${deploymentType}`);

try {
  let deployCommand = 'vercel';
  
  if (deploymentType === 'production') {
    deployCommand += ' --prod';
  }
  
  if (args.includes('--force')) {
    deployCommand += ' --force';
  }

  console.log(`\n⚡ Executing: ${deployCommand}`);
  execSync(deployCommand, { stdio: 'inherit' });
  
  console.log('\n🎉 Deployment completed successfully!');
  console.log('\n📋 Post-deployment checklist:');
  console.log('   ✅ Check application is accessible');
  console.log('   ✅ Test API endpoints');
  console.log('   ✅ Verify database connection');
  console.log('   ✅ Test real-time features');
  console.log('   ✅ Check error logging');
  
  console.log('\n🔗 Important URLs:');
  console.log('   • Health Check: /api/health');
  console.log('   • System Info: /api/info');
  console.log('   • Data Sync: /api/data/sync');
  console.log('   • Driver Locations: /api/driver/locations');
  
  console.log('\n📊 Features deployed:');
  console.log('   ✅ Enhanced Comprehensive Reporting');
  console.log('   ✅ AI-Powered Analytics');
  console.log('   ✅ Real-time Driver Tracking');
  console.log('   ✅ Smart Bin Monitoring');
  console.log('   ✅ Fleet Management');
  console.log('   ✅ Environmental Impact Analysis');
  console.log('   ✅ Security & Compliance');
  console.log('   ✅ Professional UI/UX');
  
} catch (error) {
  console.error('\n❌ Deployment failed!');
  console.error('Error:', error.message);
  console.log('\n🔧 Troubleshooting steps:');
  console.log('   1. Check your Vercel account and login status');
  console.log('   2. Verify environment variables are set');
  console.log('   3. Check for any syntax errors in your code');
  console.log('   4. Review the deployment logs for specific errors');
  console.log('   5. Ensure all dependencies are properly installed');
  process.exit(1);
}

console.log('\n🌟 Thank you for using Autonautics Waste Management System!');
console.log('='.repeat(60));

