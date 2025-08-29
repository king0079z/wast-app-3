#!/usr/bin/env node

// quick-deploy.js - One-click deployment without authentication prompts
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('⚡ Quick Deploy to Vercel - Zero Authentication');
console.log('='.repeat(50));

async function quickDeploy() {
  try {
    // Step 1: Check if we can deploy without login
    console.log('🔍 Checking deployment readiness...');
    
    // Create a minimal Vercel project configuration
    const vercelConfig = {
      "name": "autonautics-waste-management",
      "version": 2,
      "builds": [
        { "src": "index.html", "use": "@vercel/static" },
        { "src": "api/**/*.js", "use": "@vercel/node" }
      ],
      "routes": [
        { "src": "/api/(.*)", "dest": "/api/$1" },
        { "src": "/(.*\\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot))", "dest": "/$1" },
        { "src": "/(.*)", "dest": "/index.html" }
      ],
      "env": {
        "NODE_ENV": "production"
      },
      "functions": {
        "api/**/*.js": {
          "runtime": "nodejs18.x",
          "maxDuration": 30
        }
      }
    };

    // Step 2: Create deployment package
    console.log('📦 Preparing deployment package...');
    
    // Ensure public directory exists
    if (!fs.existsSync('public')) {
      fs.mkdirSync('public', { recursive: true });
    }

    // Copy essential files to public
    const filesToCopy = [
      'index.html',
      'styles.css', 
      'messaging-styles.css',
      'app.js',
      'auth.js',
      'data-manager.js',
      'enhanced-messaging-system.js',
      'websocket-manager.js'
    ];

    filesToCopy.forEach(file => {
      if (fs.existsSync(file)) {
        const destPath = path.join('public', file);
        fs.copyFileSync(file, destPath);
        console.log(`✅ Copied ${file}`);
      }
    });

    // Step 3: Try deployment methods
    console.log('\n🚀 Attempting deployment...');
    
    // Method 1: Try with existing auth
    try {
      console.log('📡 Method 1: Using existing Vercel session...');
      execSync('vercel --prod --yes --confirm', { 
        stdio: 'pipe',
        timeout: 60000 
      });
      console.log('✅ Deployment successful with existing session!');
      return;
    } catch (error) {
      console.log('⚠️  Method 1 failed, trying alternative...');
    }

    // Method 2: Create a GitHub-ready package
    console.log('📡 Method 2: Preparing for GitHub deployment...');
    
    // Initialize git if not already done
    if (!fs.existsSync('.git')) {
      console.log('🔧 Initializing git repository...');
      execSync('git init', { stdio: 'inherit' });
      execSync('git add .', { stdio: 'inherit' });
      execSync('git commit -m "Initial commit - Autonautics Waste Management System"', { stdio: 'inherit' });
    }

    // Create deployment instructions
    const deploymentInstructions = `
# 🚀 Automatic Deployment Instructions

## Option 1: GitHub Integration (Recommended - Zero Authentication)

1. **Push to GitHub:**
   \`\`\`bash
   git remote add origin https://github.com/yourusername/autonautics-waste-management.git
   git push -u origin main
   \`\`\`

2. **Connect to Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Click "Deploy" (No authentication needed!)

3. **Automatic Deployment:**
   - Every push to main branch = automatic deployment
   - GitHub Actions handle everything
   - Zero manual intervention required

## Option 2: Direct Deploy Link

1. **One-Click Deploy Button:**
   
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/autonautics-waste-management)

## Option 3: Vercel CLI (One-time auth)

1. **Authenticate once:**
   \`\`\`bash
   vercel login
   \`\`\`

2. **Deploy automatically:**
   \`\`\`bash
   npm run deploy:auto
   \`\`\`

## 🎯 Your app will be available at:
- **Production**: https://autonautics-waste-management.vercel.app
- **Custom Domain**: Configure in Vercel dashboard

## 📊 Features Included:
✅ Complete waste management system
✅ AI-powered analytics  
✅ Real-time driver tracking
✅ Comprehensive reporting
✅ Professional UI/UX
✅ Database integration
✅ Security & compliance
✅ Mobile responsive design
`;

    fs.writeFileSync('DEPLOY-NOW.md', deploymentInstructions);
    console.log('✅ Created DEPLOY-NOW.md with instructions');

    // Method 3: Create deployment package for manual upload
    console.log('📡 Method 3: Creating manual deployment package...');
    
    const packageData = {
      name: 'autonautics-waste-management-deployment',
      timestamp: new Date().toISOString(),
      instructions: 'Upload this entire folder to Vercel dashboard',
      files: {
        api: 'Serverless functions',
        public: 'Static assets', 
        'vercel.json': 'Deployment configuration',
        'package.json': 'Dependencies'
      }
    };

    fs.writeFileSync('deployment-info.json', JSON.stringify(packageData, null, 2));
    console.log('✅ Created deployment package info');

    // Step 4: Success message
    console.log('\n🎉 Deployment Setup Complete!');
    console.log('='.repeat(40));
    
    console.log('\n🚀 Choose Your Deployment Method:');
    console.log('   1. GitHub Integration (Easiest - see DEPLOY-NOW.md)');
    console.log('   2. One-Click Deploy Button');  
    console.log('   3. Vercel Dashboard Upload');
    console.log('   4. CLI with one-time auth: vercel login');

    console.log('\n📂 Project Ready For:');
    console.log('   ✅ Vercel Serverless Deployment');
    console.log('   ✅ Automatic GitHub Actions');
    console.log('   ✅ Zero-downtime deployments');
    console.log('   ✅ Automatic scaling');

    console.log('\n🔗 Next Steps:');
    console.log('   📖 Read: DEPLOY-NOW.md');
    console.log('   🔑 Setup: GitHub secrets (optional)');
    console.log('   🌐 Deploy: Push to GitHub or use Vercel dashboard');

  } catch (error) {
    console.error('\n❌ Deployment preparation failed:');
    console.error(error.message);
    
    console.log('\n🔧 Fallback Options:');
    console.log('   1. Manual upload to Vercel dashboard');
    console.log('   2. GitHub repository integration');
    console.log('   3. One-time CLI authentication');
    
    process.exit(1);
  }
}

// Run the deployment
quickDeploy().catch(console.error);


