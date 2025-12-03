# Email Sender Profile Image Setup Guide

This guide explains how to add your Phonely logo as the sender profile image that appears in Gmail, Outlook, and other email clients.

## Option 1: Gravatar (Easiest - 5 minutes)

Gravatar is a globally recognized avatar service used by Gmail, WordPress, and many other platforms.

### Steps:
1. Go to [Gravatar.com](https://gravatar.com/)
2. Create an account using your **FROM_EMAIL** address (e.g., `noreply@phonely.com.pk`)
3. Upload the `phonely-p.svg` or a PNG/JPG version (convert SVG to PNG first)
4. Set the image as your avatar
5. Wait 24-48 hours for Gmail to cache the image

**Pros:**
- ✅ Free
- ✅ Works across many email clients
- ✅ No technical setup required

**Cons:**
- ⏳ Takes 24-48 hours to propagate
- ❌ Not supported by all email clients

---

## Option 2: BIMI (Brand Indicators for Message Identification)

BIMI is the official standard for displaying brand logos in email clients.

### Requirements:
- ✅ Domain must have DMARC policy set to `quarantine` or `reject`
- ✅ SPF and DKIM records configured
- ✅ Verified Mark Certificate (VMC) from a Certificate Authority (~$1000-1500/year)
- ✅ Logo must be in SVG Tiny PS format

### Steps:

#### 1. Check Current Email Authentication
```bash
# Check if you have DMARC
dig TXT _dmarc.phonely.com.pk

# Check SPF
dig TXT phonely.com.pk

# Check DKIM (Resend should provide this)
dig TXT default._domainkey.phonely.com.pk
```

#### 2. Set up DMARC (if not already done)
Add this DNS TXT record to `_dmarc.phonely.com.pk`:
```
v=DMARC1; p=quarantine; rua=mailto:dmarc@phonely.com.pk; pct=100; adkim=s; aspf=s
```

#### 3. Host Your Logo
- Convert `phonely-p.svg` to **SVG Tiny PS** format
- Host it at: `https://phonely.com.pk/bimi/logo.svg`
- Make sure it's publicly accessible

#### 4. Add BIMI DNS Record
Add this DNS TXT record to `default._bimi.phonely.com.pk`:
```
v=BIMI1; l=https://phonely.com.pk/bimi/logo.svg;
```

#### 5. Get VMC (Optional but recommended)
For Gmail to show the logo, you need a Verified Mark Certificate:
- Contact: DigiCert, Entrust, or other VMC providers
- Cost: ~$1000-1500/year
- They verify your trademark ownership

**Pros:**
- ✅ Official standard
- ✅ Works in Gmail, Yahoo, Fastmail
- ✅ Professional appearance
- ✅ Boosts email trust

**Cons:**
- 💰 Expensive VMC required
- 🔧 Complex technical setup
- ⏳ Takes time to implement

---

## Option 3: Resend Domain Configuration (Free)

Resend allows you to configure a custom sending domain with better deliverability.

### Steps:

1. **Log in to Resend Dashboard**
   - Go to [Resend.com](https://resend.com/domains)

2. **Add Your Domain**
   - Add `phonely.com.pk` as a verified domain
   - Follow their DNS configuration instructions

3. **Configure DNS Records**
   Add the provided DNS records from Resend:
   - SPF record
   - DKIM records
   - DMARC record

4. **Set FROM_EMAIL in .env**
   ```env
   FROM_EMAIL=hello@phonely.com.pk
   # or
   FROM_EMAIL=support@phonely.com.pk
   ```

5. **Create Gravatar for this email**
   - Create Gravatar account with the new email
   - Upload Phonely logo

**Pros:**
- ✅ Better deliverability
- ✅ Professional email address
- ✅ Free (with Gravatar)
- ✅ Works with existing code

**Cons:**
- 🔧 Requires DNS configuration
- ⏳ 24-48 hours for Gravatar propagation

---

## Option 4: Inline Logo Fallback (Immediate)

While waiting for Gravatar/BIMI, the logo already appears **inside the email body** as we've configured:

```html
<img src="https://phonely.com.pk/phonely-p.svg" alt="Phonely" class="logo" />
```

This shows the logo in the email header section that users see when they open the email.

---

## Recommended Approach for Phonely

### Phase 1: Immediate (Today)
✅ **Already Done**: Logo in email body header
```javascript
<img src="${process.env.FRONTEND_URL}/phonely-p.svg" alt="Phonely" />
```

### Phase 2: Quick Win (This Week)
1. **Set up Resend domain** (`phonely.com.pk`)
2. **Configure DNS records** (SPF, DKIM, DMARC)
3. **Create Gravatar** with sender email
4. **Update FROM_EMAIL** to `hello@phonely.com.pk`

### Phase 3: Professional (Later)
1. **Convert logo to SVG Tiny PS**
2. **Set up DMARC policy to quarantine/reject**
3. **Add BIMI DNS record**
4. **Consider VMC** if budget allows ($1000-1500/year)

---

## Quick Start: Gravatar Setup (5 minutes)

1. **Go to**: https://gravatar.com/
2. **Sign up with**: `noreply@phonely.com.pk` (or your FROM_EMAIL)
3. **Upload image**: Convert `phonely-p.svg` to PNG first:
   ```bash
   # On Mac (using built-in tools)
   qlmanage -t -s 500 -o . phonely-p.svg
   
   # Or use online converter
   # Visit: https://cloudconvert.com/svg-to-png
   ```
4. **Set as avatar**: Make it your primary image
5. **Rate as G**: General audience
6. **Wait**: 24-48 hours for Gmail to cache

---

## Testing

After setup, test by sending emails to:
- Gmail account
- Outlook account
- Yahoo account

Check if the logo appears next to the sender name in the inbox list.

---

## Current Configuration

Your emails are sent from:
```
FROM_NAME: Phonely
FROM_EMAIL: noreply@phonely.com.pk (or from .env)
REPLY_TO: noreply@phonely.com.pk (newly added)
```

To see the sender image in Gmail:
1. Set up Gravatar for your FROM_EMAIL address
2. Or implement BIMI with domain verification
3. Or use a verified email service domain

---

## Support Links

- **Gravatar**: https://gravatar.com/
- **BIMI Group**: https://bimigroup.org/
- **Resend Domains**: https://resend.com/domains
- **DMARC Guide**: https://dmarc.org/
- **SVG Tiny PS Converter**: https://github.com/authindicators/svg-ps-converters

---

## Notes

- Gmail prioritizes BIMI over Gravatar (if both exist)
- Outlook has limited BIMI support
- Apple Mail doesn't support BIMI yet
- The logo inside email body (already implemented) works for all clients
- Sender profile image is a nice-to-have, not critical for functionality
