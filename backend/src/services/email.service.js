import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Export function to check email configuration status
export const checkEmailConfig = () => {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not configured in .env file');
    return false;
  }
  console.log('✅ Email service (Resend) is ready to send messages');
  console.log(`📧 Sending from: ${process.env.FROM_EMAIL || 'noreply@phonely.com.pk'}`);
  return true;
};

/**
 * Send an email using Resend
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body (optional)
 * @param {string} options.html - HTML body
 * @returns {Promise<Object>} Email info
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.FROM_NAME || 'Phonely'} <${process.env.FROM_EMAIL || 'noreply@phonely.com.pk'}>`,
      to: [to],
      subject,
      html,
      ...(text && { text }), // Add text only if provided
    });

    if (error) {
      console.error('❌ Error sending email via Resend:', error);
      throw error;
    }

    console.log('✉️ Email sent successfully via Resend:', data.id);
    return data;
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
        .logo { width: 80px; height: 80px; margin: 0 auto 15px; display: block; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://beta.phonely.com.pk/phonely-p-logo-no-bg.png" alt="Phonely" class="logo" />
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
        .logo { width: 80px; height: 80px; margin: 0 auto 15px; display: block; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .feature-box { background: white; border-radius: 8px; padding: 15px; margin: 10px 0; border-left: 4px solid #667eea; }
        .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://beta.phonely.com.pk/phonely-p-logo-no-bg.png" alt="Phonely" class="logo" />
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
        .logo { width: 80px; height: 80px; margin: 0 auto 15px; display: block; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .listing-card { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .listing-image { width: 100%; max-width: 400px; height: auto; border-radius: 8px; margin: 10px 0; display: block; }
        .price { font-size: 28px; color: #667eea; font-weight: bold; margin: 15px 0; }
        .listing-details { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0; }
        .detail-label { font-weight: bold; color: #666; }
        .detail-value { color: #333; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://beta.phonely.com.pk/phonely-p-logo-no-bg.png" alt="Phonely" class="logo" />
          <h1>🎉 Listing Published!</h1>
        </div>
        <div class="content">
          <h2>Hi ${name}! 👋</h2>
          <p>Great news! Your listing is now live on Phonely and ready for buyers to discover.</p>
          
          <div class="listing-card">
            ${listing.images && listing.images[0] ? `<img src="${typeof listing.images[0] === 'string' ? listing.images[0] : listing.images[0].url}" alt="${listing.title}" class="listing-image" />` : ''}
            <h3>${listing.title}</h3>
            <div class="price">Rs. ${listing.price?.toLocaleString('en-PK')} PKR</div>
            
            <div class="listing-details">
              ${listing.phone ? `
                <div class="detail-row">
                  <span class="detail-label">📱 Brand:</span>
                  <span class="detail-value">${listing.phone.brand || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">📲 Model:</span>
                  <span class="detail-value">${listing.phone.model || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">💾 Storage:</span>
                  <span class="detail-value">${listing.phone.storage || 'N/A'}</span>
                </div>
              ` : ''}
              ${listing.condition ? `
                <div class="detail-row">
                  <span class="detail-label">✨ Condition:</span>
                  <span class="detail-value">${listing.condition.charAt(0).toUpperCase() + listing.condition.slice(1)}</span>
                </div>
              ` : ''}
              ${listing.location ? `
                <div class="detail-row">
                  <span class="detail-label">📍 Location:</span>
                  <span class="detail-value">${listing.location.city || 'N/A'}${listing.location.area ? ', ' + listing.location.area : ''}</span>
                </div>
              ` : ''}
            </div>
            
            <p style="color: #666; margin: 15px 0;">${listing.description?.substring(0, 200)}${listing.description?.length > 200 ? '...' : ''}</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/listings/${listing._id}" class="button">View Your Listing</a>
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
 * Send admin OTP email
 * @param {string} email - Admin email
 * @param {string} otp - One-time password
 * @param {string} name - Admin name
 */
export const sendAdminOTPEmail = async (email, otp, name = 'Admin') => {
  const subject = '🔒 Admin Login OTP - Phonely';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .logo { width: 80px; height: 80px; margin: 0 auto 15px; display: block; filter: brightness(0) invert(1); }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; border: 3px solid #ef4444; border-radius: 8px; padding: 30px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 48px; font-weight: bold; color: #ef4444; letter-spacing: 8px; font-family: monospace; }
        .warning-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://beta.phonely.com.pk/phonely-p-logo-no-bg.png" alt="Phonely" class="logo" />
          <h1>🔒 Admin Authentication</h1>
          <p>Secure access verification</p>
        </div>
        <div class="content">
          <h2>Hi ${name}! 👋</h2>
          <p>You are attempting to log in to the <strong>Phonely Admin Panel</strong>.</p>
          <p>For security reasons, please use the OTP code below to complete your login:</p>
          
          <div class="otp-box">
            <p style="margin: 0; color: #666; font-size: 14px; text-transform: uppercase;">Your Admin OTP Code</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">Valid for 5 minutes</p>
          </div>
          
          <div class="warning-box">
            <p style="margin: 0;"><strong>⚠️ Security Notice:</strong></p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
              <li>This code expires in <strong>5 minutes</strong></li>
              <li>Never share this code with anyone</li>
              <li>If you didn't request this, secure your account immediately</li>
              <li>This is an admin-level access attempt</li>
            </ul>
          </div>
          
          <p style="margin-top: 30px;">If you didn't attempt to log in, please change your password immediately and contact support.</p>
          
          <p>Stay secure! 🛡️</p>
          <p>Best regards,<br>The Phonely Security Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Phonely. All rights reserved.</p>
          <p>This is an automated security email. Please do not reply.</p>
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
        .logo-image {
          width: 80px;
          height: 80px;
          margin: 0 auto 15px;
          display: block;
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
            <img src="https://beta.phonely.com.pk/phonely-p-logo-no-bg.png" alt="Phonely" class="logo-image" />
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
  sendAdminOTPEmail,
};

