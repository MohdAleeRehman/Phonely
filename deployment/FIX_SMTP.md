# Fix SMTP Connection Timeout on DigitalOcean Droplet

## Problem
```
❌ Email service configuration error: Error: Connection timeout
code: 'ETIMEDOUT', command: 'CONN'
```

This happens because:
1. **DigitalOcean blocks port 25** by default to prevent spam
2. Some cloud providers also throttle port 587
3. Firewall might be blocking outbound SMTP connections

## Solution Options

### Option 1: Use Zoho's SSL Port (RECOMMENDED) ✅

Zoho Mail supports port **465** with SSL, which is less likely to be blocked.

**Update your `.env` file on the droplet:**

```bash
# Email (Zoho Mail - Use SSL Port 465)
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_USER=noreply@phonely.com.pk
SMTP_PASS=wUJEaSwNcuGB
FROM_EMAIL=noreply@phonely.com.pk
FROM_NAME=Phonely
```

**Then update the email service code to use SSL:**

Edit `/home/ali/Phonely/backend/src/services/email.service.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.zoho.com',
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2'
  }
});
```

**Restart PM2:**
```bash
pm2 restart phonely-backend
pm2 logs phonely-backend
```

---

### Option 2: Check Firewall Rules

```bash
# Check if UFW is blocking SMTP ports
sudo ufw status

# If active, allow SMTP ports
sudo ufw allow out 587/tcp
sudo ufw allow out 465/tcp
sudo ufw reload
```

---

### Option 3: Test Connectivity

Test if you can reach Zoho's SMTP server:

```bash
# Test port 587
telnet smtp.zoho.com 587

# Test port 465
telnet smtp.zoho.com 465

# If telnet not installed
nc -zv smtp.zoho.com 587
nc -zv smtp.zoho.com 465
```

**Expected output:**
```
Connection to smtp.zoho.com 465 port [tcp/smtps] succeeded!
```

**If connection fails:**
- Port is blocked by DigitalOcean
- Need to contact DigitalOcean support or use Option 4

---

### Option 4: Use DigitalOcean's SMTP Relay (If above fails)

DigitalOcean recommends using third-party SMTP services or their managed email service.

**Alternative: Use SendGrid (Free tier available)**

1. Sign up at https://sendgrid.com (Free: 100 emails/day)
2. Get API key
3. Update `.env`:

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=YOUR_SENDGRID_API_KEY
FROM_EMAIL=noreply@phonely.com.pk
FROM_NAME=Phonely
```

---

### Option 5: Enable SMTP on DigitalOcean (Request Unlock)

DigitalOcean might require you to request SMTP access:

1. Go to DigitalOcean Support
2. Request: "Enable SMTP ports (25, 587, 465) for my droplet"
3. Provide: Your use case (transactional emails for marketplace app)
4. Wait for approval (usually 24-48 hours)

---

## Quick Test Script

Create a test file to verify SMTP:

```bash
cd ~/Phonely/backend
nano test-email.js
```

Paste this:

```javascript
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: './src/.env' });

console.log('Testing SMTP with:');
console.log('Host:', process.env.SMTP_HOST);
console.log('Port:', process.env.SMTP_PORT);
console.log('User:', process.env.SMTP_USER);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === '465', // true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Test connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Failed:', error);
    process.exit(1);
  } else {
    console.log('✅ SMTP Connection Successful!');
    
    // Try sending a test email
    transporter.sendMail({
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: 'your-email@example.com', // Replace with your email
      subject: 'Test Email from Phonely',
      text: 'If you receive this, SMTP is working!',
      html: '<h1>SMTP Test</h1><p>If you receive this, SMTP is working!</p>',
    }, (err, info) => {
      if (err) {
        console.error('❌ Send Failed:', err);
        process.exit(1);
      } else {
        console.log('✅ Email Sent:', info.messageId);
        console.log('📧 Response:', info.response);
        process.exit(0);
      }
    });
  }
});
```

Run test:
```bash
node test-email.js
```

---

## Recommended Solution (Step-by-Step)

**1. Update backend/.env on droplet:**

```bash
cd ~/Phonely/backend/src
nano .env
```

Change:
```bash
SMTP_PORT=587  # Change this
```

To:
```bash
SMTP_PORT=465  # Use SSL port
```

**2. Update email service:**

```bash
nano ~/Phonely/backend/src/services/email.service.js
```

Change line 11:
```javascript
secure: false, // Change this
```

To:
```javascript
secure: process.env.SMTP_PORT === '465', // Auto-detect SSL based on port
```

**3. Restart backend:**

```bash
pm2 restart phonely-backend
pm2 logs phonely-backend --lines 50
```

**4. Test registration/login:**

Try creating an account or requesting password reset to test email sending.

---

## Verification

If successful, you should see:

```
✅ Email service is ready to send messages
📧 Sending from: noreply@phonely.com.pk
```

If still failing, try SendGrid (Option 4) as DigitalOcean has strict SMTP policies.

---

## Why Port 465 Works Better

- **Port 25**: Blocked by most cloud providers (spam prevention)
- **Port 587**: Often throttled or requires special permission
- **Port 465**: SSL/TLS encrypted from start, more reliable on cloud servers

Most cloud providers (AWS, DigitalOcean, Azure) prefer port 465 for security reasons.
