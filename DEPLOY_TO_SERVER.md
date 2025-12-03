# Server Deployment Guide - Phonely

This guide will help you deploy the latest changes to your production server.

## 🚀 Quick Deployment (5 minutes)

### Step 1: SSH into Your Server
```bash
ssh your-username@your-server-ip
# or
ssh your-username@phonely.com.pk
```

### Step 2: Navigate to Project Directory
```bash
cd ~/Phonely
# or wherever your Phonely project is located
```

### Step 3: Pull Latest Changes
```bash
# Ensure you're on main branch
git branch

# Pull latest code
git pull origin main
```

### Step 4: Update Backend
```bash
cd backend

# Install new dependencies (if any)
npm install

# Restart the backend service
pm2 restart phonely-backend
# or
pm2 restart all

# Check status
pm2 status
pm2 logs phonely-backend --lines 50
```

### Step 5: Update Frontend
```bash
cd ../frontend

# Install new dependencies (if any)
npm install

# Build for production
npm run build

# If using nginx, the build files are in dist/
# Copy to nginx directory if needed
# sudo cp -r dist/* /var/www/phonely/
```

### Step 6: Verify Deployment
```bash
# Check backend logs
pm2 logs phonely-backend --lines 20

# Check if backend is running
curl http://localhost:5000/api/v1/health
# or
curl http://localhost:YOUR_BACKEND_PORT/api/v1/health
```

---

## 📋 What's New in This Update

### Admin OTP Authentication 🔒
- Admins now receive a 6-digit OTP via email when logging in
- OTP expires in 5 minutes
- Maximum 5 verification attempts
- Red-themed security email template

### Email Branding 📧
- All emails now include the Phonely logo
- Logo appears in email headers (OTP, welcome, listing notifications)
- Setup guide included for Gmail sender profile image (Gravatar/BIMI)

### Bug Fixes 🐛
- Fixed parallel save error in admin login
- Admin users no longer require city field
- Dashboard null-safety improvements
- Fixed users tab data property
- Fixed JSX syntax errors

### Admin Features ✨
- New analytics endpoints (growth charts, brand stats)
- User details with statistics
- Ban/unban user functionality
- Listing status management

---

## 🔍 Testing After Deployment

### Test Admin OTP Login
1. Visit: `https://phonely.com.pk/login`
2. Login with admin credentials:
   - Email: `mohdaleerehman@gmail.com`
   - Password: `Au_Q3455`
3. Check email for 6-digit OTP
4. Enter OTP to access admin dashboard

### Test Admin Dashboard
1. Navigate to: `https://phonely.com.pk/admin`
2. Check all tabs:
   - Overview (stats cards, recent activity)
   - Users (list, search, pagination)
   - Listings (list, filters, status updates)
3. Verify no console errors

### Test Email Logo
1. Register a new test user
2. Check welcome email
3. Verify Phonely logo appears in email header

---

## 🔧 Troubleshooting

### Backend Not Starting
```bash
# Check PM2 logs
pm2 logs phonely-backend

# Restart with fresh logs
pm2 restart phonely-backend
pm2 flush
pm2 logs phonely-backend
```

### Email Not Sending
```bash
# Check if RESEND_API_KEY is set
cd ~/Phonely/backend
cat .env | grep RESEND

# Check logs for email errors
pm2 logs phonely-backend | grep -i email
```

### Admin Can't Login
```bash
# Re-run admin seeding script
cd ~/Phonely/backend
node src/scripts/seedAdmin.js

# Verify admin user exists
mongosh
use phonely
db.users.findOne({ email: "mohdaleerehman@gmail.com" })
exit
```

### Port Already in Use
```bash
# Find process using port
lsof -i :5000
# or
sudo lsof -i :5000

# Kill process
kill -9 <PID>

# Restart backend
pm2 restart phonely-backend
```

### MongoDB Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB if stopped
sudo systemctl start mongod

