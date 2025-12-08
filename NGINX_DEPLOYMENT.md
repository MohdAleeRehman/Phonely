# Nginx Configuration Deployment

## Key Changes Made

### 1. Caching Headers (Fixes PageSpeed Issue)
- **Static assets** (`/assets/*.js`, `*.css`): 1 year cache, immutable
- **Images**: 30 days cache
- **Fonts**: 1 year cache, immutable  
- **HTML files**: No cache (for SPA routing)

### 2. Compression
- **Gzip**: Enabled for JS, CSS, JSON, SVG, fonts
- **Brotli**: Ready to enable (commented out, requires module)

### 3. Performance
- **HTTP/2**: Enabled on all SSL servers
- **SSL Session Cache**: 10m shared cache
- **Access logs**: Disabled for static assets

### 4. Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: Limited geolocation, camera, mic

### 5. Socket.IO Optimization
- Increased timeouts: 86400s (24 hours)
- WebSocket support maintained

## Deployment Steps

### 1. Update Nginx Config on Server
```bash
# SSH into your DigitalOcean droplet
ssh user@your-server

# Backup current config
sudo cp /etc/nginx/sites-available/phonely /etc/nginx/sites-available/phonely.backup

# Upload new config (from local machine)
scp nginx.conf user@your-server:/tmp/phonely.conf

# On server: move to nginx directory
sudo mv /tmp/phonely.conf /etc/nginx/sites-available/phonely

# Test configuration
sudo nginx -t

# If test passes, reload
sudo systemctl reload nginx
```

### 2. Enable Brotli (Optional but Recommended)
Brotli provides better compression than Gzip:

```bash
# Install Brotli module
sudo apt-get install nginx-module-brotli

# Edit /etc/nginx/nginx.conf and add at the top:
load_module modules/ngx_http_brotli_filter_module.so;
load_module modules/ngx_http_brotli_static_module.so;

# Uncomment brotli lines in the config file

# Test and reload
sudo nginx -t && sudo systemctl reload nginx
```

### 3. Deploy Frontend
```bash
# From frontend directory
npm run build

# Upload to server
scp -r dist/* user@your-server:/home/ali/phonely-frontend/frontend/dist/

# Or use rsync (better for updates)
rsync -avz --delete dist/ user@your-server:/home/ali/phonely-frontend/frontend/dist/
```

### 4. Verify Deployment
```bash
# Check if caching headers are applied
curl -I https://beta.phonely.com.pk/assets/index-*.js | grep Cache-Control

# Should show: Cache-Control: public, max-age=31536000, immutable

# Check compression
curl -I -H "Accept-Encoding: gzip" https://beta.phonely.com.pk/assets/vendor-*.js | grep Content-Encoding

# Should show: Content-Encoding: gzip

# Test PageSpeed
# Visit: https://pagespeed.web.dev/analysis?url=https://beta.phonely.com.pk
```

## Expected Results

### Before
- Cache TTL: None (0s)
- Transfer Size: 1,919 KiB uncompressed
- Mobile Performance: 56%
- Desktop Performance: 75%

### After
- Cache TTL: 1 year for assets
- Transfer Size: ~500 KiB (with gzip/brotli)
- Mobile Performance: 75-85% (expected)
- Desktop Performance: 90-95% (expected)

## Troubleshooting

### If caching headers not working:
```bash
# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Verify file permissions
ls -la /home/ali/phonely-frontend/frontend/dist/

# Test specific file
curl -I https://beta.phonely.com.pk/assets/index-BPS2X3L6.js
```

### If compression not working:
```bash
# Check if gzip module is loaded
nginx -V 2>&1 | grep -o with-http_gzip_static_module

# Check gzip in main config
grep -r "gzip" /etc/nginx/nginx.conf
```

### Clear CloudFlare cache (if using):
1. Login to CloudFlare dashboard
2. Go to Caching → Configuration
3. Click "Purge Everything"

## Notes
- The netlify.toml and vercel.json files are not used for DigitalOcean
- Keep them in repo for potential future deployment options
- robots.txt is now properly served with cache headers
- All SSL certificates maintained as-is
