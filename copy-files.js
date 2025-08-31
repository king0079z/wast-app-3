#!/usr/bin/env node

// copy-files.js - Copy missing files to public directory for Vercel deployment
const fs = require('fs');
const path = require('path');

console.log('📁 Copying missing files to public directory for Vercel deployment...');

// List of missing files that need to be copied
const filesToCopy = [
  'sync-manager.js',
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
  'map-fix.css',
  'advanced-ai-engine.js',
  'ai-integration-bridge.js',
  'ai-analytics-integration.js'
];

let copiedCount = 0;
let errorCount = 0;

filesToCopy.forEach(file => {
  try {
    const sourcePath = file;
    const destPath = path.join('public', file);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ Copied: ${file}`);
      copiedCount++;
    } else {
      console.log(`⚠️  File not found: ${file}`);
      errorCount++;
    }
  } catch (error) {
    console.error(`❌ Error copying ${file}:`, error.message);
    errorCount++;
  }
});

console.log('\n📊 Copy Summary:');
console.log(`   ✅ Successfully copied: ${copiedCount} files`);
console.log(`   ❌ Errors/Missing: ${errorCount} files`);

if (copiedCount > 0) {
  console.log('\n🚀 Next steps:');
  console.log('   1. git add .');
  console.log('   2. git commit -m "Add missing files to public directory"');
  console.log('   3. git push origin main');
  console.log('   4. Vercel will auto-deploy from GitHub');
}

console.log('\n✅ File copying completed!');
<<<<<<< HEAD
=======


>>>>>>> 3a3d25021ae37e98129b71bb8b9b56323687f303
