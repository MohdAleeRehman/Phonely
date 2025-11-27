import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter for Zoho Mail
// Professional email: noreply@phonely.com.pk
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.zoho.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2'
  }
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service configuration error:', error);
  } else {
    console.log('✅ Email service is ready to send messages');
    console.log(`📧 Sending from: ${process.env.SMTP_USER || 'noreply@phonely.com.pk'}`);
  }
});

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body (optional)
 * @param {string} options.html - HTML body
 * @returns {Promise<Object>} Email info
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const mailOptions = {
      from: `${process.env.FROM_NAME || 'Phonely'} <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✉️ Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

/**
 * Send OTP verification email
 * @param {string} email - User email
 * @param {string} otp - One-time password
 * @param {string} name - User name
 */
export const sendOTPEmail = async (email, otp, name = 'User') => {
  const subject = 'Verify Your Email - Phonely';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📱 Phonely</h1>
          <p>Your trusted phone marketplace</p>
        </div>
        <div class="content">
          <h2>Hi ${name}! 👋</h2>
          <p>Thank you for signing up with Phonely. To complete your registration, please verify your email address using the OTP below:</p>
          
          <div class="otp-box">
            <p style="margin: 0; color: #666; font-size: 14px;">Your verification code is:</p>
            <div class="otp-code">${otp}</div>
          </div>
          
          <p><strong>Important:</strong></p>
          <ul>
            <li>This code will expire in 10 minutes</li>
            <li>Do not share this code with anyone</li>
            <li>If you didn't request this, please ignore this email</li>
          </ul>
          
          <p>Looking forward to having you in our community!</p>
          <p>Best regards,<br>The Phonely Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Phonely. All rights reserved.</p>
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};

/**
 * Send welcome email after successful registration
 * @param {string} email - User email
 * @param {string} name - User name
 */
export const sendWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to Phonely! 🎉';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .feature-box { background: white; border-radius: 8px; padding: 15px; margin: 10px 0; border-left: 4px solid #667eea; }
        .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to Phonely!</h1>
          <p>You're now part of our community</p>
        </div>
        <div class="content">
          <h2>Hi ${name}! 👋</h2>
          <p>Welcome aboard! We're excited to have you join the Phonely community. Your account is now active and ready to use.</p>
          
          <h3>What you can do now:</h3>
          
          <div class="feature-box">
            <strong>📸 List Your Phone</strong>
            <p>Upload high-quality photos and create detailed listings in minutes.</p>
          </div>
          
          <div class="feature-box">
            <strong>🤖 AI-Powered Inspections</strong>
            <p>Get instant device condition analysis and accurate pricing suggestions.</p>
          </div>
          
          <div class="feature-box">
            <strong>💬 Connect with Buyers</strong>
            <p>Chat with potential buyers and negotiate the best deal.</p>
          </div>
          
          <div class="feature-box">
            <strong>🔒 Secure Transactions</strong>
            <p>Buy and sell with confidence using our secure platform.</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="cta-button">Get Started</a>
          </div>
          
          <p style="margin-top: 30px;">Need help? Check out our <a href="#">Help Center</a> or reply to this email.</p>
          
          <p>Happy trading! 🚀</p>
          <p>Best regards,<br>The Phonely Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Phonely. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};

/**
 * Send listing notification email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {Object} listing - Listing details
 */
export const sendListingNotification = async (email, name, listing) => {
  const subject = `Your listing "${listing.title}" is now live! 📱`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .listing-card { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .listing-image { width: 100%; max-width: 300px; border-radius: 8px; margin: 10px 0; }
        .price { font-size: 24px; color: #667eea; font-weight: bold; margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Listing Published!</h1>
        </div>
        <div class="content">
          <h2>Hi ${name}! 👋</h2>
          <p>Great news! Your listing is now live on Phonely and ready for buyers to discover.</p>
          
          <div class="listing-card">
            ${listing.images && listing.images[0] ? `<img src="${listing.images[0]}" alt="Listing" class="listing-image" />` : ''}
            <h3>${listing.title}</h3>
            <div class="price">₹${listing.price?.toLocaleString()}</div>
            <p>${listing.description?.substring(0, 150)}${listing.description?.length > 150 ? '...' : ''}</p>
          </div>
          
          <p><strong>Next steps:</strong></p>
          <ul>
            <li>Share your listing with potential buyers</li>
            <li>Respond promptly to inquiries</li>
            <li>Keep your listing up to date</li>
          </ul>
          
          <p>We'll notify you when someone shows interest in your listing.</p>
          
          <p>Good luck with your sale! 🚀</p>
          <p>Best regards,<br>The Phonely Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Phonely. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};

/**
 * Send email verification link
 * @param {string} email - Recipient email
 * @param {string} name - User name
 * @param {string} verificationToken - Verification token
 * @returns {Promise<Object>} Email info
 */
export const sendVerificationEmail = async (email, name, verificationToken) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  const subject = 'Verify Your Phonely Account';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .content {
          background: white;
          padding: 30px;
          border-radius: 10px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          color: #667eea;
          margin-bottom: 10px;
        }
        .verify-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white !important;
          padding: 15px 40px;
          text-decoration: none;
          border-radius: 50px;
          font-weight: bold;
          margin: 20px 0;
          text-align: center;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 12px;
        }
        .info-box {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #667eea;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <div class="header">
            <div class="logo">📱 Phonely</div>
            <h2 style="color: #333; margin: 0;">Verify Your Email Address</h2>
          </div>
          
          <p>Hi <strong>${name}</strong>,</p>
          
          <p>Welcome to Phonely! 🎉</p>
          
          <p>Thank you for signing up. To complete your registration and start buying or selling phones, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${verificationLink}" class="verify-button">Verify Email Address</a>
          </div>
          
          <div class="info-box">
            <p style="margin: 0;"><strong>⏰ This link will expire in 24 hours</strong></p>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${verificationLink}</p>
          
          <p>If you didn't create an account with Phonely, you can safely ignore this email.</p>
          
          <p>Best regards,<br>The Phonely Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Phonely. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};

export default {
  sendEmail,
  sendOTPEmail,
  sendWelcomeEmail,
  sendListingNotification,
  sendVerificationEmail,
};

