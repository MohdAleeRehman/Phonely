#!/bin/bash

# Phonely Deployment Script
# This script deploys the entire Phonely application on your droplet

set -e  # Exit on error

echo "🚀 Starting Phonely Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${YELLOW}📁 Project root: $PROJECT_ROOT${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

if ! command_exists python3; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met${NC}"

# 1. Deploy Backend
echo ""
echo "📦 Deploying Backend..."
cd "$PROJECT_ROOT/backend"

# Copy production env file
if [ -f .env.production ]; then
    cp .env.production .env
    echo -e "${GREEN}✅ Backend .env.production copied to .env${NC}"
else
    echo -e "${YELLOW}⚠️  .env.production not found, using existing .env${NC}"
fi

# Install dependencies
echo "📥 Installing backend dependencies..."
npm install --production

# Build if needed (TypeScript projects)
if [ -f tsconfig.json ]; then
    echo "🔨 Building backend..."
    npm run build
fi

echo -e "${GREEN}✅ Backend deployed${NC}"

# 2. Deploy Frontend
echo ""
echo "🎨 Deploying Frontend..."
cd "$PROJECT_ROOT/frontend"

# Copy production env file
if [ -f .env.production ]; then
    cp .env.production .env
    echo -e "${GREEN}✅ Frontend .env.production copied to .env${NC}"
else
    echo -e "${YELLOW}⚠️  .env.production not found, using existing .env${NC}"
fi

# Install dependencies
echo "📥 Installing frontend dependencies..."
npm install

# Build for production
echo "🔨 Building frontend for production..."
npm run build

echo -e "${GREEN}✅ Frontend deployed${NC}"

# 3. Deploy AI Service
echo ""
echo "🤖 Deploying AI Service..."
cd "$PROJECT_ROOT/crew-ai-service/phonely_ai"

# Copy production env file
if [ -f .env.production ]; then
    cp .env.production .env
    echo -e "${GREEN}✅ AI Service .env.production copied to .env${NC}"
else
    echo -e "${YELLOW}⚠️  .env.production not found, using existing .env${NC}"
fi

# Install Python dependencies
echo "📥 Installing AI service dependencies..."
if command_exists uv; then
    uv sync
    echo -e "${GREEN}✅ AI Service deployed with uv${NC}"
elif command_exists pip; then
    pip install -r requirements.txt || pip install crewai fastapi uvicorn python-dotenv
    echo -e "${GREEN}✅ AI Service deployed with pip${NC}"
else
    echo -e "${RED}❌ Neither uv nor pip found${NC}"
    exit 1
fi

# 4. Setup PM2 or systemd services
echo ""
echo "⚙️  Setting up services..."

# Check if PM2 is installed
if command_exists pm2; then
    echo "🔧 Using PM2 for process management..."
    
    # Stop existing processes
    pm2 delete phonely-backend 2>/dev/null || true
    pm2 delete phonely-ai 2>/dev/null || true
    
    # Start backend with explicit working directory
    pm2 start src/server.js \
        --name phonely-backend \
        --cwd "$PROJECT_ROOT/backend" \
        --node-args="--max-old-space-size=2048"
    
    # Start AI service with explicit working directory
    pm2 start "uv run python src/phonely_ai/api.py" \
        --name phonely-ai \
        --cwd "$PROJECT_ROOT/crew-ai-service/phonely_ai" \
        --interpreter bash
    
    # Save PM2 configuration
    pm2 save
    pm2 startup
    
    echo -e "${GREEN}✅ Services configured with PM2${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 not found. Install with: npm install -g pm2${NC}"
    echo "You'll need to manually start the services:"
    echo "  Backend: cd backend && npm start"
    echo "  AI Service: cd crew-ai-service/phonely_ai && uv run python src/phonely_ai/api.py"
fi

# 5. Display service status
echo ""
echo "📊 Service Status:"
if command_exists pm2; then
    pm2 status
fi

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "🌐 Your services should be running on:"
echo "  Frontend: https://beta.phonely.com.pk"
echo "  Backend:  https://api.phonely.com.pk"
echo "  AI Service: https://ai.phonely.com.pk"
echo ""
echo "📝 Next steps:"
echo "  1. Configure Nginx reverse proxy"
echo "  2. Setup SSL certificates (Let's Encrypt)"
echo "  3. Configure firewall (UFW)"
echo "  4. Test all endpoints"
echo ""
echo "💡 Useful commands:"
echo "  pm2 status          - Check service status"
echo "  pm2 logs            - View all logs"
echo "  pm2 restart all     - Restart all services"
echo "  pm2 monit           - Monitor resources"
