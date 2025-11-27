import { asyncHandler, AppError } from '../middleware/error.middleware.js';
import User from '../models/User.model.js';
import Listing from '../models/Listing.model.js';
import { bucket } from '../config/firebase.js';

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/users/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get user's listing counts
  const activeListings = await Listing.countDocuments({
    seller: user._id,
    status: 'active',
  });

  const soldListings = await Listing.countDocuments({
    seller: user._id,
    status: 'sold',
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        ...user.toObject(),
        activeListings,
        soldListings,
      },
    },
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/users/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const {
    name,
    avatar,
    location,
    preferences,
  } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Update fields
  if (name) user.name = name;
  if (avatar) user.avatar = avatar;
  if (location) {
    if (location.city) user.location.city = location.city;
    if (location.country) user.location.country = location.country;
    if (location.coordinates) {
      user.location.coordinates = {
        type: 'Point',
        coordinates: location.coordinates,
      };
    }
  }
  if (preferences) {
    user.preferences = {
      ...user.preferences,
      ...preferences,
    };
  }

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: {
      user: user.toObject(),
    },
  });
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/v1/users/account
 * @access  Private
 */
export const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Soft delete - deactivate account
  user.isActive = false;
  await user.save();

  // Optional: Remove all active listings
  await Listing.updateMany(
    { seller: user._id, status: 'active' },
    { status: 'removed' }
  );

  res.status(200).json({
    status: 'success',
    message: 'Account deactivated successfully',
  });
});

/**
 * @desc    Get current user's listings
 * @route   GET /api/v1/users/my-listings
 * @access  Private
 */
export const getMyListings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = { seller: req.user._id };
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const listings = await Listing.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('seller', 'name avatar verified');

  const total = await Listing.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: listings.length,
    data: {
      listings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    },
  });
});

/**
 * @desc    Get user by ID (public profile)
 * @route   GET /api/v1/users/:id
 * @access  Public
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    'name avatar location verified verificationBadge ratings activeListings soldItems createdAt'
  );

  if (!user || !user.isActive) {
    throw new AppError('User not found', 404);
  }

  // Get user's active listings
  const listings = await Listing.find({
    seller: user._id,
    status: 'active',
  })
    .select('title price images condition createdAt')
    .sort({ createdAt: -1 })
    .limit(6);

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        ...user.toObject(),
        listings,
      },
    },
  });
});