# Check connection
mongosh --eval "db.adminCommand('ping')"
```

---

## 🌐 Environment Variables Checklist

Ensure these are set in `backend/.env`:

```env
# Required for OTP emails
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=noreply@phonely.com.pk
FROM_NAME=Phonely
FRONTEND_URL=https://phonely.com.pk

# Database
MONGODB_URI=mongodb://localhost:27017/phonely

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Server
PORT=5000
NODE_ENV=production
```

---

## 📊 Post-Deployment Monitoring

### Check Backend Health
```bash
# CPU and Memory usage
pm2 monit

# Logs in real-time
pm2 logs phonely-backend --lines 100

# Check error logs specifically
pm2 logs phonely-backend --err --lines 50
```

### Check Disk Space
```bash
df -h
```

### Check MongoDB
```bash
mongosh
use phonely
db.stats()
db.users.countDocuments()
db.listings.countDocuments()
exit
```

---

## 🔄 Rollback (If Issues Occur)

If something goes wrong, rollback to previous version:

```bash
cd ~/Phonely

# See recent commits
git log --oneline -5

# Rollback to previous commit
git reset --hard HEAD~1

# Or rollback to specific commit
git reset --hard <commit-hash>

# Rebuild and restart
cd backend
npm install
pm2 restart phonely-backend

cd ../frontend
npm install
npm run build
```

---

## 📞 Support Contacts

If issues persist:
- Check logs: `pm2 logs phonely-backend`
- Check MongoDB: `mongosh` → `use phonely` → `db.users.find()`
- Email service: Verify Resend dashboard (https://resend.com/emails)

---

## ✅ Deployment Checklist

- [ ] SSH into server
- [ ] Pull latest code (`git pull origin main`)
- [ ] Install backend dependencies (`cd backend && npm install`)
- [ ] Restart backend (`pm2 restart phonely-backend`)
- [ ] Install frontend dependencies (`cd frontend && npm install`)
- [ ] Build frontend (`npm run build`)
- [ ] Test admin login with OTP
- [ ] Test admin dashboard (all tabs)
- [ ] Verify emails contain logo
- [ ] Check PM2 status and logs
- [ ] Monitor for 5-10 minutes

---

## 🎉 Success Indicators

✅ **Backend Running**: `pm2 status` shows `online`
✅ **No Errors**: `pm2 logs` shows clean logs
✅ **Admin Login Works**: OTP received and verified
✅ **Dashboard Loads**: All tabs render without errors
✅ **Emails Work**: Logo appears in email templates

---

## 🚨 Emergency Contacts

**Server Issues**:
- Check server logs: `journalctl -xe`
- Check nginx logs: `sudo tail -f /var/log/nginx/error.log`

**Database Issues**:
- MongoDB logs: `sudo tail -f /var/log/mongodb/mongod.log`
- Restart MongoDB: `sudo systemctl restart mongod`

**Email Issues**:
- Resend Dashboard: https://resend.com/emails
- Check API key validity
- Verify FROM_EMAIL domain

---

## 📈 Next Steps (Optional)

1. **Set up Gravatar** for sender profile image (see EMAIL_SENDER_IMAGE_SETUP.md)
2. **Monitor OTP usage** in Resend dashboard
3. **Set up server monitoring** (Uptime Kuma, Netdata)
4. **Configure automated backups** for MongoDB
5. **Set up SSL certificate renewal** (Let's Encrypt)

---

## 🔐 Security Notes

- Admin OTP codes expire in 5 minutes
- Maximum 5 OTP verification attempts
- OTP emails use red security theme
- Never share OTP codes
- Monitor failed login attempts in logs

---

**Deployment Complete!** 🚀

Your Phonely platform is now updated with:
- ✅ Admin OTP authentication
- ✅ Email logo branding
- ✅ Enhanced admin dashboard
- ✅ All bug fixes applied

Test thoroughly and monitor for the first hour after deployment!
