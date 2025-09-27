# Railway Deployment Guide for Algeria Ride Share

## 🚀 Deployment Status

Your Algeria ride share application has been successfully set up for Railway deployment!

**Project Details:**
- Project Name: `abridas`
- Environment: `production`
- Repository: `https://github.com/tkooo5df/abridas-v01.git`
- Railway Dashboard: `https://railway.com/project/20f535d3-378e-4911-82b2-1d64fdb154ca`

## 📦 What's Been Set Up

### 1. Railway Configuration Files
- ✅ `railway.json` - Railway project configuration
- ✅ `nixpacks.toml` - Build configuration for Nixpacks
- ✅ `.railwayignore` - Files to exclude from deployment
- ✅ `.env.example` - Environment variables template

### 2. Package.json Updates
- ✅ Added `start` script for production
- ✅ Updated `preview` script to work with Railway's PORT variable
- ✅ Configured for Railway's hosting requirements

### 3. Vite Configuration
- ✅ Updated `vite.config.ts` for Railway compatibility
- ✅ Added preview server configuration with dynamic PORT

## 🔧 Current Deployment Process

Your deployment is currently in progress. You can:

1. **Check Build Status**:
   ```bash
   railway logs
   ```

2. **View Build Dashboard**:
   Visit: https://railway.com/project/20f535d3-378e-4911-82b2-1d64fdb154ca

3. **Get Deployment URL**:
   ```bash
   railway domain
   ```

## 🌐 Post-Deployment Steps

### 1. Configure Environment Variables (Optional)
If you want to use Supabase or Google OAuth:

```bash
railway variables set VITE_DATABASE_TYPE=supabase
railway variables set VITE_SUPABASE_URL=your_supabase_url
railway variables set VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
railway variables set VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 2. Set Up Custom Domain (Optional)
```bash
railway domain add your-domain.com
```

## 📊 Build Configuration

**Nixpacks Setup:**
- Node.js 18.x
- npm 9.x
- Automatic dependency installation
- Production build process
- Preview server for hosting

**Build Process:**
1. Install dependencies (`npm ci`)
2. Build the application (`npm run build`)
3. Start preview server (`npm run preview`)

## 🔄 Automatic Deployments

Your Railway project is connected to your GitHub repository. Any new commits to the `main` branch will automatically trigger a new deployment.

To deploy changes:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

## 🗄️ Database Options

Your application supports two database modes:

### SQLite (Default - No Setup Required)
- Works out of the box
- Perfect for demos and development
- Data stored locally in the container

### Supabase (Cloud Database)
- Requires Supabase project setup
- Set environment variables as shown above
- Persistent data storage

## 🎯 Useful Railway Commands

```bash
# Check deployment status
railway status

# View logs
railway logs

# Get domain information
railway domain

# Open Railway dashboard
railway open

# Connect to different service
railway connect

# Deploy manually
railway up
```

## 🚨 Troubleshooting

### If Build Fails:
1. Check logs: `railway logs`
2. Verify package.json scripts
3. Ensure all dependencies are in package.json

### If App Won't Start:
1. Check the PORT environment variable is being used
2. Verify preview script in package.json
3. Check Vite configuration

### Common Issues:
- **Port binding**: Ensure the app listens on `process.env.PORT`
- **Build errors**: Check Node.js version compatibility
- **Environment variables**: Verify they're set in Railway dashboard

## 📱 Application Features Available

Once deployed, your app will include:
- ✅ User authentication system
- ✅ Ride booking functionality
- ✅ Driver and passenger dashboards
- ✅ Admin panel
- ✅ Real-time notifications
- ✅ Database switching capability
- ✅ Responsive mobile design
- ✅ Algeria-specific features (58 wilayas)

## 🎉 Next Steps

1. **Wait for deployment to complete** (usually 3-5 minutes)
2. **Visit your Railway dashboard** to get the deployment URL
3. **Test the application** once it's live
4. **Configure environment variables** if needed
5. **Set up custom domain** if desired

Your Algeria ride share application will be live and accessible worldwide once the deployment completes!