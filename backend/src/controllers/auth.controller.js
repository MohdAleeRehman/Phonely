import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { asyncHandler, AppError } from '../middleware/error.middleware.js';
import User from '../models/User.model.js';
import { sendVerificationEmail, sendAdminOTPEmail } from '../services/email.service.js';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, city } = req.body;

  // Validate input
  if (!name || !email || !phone || !password || !city) {
    throw new AppError('Please provide all required fields', 400);
  }

  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) {
    throw new AppError('User with this email or phone already exists', 400);
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create user
  const user = await User.create({
    name,
    email,
    phone,
    password,
    location: { city },
    verificationToken,
    verificationTokenExpiry,
  });

  // Send verification email
  try {
    await sendVerificationEmail(email, name, verificationToken);
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError);
    // Don't fail registration if email fails, user can request resend
  }

  // Generate tokens
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.status(201).json({
    status: 'success',
    message: 'Registration successful! Please check your email to verify your account.',
    token,
    refreshToken,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        verified: user.verified,
        city: user.location?.city || '',
        role: user.role,
        createdAt: user.createdAt,
      },
    },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  // Find user and include password field
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid credentials', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated', 403);
  }

  // If admin user, send OTP instead of token
  if (user.role === 'admin') {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Update last active and store OTP with 5-minute expiry
    user.lastActive = Date.now();
    user.adminOtp = {
      code: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      attempts: 0,
    };
    await user.save();

    // Send OTP via email
    try {
      await sendAdminOTPEmail(user.email, otp, user.name);
    } catch (emailError) {
      console.error('Failed to send admin OTP email:', emailError);
      throw new AppError('Failed to send OTP. Please try again.', 500);
    }

    return res.status(200).json({
      status: 'success',
      message: 'OTP sent to your email. Please verify to complete login.',
      data: {
        requiresOtp: true,
        email: user.email,
        userId: user._id,
      },
    });
  }

  // For regular users, update last active and generate tokens
  user.lastActive = Date.now();
  await user.save();

  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    token,
    refreshToken,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        verified: user.verified,
        city: user.location?.city || '',
        role: user.role,
        createdAt: user.createdAt,
      },
    },
  });
});

/**
 * @desc    Verify admin OTP
 * @route   POST /api/v1/auth/verify-admin-otp
 * @access  Public
 */
export const verifyAdminOTP = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;

  // Validate input
  if (!userId || !otp) {
    throw new AppError('User ID and OTP are required', 400);
  }

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if user is admin
  if (user.role !== 'admin') {
    throw new AppError('Unauthorized access', 403);
  }

  // Check if OTP exists and not expired
  if (!user.adminOtp?.code || !user.adminOtp?.expiresAt) {
    throw new AppError('No OTP found. Please request a new one.', 400);
  }

  if (new Date() > user.adminOtp.expiresAt) {
    // Clear expired OTP
    user.adminOtp = { code: null, expiresAt: null, attempts: 0 };
    await user.save();
    throw new AppError('OTP has expired. Please request a new one.', 400);
  }

  // Check max attempts (5 attempts)
  if (user.adminOtp.attempts >= 5) {
    user.adminOtp = { code: null, expiresAt: null, attempts: 0 };
    await user.save();
    throw new AppError('Maximum OTP attempts exceeded. Please request a new one.', 400);
  }

  // Verify OTP
  if (user.adminOtp.code !== otp) {
    user.adminOtp.attempts += 1;
    await user.save();
    throw new AppError(`Invalid OTP. ${5 - user.adminOtp.attempts} attempts remaining.`, 401);
  }

  // OTP verified successfully - clear OTP and generate tokens
  user.adminOtp = { code: null, expiresAt: null, attempts: 0 };
  await user.save();

  // Generate tokens
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.status(200).json({
    status: 'success',
    message: 'Admin login successful',
    token,
    refreshToken,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        verified: user.verified,
        city: user.location?.city || '',
        role: user.role,
        createdAt: user.createdAt,
      },
    },
  });
});

/**
 * @desc    Verify email with token
 * @route   GET /api/v1/auth/verify-email/:token
 * @access  Public
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    throw new AppError('Verification token is required', 400);
  }

  // Find user with this verification token
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpiry: { $gt: Date.now() }, // Token not expired
  });

  if (!user) {
    throw new AppError('Invalid or expired verification token', 400);
  }

  // Update user verification status
  user.verified = true;
  user.verificationToken = null;
  user.verificationTokenExpiry = null;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully! You can now log in.',
    data: {
      verified: true,
    },
  });
});

/**
 * @desc    Resend verification email
 * @route   POST /api/v1/auth/resend-verification
 * @access  Public
 */
export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Please provide email address', 400);
  }

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('No account found with this email', 404);
  }

  if (user.verified) {
    throw new AppError('Account is already verified', 400);
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  user.verificationToken = verificationToken;
  user.verificationTokenExpiry = verificationTokenExpiry;
  await user.save();

  // Send verification email
  await sendVerificationEmail(email, user.name, verificationToken);

  res.status(200).json({
    status: 'success',
    message: 'Verification email sent! Please check your inbox.',
  });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Generate new access token
    const newToken = generateToken(decoded.id);

    res.status(200).json({
      status: 'success',
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    throw new AppError('Invalid or expired refresh token', 401);
  }
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  // In a more advanced setup, you would invalidate the token here
  // For now, client-side token removal is sufficient

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});
