# Zoho Mail Configuration for Phonely

## ✅ Email Setup Complete

**Professional Email**: `noreply@phonely.com.pk`

## 📧 SMTP Configuration

Add these to your `backend/.env` file:

```bash
# Email (Zoho Mail - Professional Domain Email)
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=noreply@phonely.com.pk
SMTP_PASS=wUJEaSwNcuGB
FROM_EMAIL=noreply@phonely.com.pk
FROM_NAME=Phonely
```

## 🔧 Zoho Server Details

### Outgoing Mail (SMTP)
- **Host**: smtp.zoho.com
- **Port**: 587 (TLS) or 465 (SSL)
- **Authentication**: Required
- **Username**: noreply@phonely.com.pk
- **App Password**: wUJEaSwNcuGB

### Incoming Mail (IMAP)
- **Host**: imap.zoho.com
- **Port**: 993
- **SSL**: Required
- **Username**: noreply@phonely.com.pk

### Incoming Mail (POP3)
- **Host**: pop.zoho.com
- **Port**: 995
- **SSL**: Required
- **Username**: noreply@phonely.com.pk

## 🚀 Testing

After updating your `.env`, restart the backend and test:

```bash
cd backend
npm run dev
```

Create a new user account and check if the verification email arrives from `noreply@phonely.com.pk`

## ⚠️ Important Notes

1. **App Password**: The password `wUJEaSwNcuGB` is an app-specific password, not your regular Zoho password
2. **Free Plan**: You're on Zoho Free plan with 5 users maximum
3. **Daily Limit**: Zoho Free allows up to 100 emails per day
4. **Domain Verified**: Your domain phonely.com.pk is verified and configured

## 📝 Email Types Being Sent

Your backend currently sends:
- ✉️ Email verification (signup)
- ✉️ Password reset emails
- ✉️ Listing approval notifications
- ✉️ Welcome emails

All will now come from: **Phonely <noreply@phonely.com.pk>**

## 🔒 Security

- Keep the app password secure
- Never commit `.env` file to Git (already in .gitignore)
- Rotate app password periodically
- Monitor email usage in Zoho dashboard

---

**Last Updated**: 27 November 2025
