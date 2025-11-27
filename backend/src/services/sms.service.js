import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// In-memory OTP storage (in production, use Redis with TTL)
const otpStore = new Map();

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP code
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via Twilio SMS
 * @param {string} phoneNumber - Recipient phone number (must be in E.164 format)
 * @returns {Promise<Object>} Twilio message response
 */
export const sendOTP = async (phoneNumber) => {
  try {
    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with 10-minute expiry
    otpStore.set(phoneNumber, {
      code: otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0,
    });

    // Send SMS via Twilio
    const message = await client.messages.create({
      body: `Your Phonely verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nDo not share this code with anyone.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    console.log(`📱 OTP sent to ${phoneNumber} - Message SID: ${message.sid}`);
    return {
      success: true,
      messageSid: message.sid,
      status: message.status,
    };
  } catch (error) {
    console.error(`❌ Failed to send OTP to ${phoneNumber}:`, error.message);
    
    // Provide helpful error messages
    if (error.code === 21211) {
      throw new Error('Invalid phone number format. Please use E.164 format (e.g., +923001234567)');
    } else if (error.code === 21608) {
      throw new Error('Phone number is not verified. For Twilio trial accounts, verify this number in the Twilio Console.');
    } else if (error.code === 20003) {
      throw new Error('Twilio authentication failed. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env');
    }
    
    throw error;
  }
};

/**
 * Verify OTP code
 * @param {string} phoneNumber - Phone number to verify
 * @param {string} code - OTP code to verify
 * @returns {Promise<boolean>} True if OTP is valid
 */
export const verifyOTPCode = async (phoneNumber, code) => {
  try {
    const otpData = otpStore.get(phoneNumber);

    if (!otpData) {
      console.log(`❌ No OTP found for ${phoneNumber}`);
      return false;
    }

    // Check if OTP has expired
    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(phoneNumber);
      console.log(`❌ OTP expired for ${phoneNumber}`);
      return false;
    }

    // Check max attempts (prevent brute force)
    if (otpData.attempts >= 5) {
      otpStore.delete(phoneNumber);
      console.log(`❌ Too many attempts for ${phoneNumber}`);
      return false;
    }

    // Increment attempts
    otpData.attempts += 1;

    // Verify code
    if (otpData.code === code) {
      otpStore.delete(phoneNumber); // Remove OTP after successful verification
      console.log(`✅ OTP verified successfully for ${phoneNumber}`);
      return true;
    }

    console.log(`❌ Invalid OTP for ${phoneNumber} (Attempt ${otpData.attempts}/5)`);
    return false;
  } catch (error) {
    console.error(`❌ Error verifying OTP for ${phoneNumber}:`, error.message);
    return false;
  }
};

/**
 * Resend OTP (with rate limiting)
 * @param {string} phoneNumber - Phone number
 * @returns {Promise<Object>} Twilio message response
 */
export const resendOTP = async (phoneNumber) => {
  const otpData = otpStore.get(phoneNumber);
  
  // Allow resend only if previous OTP expired or doesn't exist
  if (otpData && Date.now() < otpData.expiresAt) {
    const remainingTime = Math.ceil((otpData.expiresAt - Date.now()) / 1000 / 60);
    throw new Error(`Please wait ${remainingTime} minutes before requesting a new OTP`);
  }
  
  return sendOTP(phoneNumber);
};

// Clean up expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [phone, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(phone);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 Cleaned up ${cleaned} expired OTP(s)`);
  }
}, 5 * 60 * 1000);
