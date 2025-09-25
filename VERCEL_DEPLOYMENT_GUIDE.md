# Vercel Deployment Guide

## Frontend Deployment Issues & Solutions

### Current Status
- ✅ Backend is running: https://agriculture-backend-production.railway.app/
- ❌ Frontend deployment issue: https://agriculture-frontend-two.vercel.app/

### Issues Identified

1. **Environment Variables Not Set in Vercel Dashboard**
2. **Build Configuration Issues**
3. **Missing Production Environment File**

### Step-by-Step Fix

#### 1. Set Environment Variables in Vercel Dashboard

Go to your Vercel project dashboard and add these environment variables:

```
REACT_APP_API_BASE_URL = https://agriculture-backend-production.railway.app/api
REACT_APP_GOOGLE_CLIENT_ID = 1077945709935-l5tcsn6el2b1rqh51l229aja2klio170.apps.googleusercontent.com
GENERATE_SOURCEMAP = false
NODE_ENV = production
```

#### 2. Update Package.json Build Script

The current build script should work, but ensure it's using the production environment:

```json
{
  "scripts": {
    "build": "react-scripts build",
    "build:production": "node build-production.js"
  }
}
```

#### 3. Verify Vercel Configuration

The `vercel.json` file has been updated to remove the problematic environment variable references.

#### 4. Manual Deployment Steps

1. **Connect Repository**: Ensure your GitHub repository is connected to Vercel
2. **Set Environment Variables**: Add the variables listed above in Vercel dashboard
3. **Redeploy**: Trigger a new deployment from Vercel dashboard
4. **Check Build Logs**: Monitor the deployment logs for any errors

#### 5. Alternative: Local Build Test

To test the build locally:

```bash
cd agriculture-frontend
npm install
npm run build
```

This should create a `build` folder that can be deployed.

### Troubleshooting

#### Common Issues:

1. **Build Fails**: Check if all dependencies are installed
2. **Environment Variables Not Working**: Ensure they're set in Vercel dashboard, not just in local files
3. **API Connection Issues**: Verify the backend URL is correct and accessible
4. **Routing Issues**: The SPA routing should work with the current `vercel.json` configuration

#### Quick Fix Commands:

```bash
# Install dependencies
npm install

# Test build locally
npm run build

# Check if build folder is created
ls -la build/
```

### Expected Result

After following these steps, your frontend should be accessible at:
https://agriculture-frontend-two.vercel.app/

And it should successfully connect to your backend API at:
https://agriculture-backend-production.railway.app/api
