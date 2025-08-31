#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📁 Copying missing files to public directory...');

// List of files that need to be copied
const filesToCopy = [
    'event-handlers.js',
    'analytics-manager-v2.js',
    'driver-system-v3.js',
    'predictive-analytics.js',
    'ai-driver-integration.js',
    'ml-route-optimizer.js',
    'enhanced-analytics.js',
    'bin-modals.js',
    'map-manager.js',
    'enhanced-driver-buttons-new.js',
    'intelligent-driver-assistant.js',
    'messaging-system.js',
    'ai-chart-visualizer.js',
    'advanced-ai-engine.js',
    'ai-integration-bridge.js',
    'ai-analytics-integration.js'
];

let copiedCount = 0;

filesToCopy.forEach(file => {
    try {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            const destPath = path.join('public', file);
            fs.writeFileSync(destPath, content);
            console.log(`✅ Copied: ${file}`);
            copiedCount++;
        } else {
            console.log(`⚠️ File not found: ${file}`);
        }
    } catch (error) {
        console.error(`❌ Error copying ${file}:`, error.message);
    }
});

console.log(`\n✅ Successfully copied ${copiedCount} files to public directory`);
console.log('\n🚀 Ready to push to GitHub!');
