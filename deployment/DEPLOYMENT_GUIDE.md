# Phonely Production Deployment Guide

Complete guide to deploy Phonely on your DigitalOcean droplet.

## 📋 Prerequisites

### Droplet Requirements
- Ubuntu 22.04 LTS
- Minimum 2GB RAM (4GB recommended)
- 2 CPU cores
- 50GB SSD storage

### Domain Configuration
Add these A records to your domain DNS:
```
beta.phonely.com.pk  →  Your_Droplet_IP
api.phonely.com.pk   →  Your_Droplet_IP
ai.phonely.com.pk    →  Your_Droplet_IP
```

## 🚀 Step-by-Step Deployment

### 1. Initial Server Setup

```bash
# SSH into your droplet
ssh root@your_droplet_ip

# Update system
apt update && apt upgrade -y

# Create a non-root user
adduser phonely
usermod -aG sudo phonely
su - phonely
```

### 2. Install Dependencies

```bash
# Node.js 18+ (Backend & Frontend)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Python 3.11+ (AI Service)
sudo apt install -y python3 python3-pip python3-venv

# MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Redis
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Nginx
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Certbot (SSL certificates)
sudo apt install -y certbot python3-certbot-nginx

# PM2 (Process manager)
sudo npm install -g pm2

# UV (Python package manager for AI service)
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.cargo/env
```

### 3. Clone Repository

```bash
cd ~
git clone https://github.com/MohdAleeRehman/Phonely.git
cd Phonely
```

### 4. Configure Environment Variables

```bash
# Backend
cd ~/Phonely/backend
cp .env.production.example .env
nano .env  # Update with your actual credentials:
# - MongoDB URI (if using external DB)
# - OPENAI_API_KEY
# - JWT_SECRET (generate a strong secret: openssl rand -hex 32)
# - Cloudinary credentials
# - Resend API key
# - Twilio credentials

# Frontend
cd ~/Phonely/frontend
cp .env.production.example .env
# Already configured with production URLs

# AI Service
cd ~/Phonely/crew-ai-service/phonely_ai
cp .env.production.example .env
nano .env  # Add your OPENAI_API_KEY
```

### 5. Run Deployment Script

```bash
cd ~/Phonely/deployment
chmod +x deploy.sh
./deploy.sh
```

This will:
- Install all dependencies
- Build frontend
- Setup PM2 processes for backend and AI service

### 6. Configure Nginx

```bash
# Copy Nginx configurations
sudo cp ~/Phonely/deployment/nginx/beta.phonely.com.pk /etc/nginx/sites-available/
sudo cp ~/Phonely/deployment/nginx/api.phonely.com.pk /etc/nginx/sites-available/
sudo cp ~/Phonely/deployment/nginx/ai.phonely.com.pk /etc/nginx/sites-available/

# Create symbolic links
sudo ln -s /etc/nginx/sites-available/beta.phonely.com.pk /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.phonely.com.pk /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/ai.phonely.com.pk /etc/nginx/sites-enabled/

# Update frontend path in beta.phonely.com.pk
sudo nano /etc/nginx/sites-available/beta.phonely.com.pk
# Change: root /var/www/phonely/frontend/dist;
# To: root /home/phonely/Phonely/frontend/dist;

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 7. Setup SSL Certificates

```bash
# Get SSL certificates for all domains
sudo certbot --nginx -d beta.phonely.com.pk
sudo certbot --nginx -d api.phonely.com.pk
sudo certbot --nginx -d ai.phonely.com.pk

# Test auto-renewal
sudo certbot renew --dry-run
```

### 8. Configure Firewall

```bash
# Allow necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
sudo ufw status
```

### 9. Setup PM2 Startup

```bash
# Save PM2 configuration
pm2 save

# Generate startup script
pm2 startup
# Copy and run the command it outputs

# Verify services
pm2 status
```

## ✅ Verification

Test each service:

### Frontend
```bash
curl https://beta.phonely.com.pk
# Should return HTML
```

### Backend
```bash
curl https://api.phonely.com.pk/health
# Should return: {"status":"success","message":"Server is healthy"}
```

### AI Service
```bash
curl https://ai.phonely.com.pk/health
# Should return: {"status":"healthy"}
```

## 📊 Monitoring

### View Logs
```bash
# PM2 logs
pm2 logs

# Backend logs
pm2 logs phonely-backend

# AI service logs
pm2 logs phonely-ai

# Nginx logs
sudo tail -f /var/log/nginx/api.phonely.com.pk.access.log
sudo tail -f /var/log/nginx/api.phonely.com.pk.error.log
```

### Monitor Resources
```bash
pm2 monit
```

### Service Status
```bash
pm2 status
sudo systemctl status mongod
sudo systemctl status redis-server
sudo systemctl status nginx
```

## 🔄 Updating Application

```bash
cd ~/Phonely

# Pull latest changes
git pull origin main

# Redeploy
cd deployment
./deploy.sh

# Restart services
pm2 restart all
```

## 🐛 Troubleshooting

### Backend not connecting to MongoDB
```bash
sudo systemctl status mongod
# Check if MongoDB is running
```

### Frontend not loading
```bash
# Check if build completed
ls -la ~/Phonely/frontend/dist

# Check Nginx configuration
sudo nginx -t
```

### AI service failing
```bash
# Check Python dependencies
cd ~/Phonely/crew-ai-service/phonely_ai
uv sync

# Check OPENAI_API_KEY
cat .env | grep OPENAI
```

### SSL certificate issues
```bash
# Renew certificates
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

## 🔐 Security Best Practices

1. **Change default ports** for MongoDB and Redis (optional)
2. **Use strong JWT_SECRET** (generate with: `openssl rand -hex 32`)
3. **Enable MongoDB authentication**
4. **Regular backups** of MongoDB database
5. **Monitor logs** for suspicious activity
6. **Keep system updated**: `sudo apt update && sudo apt upgrade`

## 📞 Support

If you encounter issues:
1. Check logs: `pm2 logs`
2. Verify environment variables
3. Check firewall rules: `sudo ufw status`
4. Verify DNS configuration

## 🎉 Success!

Your Phonely marketplace should now be live at:
- 🌐 Frontend: https://beta.phonely.com.pk
- 🔌 API: https://api.phonely.com.pk
- 🤖 AI Service: https://ai.phonely.com.pk
