# Fix PM2 Environment Variables Issue

## Problem
PM2 wasn't loading the `.env` file correctly because it was looking in the wrong directory.

## Solution

### Quick Fix (On your server)

```bash
# 1. Pull the latest changes
cd ~/Phonely
git pull origin main

# 2. Stop the backend service
pm2 stop phonely-backend

# 3. Restart with explicit working directory
cd ~/Phonely/backend
pm2 start src/server.js \
    --name phonely-backend \
    --cwd ~/Phonely/backend \
    --node-args="--max-old-space-size=2048"

# 4. Save PM2 configuration
pm2 save

# 5. Check logs
pm2 logs phonely-backend
```

### What Was Fixed

1. **backend/src/server.js**: Now uses absolute path to load `.env` file
   ```javascript
   // Before: dotenv.config()
   // After: dotenv.config({ path: path.join(__dirname, '..', '.env') })
   ```

2. **deployment/deploy.sh**: PM2 now uses `--cwd` flag to set working directory explicitly

### Verify It's Working

```bash
# Check if Cloudinary is loaded
pm2 logs phonely-backend --lines 50

# You should see:
# ✅ Cloudinary configured successfully
# NOT:
# ❌ Cloudinary configuration is missing
```

### Alternative: Set Environment Variables in PM2

If you still have issues, you can also set environment variables directly in PM2:

```bash
# Create PM2 ecosystem file
cat > ~/Phonely/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'phonely-backend',
      script: './src/server.js',
      cwd: './backend',
      env_production: {
        NODE_ENV: 'production',
        CLOUDINARY_CLOUD_NAME: 'dl1kjmaoq',
        CLOUDINARY_API_KEY: '191857187442571',
        CLOUDINARY_API_SECRET: 'SVGj5xvwpoNz5ThdhStmi2czueQ',
        // ... add other env vars
      }
    }
  ]
};
EOF

# Start with ecosystem file
pm2 start ecosystem.config.js --env production
```

## Troubleshooting

### Check Current Working Directory
```bash
pm2 info phonely-backend | grep cwd
```

### Check Environment Variables
```bash
pm2 env 0  # Replace 0 with your app ID
```

### Check .env File Location
```bash
ls -la ~/Phonely/backend/.env
cat ~/Phonely/backend/.env | grep CLOUDINARY
```
