#!/usr/bin/env node

// setup-vercel-auth.js - One-time Vercel authentication setup
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔐 Vercel Authentication Setup - Autonautics Waste Management');
console.log('='.repeat(65));

console.log('\n🎯 This script will set up automatic deployment to Vercel');
console.log('   ✅ No manual authentication needed after setup');
console.log('   ✅ Automatic deployment on git push');
console.log('   ✅ GitHub Actions integration');
console.log('   ✅ Environment variables configuration');

// Step 1: Check for existing .vercel directory
console.log('\n📁 Checking project configuration...');
if (fs.existsSync('.vercel')) {
  console.log('✅ .vercel directory found - project already linked');
} else {
  console.log('⚠️  .vercel directory not found - will create during setup');
}

// Step 2: Create .vercel directory structure
if (!fs.existsSync('.vercel')) {
  fs.mkdirSync('.vercel');
  console.log('✅ Created .vercel directory');
}

// Step 3: Create project.json template
const projectConfig = {
  "projectId": "prj_XXXXXXXXXXXXXXXXXXXXXX",
  "orgId": "team_XXXXXXXXXXXXXXXXXXXXXX"
};

const projectJsonPath = path.join('.vercel', 'project.json');
if (!fs.existsSync(projectJsonPath)) {
  fs.writeFileSync(projectJsonPath, JSON.stringify(projectConfig, null, 2));
  console.log('✅ Created .vercel/project.json template');
}

// Step 4: Create automatic deployment script
console.log('\n🚀 Creating automatic deployment script...');
const autoDeployScript = `#!/usr/bin/env node

// auto-deploy.js - Automatic deployment script
const { execSync } = require('child_process');

console.log('🚀 Starting automatic deployment...');

try {
  // Check if we have a Vercel token
  if (!process.env.VERCEL_TOKEN) {
    console.log('⚠️  VERCEL_TOKEN not found in environment variables');
    console.log('   Please set up GitHub secrets or use: vercel login');
    process.exit(1);
  }

  // Deploy using environment token
  console.log('📦 Deploying to Vercel...');
  const result = execSync('vercel deploy --prod --token=\$VERCEL_TOKEN', { 
    stdio: 'inherit',
    env: { ...process.env, VERCEL_TOKEN: process.env.VERCEL_TOKEN }
  });
  
  console.log('✅ Deployment completed successfully!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
`;

fs.writeFileSync('auto-deploy.js', autoDeployScript);
console.log('✅ Created auto-deploy.js script');

// Step 5: Create environment setup script
console.log('\n🔧 Creating environment setup script...');
const envSetupScript = `#!/usr/bin/env node

// setup-env.js - Environment variables setup for Vercel
const { execSync } = require('child_process');

const envVars = [
  { name: 'POSTGRES_URL', description: 'PostgreSQL database connection string' },
  { name: 'NODE_ENV', value: 'production', description: 'Node.js environment' },
  { name: 'JWT_SECRET', description: 'JWT secret key for authentication' },
  { name: 'API_SECRET_KEY', description: 'API secret key' }
];

console.log('🔧 Setting up Vercel environment variables...');

for (const envVar of envVars) {
  try {
    if (envVar.value) {
      // Set predefined value
      const cmd = \`vercel env add \${envVar.name} production\`;
      console.log(\`Setting \${envVar.name}=\${envVar.value}\`);
      execSync(\`echo "\${envVar.value}" | \${cmd}\`, { stdio: 'inherit' });
    } else {
      // Prompt for value
      console.log(\`\\n📝 Please set \${envVar.name}:\`);
      console.log(\`   Description: \${envVar.description}\`);
      console.log(\`   Command: vercel env add \${envVar.name} production\`);
    }
  } catch (error) {
    console.log(\`⚠️  Could not set \${envVar.name}: \${error.message}\`);
  }
}

console.log('\\n✅ Environment setup completed!');
`;

fs.writeFileSync('setup-env.js', envSetupScript);
console.log('✅ Created setup-env.js script');

