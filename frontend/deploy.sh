#!/bin/bash

# Phonely Frontend Deployment Script
# This script builds and deploys the frontend to DigitalOcean

set -e  # Exit on error

echo "🚀 Starting Phonely Frontend Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_DIR="/home/ali/phonely-frontend/frontend"
NGINX_CONFIG="/etc/nginx/sites-available/phonely"

echo -e "${YELLOW}📦 Building production bundle...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"

echo -e "${YELLOW}📊 Build size analysis:${NC}"
du -sh dist/*

echo -e "\n${YELLOW}📤 Deployment Instructions:${NC}"
echo "1. Upload dist/ folder to server:"
echo -e "   ${GREEN}scp -r dist/* user@your-server:$DEPLOY_DIR/dist/${NC}"
echo ""
echo "2. Update Nginx config (if needed):"
echo -e "   ${GREEN}sudo cp nginx.conf $NGINX_CONFIG${NC}"
echo -e "   ${GREEN}sudo nginx -t${NC}"
echo -e "   ${GREEN}sudo systemctl reload nginx${NC}"
echo ""
echo "3. Verify deployment:"
echo -e "   ${GREEN}curl -I https://beta.phonely.com.pk/assets/index-*.js${NC}"
echo -e "   Should show: ${YELLOW}Cache-Control: public, max-age=31536000, immutable${NC}"

echo -e "\n${GREEN}✨ Build complete! Ready for deployment.${NC}"
