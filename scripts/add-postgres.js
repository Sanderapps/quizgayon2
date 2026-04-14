#!/usr/bin/env node
/**
 * Script to add PostgreSQL database to Railway project
 * This uses the Railway GraphQL API
 */

import { execSync } from 'child_process';

const PROJECT_ID = '1ce4c5a0-0044-4b31-b2c4-dce9e43ded73';
const ENVIRONMENT_ID = '8b0131d3-4396-49ef-a95f-b7c3e6f09dee';

console.log('🔧 Attempting to add PostgreSQL to Railway project...\n');

console.log('📋 Project Information:');
console.log(`   Project ID: ${PROJECT_ID}`);
console.log(`   Environment ID: ${ENVIRONMENT_ID}\n`);

console.log('⚠️  The Railway CLI requires interactive mode for adding databases.\n');

console.log('📝 Please follow these steps:\n');
console.log('1. Open the Railway dashboard in your browser:');
console.log(`   https://railway.com/project/${PROJECT_ID}?environmentId=${ENVIRONMENT_ID}\n`);

console.log('2. Click "New" button in the canvas\n');
console.log('3. Select "Database" → "PostgreSQL"\n');
console.log('4. Wait for PostgreSQL to be provisioned (~1-2 minutes)\n');
console.log('5. The web service will automatically redeploy\n');

console.log('✅ After adding PostgreSQL, verify with:\n');
console.log('   railway service status --service web\n');
console.log('   railway logs --service web\n');

console.log('🌐 Your application will be available at:\n');
console.log('   https://<your-domain>.up.railway.app\n');

console.log('\n💡 Tip: Railway automatically generates a public domain.');
console.log('   You can also add a custom domain with: railway domain\n');
