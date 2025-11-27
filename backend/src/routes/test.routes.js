import express from 'express';
import { sendEmail, sendOTPEmail, sendWelcomeEmail } from '../services/email.service.js';

const router = express.Router();

/**
 * @route   POST /api/v1/test/email
 * @desc    Test email sending
 * @access  Public (for testing only - remove in production)
 */
router.post('/email', async (req, res) => {
  try {
    const { to, subject, text } = req.body;
    
    if (!to) {
      return res.status(400).json({
        status: 'error',
        message: 'Recipient email is required',
      });
    }

    await sendEmail({
      to,
      subject: subject || 'Test Email from Phonely',
      text: text || 'This is a test email!',
      html: `<h1>Test Email</h1><p>${text || 'This is a test email from Phonely!'}</p>`,
    });

    res.status(200).json({
      status: 'success',
      message: 'Test email sent successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to send email',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/v1/test/otp-email
 * @desc    Test OTP email
 * @access  Public (for testing only)
 */
router.post('/otp-email', async (req, res) => {
  try {
    const { to, name } = req.body;
    
    if (!to) {
      return res.status(400).json({
        status: 'error',
        message: 'Recipient email is required',
      });
    }

    const testOTP = Math.floor(100000 + Math.random() * 900000).toString();

    await sendOTPEmail(to, testOTP, name || 'Test User');

    res.status(200).json({
      status: 'success',
      message: 'OTP email sent successfully',
      otp: testOTP, // Only for testing!
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to send OTP email',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/v1/test/welcome-email
 * @desc    Test welcome email
 * @access  Public (for testing only)
 */
router.post('/welcome-email', async (req, res) => {
  try {
    const { to, name } = req.body;
    
    if (!to) {
      return res.status(400).json({
        status: 'error',
        message: 'Recipient email is required',
      });
    }

    await sendWelcomeEmail(to, name || 'Test User');

    res.status(200).json({
      status: 'success',
      message: 'Welcome email sent successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to send welcome email',
      error: error.message,
    });
  }
});

export default router;
