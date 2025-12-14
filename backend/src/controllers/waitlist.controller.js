import Waitlist from '../models/waitlist.model.js';
import { asyncHandler, AppError } from '../middleware/error.middleware.js';
import { sendWaitlistConfirmation } from '../services/email.service.js';

/**
 * @route   POST /api/v1/waitlist
 * @desc    Add email to waitlist
 * @access  Public
 */
export const addToWaitlist = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  // Validate input
  if (!name || !email) {
    throw new AppError('Name and email are required', 400);
  }

  // Check if email already exists
  const existingEntry = await Waitlist.findOne({ email });
  if (existingEntry) {
    throw new AppError('This email is already on the waitlist', 400);
  }

  // Create waitlist entry
  const waitlistEntry = await Waitlist.create({
    name,
    email,
    source: 'landing-page',
  });

  // Send confirmation email (don't wait for it, send in background)
  sendWaitlistConfirmation(email, name).catch((error) => {
    console.error('Failed to send waitlist confirmation email:', error);
    // Don't fail the request if email fails
  });

  res.status(201).json({
    status: 'success',
    data: waitlistEntry,
    message: 'Successfully joined the waitlist',
  });
});

/**
 * @route   GET /api/v1/waitlist
 * @desc    Get all waitlist entries (Admin only)
 * @access  Private/Admin
 */
export const getWaitlist = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  const waitlistEntries = await Waitlist.find()
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await Waitlist.countDocuments();

  res.json({
    status: 'success',
    data: {
      waitlist: waitlistEntries,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
      },
    },
  });
});

/**
 * @route   DELETE /api/v1/waitlist/:id
 * @desc    Remove from waitlist (Admin only)
 * @access  Private/Admin
 */
export const removeFromWaitlist = asyncHandler(async (req, res) => {
  const waitlistEntry = await Waitlist.findByIdAndDelete(req.params.id);

  if (!waitlistEntry) {
    throw new AppError('Waitlist entry not found', 404);
  }

  res.json({
    status: 'success',
    message: 'Successfully removed from waitlist',
  });
});