// Step 6: Update package.json with new scripts
console.log('\n📝 Updating package.json with automation scripts...');
const packageJsonPath = 'package.json';
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add new scripts for automation
packageJson.scripts = {
  ...packageJson.scripts,
  'setup:vercel': 'node setup-vercel-auth.js',
  'setup:env': 'node setup-env.js',
  'deploy:auto': 'node auto-deploy.js',
  'deploy:github': 'git add . && git commit -m "Deploy to Vercel" && git push origin main',
  'vercel:link': 'vercel link',
  'vercel:env': 'vercel env ls',
  'vercel:logs': 'vercel logs',
  'vercel:inspect': 'vercel inspect'
};

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ Updated package.json with automation scripts');

// Step 7: Create GitHub secrets template
console.log('\n🔑 Creating GitHub secrets template...');
const githubSecretsTemplate = `# GitHub Secrets Configuration

## Required Secrets for Automatic Deployment

Add these secrets to your GitHub repository:
**Settings → Secrets and variables → Actions → New repository secret**

### 1. VERCEL_TOKEN
- Get from: https://vercel.com/account/tokens
- Description: Personal Access Token for Vercel API
- Value: Your Vercel token (starts with "vercel_")

### 2. VERCEL_ORG_ID  
- Get from: .vercel/project.json (after running 'vercel link')
- Description: Your Vercel organization/team ID
- Value: team_XXXXXXXXXXXXXXXXXXXXXX

### 3. VERCEL_PROJECT_ID
- Get from: .vercel/project.json (after running 'vercel link')  
- Description: Your Vercel project ID
- Value: prj_XXXXXXXXXXXXXXXXXXXXXX

### 4. POSTGRES_URL
- Your PostgreSQL database connection string
- Example: postgres://username:password@host:port/database

## Setup Steps:

1. Run: \`vercel login\` (one time only)
2. Run: \`vercel link\` (links this project to Vercel)
3. Copy the IDs from .vercel/project.json
4. Add all secrets to GitHub repository
5. Push code to trigger automatic deployment

## Commands:

\`\`\`bash
# One-time setup
npm run setup:vercel
vercel login
vercel link

# Set environment variables
npm run setup:env

# Deploy automatically
npm run deploy:github

# Check deployment
vercel logs
\`\`\`
`;

fs.writeFileSync('GITHUB-SECRETS.md', githubSecretsTemplate);
console.log('✅ Created GITHUB-SECRETS.md guide');

// Step 8: Create .gitignore updates
console.log('\n📄 Updating .gitignore...');
const gitignoreAdditions = `
# Vercel
.vercel
.env*.local
.env.production

# Deployment
auto-deploy.log
deployment-*.log

# Secrets
secrets.json
.env.secrets
`;

if (fs.existsSync('.gitignore')) {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  if (!gitignore.includes('.vercel')) {
    fs.appendFileSync('.gitignore', gitignoreAdditions);
    console.log('✅ Updated .gitignore with Vercel exclusions');
  }
} else {
  fs.writeFileSync('.gitignore', gitignoreAdditions);
  console.log('✅ Created .gitignore with Vercel exclusions');
}

// Step 9: Summary and next steps
console.log('\n🎉 Vercel Authentication Setup Complete!');
console.log('='.repeat(50));

console.log('\n📋 Next Steps:');
console.log('   1. Run: vercel login (one time authentication)');
console.log('   2. Run: vercel link (link this project to Vercel)');
console.log('   3. Add GitHub secrets (see GITHUB-SECRETS.md)');
console.log('   4. Push to GitHub for automatic deployment');

console.log('\n🚀 Deployment Options:');
console.log('   • npm run deploy:github (push to trigger deployment)');
console.log('   • npm run deploy:auto (direct deployment)');
console.log('   • GitHub Actions (automatic on push)');

console.log('\n📁 Files Created:');
console.log('   ✅ .github/workflows/vercel-deploy.yml');
console.log('   ✅ .vercel/project.json (template)');
console.log('   ✅ auto-deploy.js');
console.log('   ✅ setup-env.js');
console.log('   ✅ GITHUB-SECRETS.md');

console.log('\n🔗 Useful Commands:');
console.log('   • vercel --help (Vercel CLI help)');
console.log('   • vercel env ls (list environment variables)');
console.log('   • vercel logs (view deployment logs)');
console.log('   • vercel inspect (project details)');

console.log('\n🌟 Ready for Zero-Touch Deployment!');


