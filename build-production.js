// Production build script
// This script sets up the environment variables for production build

const fs = require('fs');
const path = require('path');

// Production environment variables
const envContent = `# Production Environment Variables
REACT_APP_API_BASE_URL=https://agriculture-backend-production.railway.app/api
REACT_APP_GOOGLE_CLIENT_ID=1077945709935-l5tcsn6el2b1rqh51l229aja2klio170.apps.googleusercontent.com
GENERATE_SOURCEMAP=false
`;

// Write .env file
fs.writeFileSync(path.join(__dirname, '.env.production'), envContent);

console.log('✅ Production environment file created');
console.log('📦 Building for production...');

// Run the build
const { execSync } = require('child_process');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Production build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
