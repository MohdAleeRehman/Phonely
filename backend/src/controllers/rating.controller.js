import Rating from '../models/Rating.model.js';
import Listing from '../models/Listing.model.js';
import Chat from '../models/Chat.model.js';
import { asyncHandler, AppError } from '../middleware/error.middleware.js';

// @desc    Create a new rating
// @route   POST /api/ratings
// @access  Private
export const createRating = asyncHandler(async (req, res, next) => {
  const { ratedUserId, listingId, rating, review, transactionType } = req.body;

  // Validate required fields
  if (!ratedUserId || !listingId || !rating || !transactionType) {
    return next(new AppError('Please provide all required fields', 400));
  }

  // Check if user is trying to rate themselves
  if (ratedUserId === req.user.id) {
    return next(new AppError('You cannot rate yourself', 400));
  }

  // Check if listing exists
  const listing = await Listing.findById(listingId);
  if (!listing) {
    return next(new AppError('Listing not found', 404));
  }

  // Check if users have had a chat about this listing
  const chat = await Chat.findOne({
    listing: listingId,
    participants: { $all: [req.user.id, ratedUserId] },
  });

  if (!chat) {
    return next(
      new AppError(
        'You can only rate users you have communicated with about this listing',
        403
      )
    );
  }

  // Check if user has already rated this person for this listing
  const existingRating = await Rating.findOne({
    rater: req.user.id,
    ratedUser: ratedUserId,
    listing: listingId,
  });

  if (existingRating) {
    return next(
      new AppError('You have already rated this user for this listing', 400)
    );
  }

  // Create rating
  const newRating = await Rating.create({
    rater: req.user.id,
    ratedUser: ratedUserId,
    listing: listingId,
    rating,
    review,
    transactionType,
  });

  // Populate the rating
  await newRating.populate([
    { path: 'rater', select: 'name avatar' },
    { path: 'ratedUser', select: 'name avatar' },
    { path: 'listing', select: 'title images' },
  ]);

  res.status(201).json({
    success: true,
    data: {
      rating: newRating,
    },
  });
});

// @desc    Get ratings for a specific user
// @route   GET /api/ratings/user/:userId
// @access  Public
export const getUserRatings = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const ratings = await Rating.find({ ratedUser: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('rater', 'name avatar')
    .populate('listing', 'title images');

  const total = await Rating.countDocuments({ ratedUser: userId });

  res.status(200).json({
    success: true,
    data: {
      ratings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// @desc    Get user's given ratings
// @route   GET /api/ratings/my-ratings
// @access  Private
export const getMyRatings = asyncHandler(async (req, res, next) => {
  const ratings = await Rating.find({ rater: req.user.id })
    .sort({ createdAt: -1 })
    .populate('ratedUser', 'name avatar')
    .populate('listing', 'title images');

  res.status(200).json({
    success: true,
    data: {
      ratings,
    },
  });
});

// @desc    Check if user can rate another user for a listing
// @route   GET /api/ratings/can-rate/:listingId/:userId
// @access  Private
export const canRateUser = asyncHandler(async (req, res, next) => {
  const { listingId, userId } = req.params;

  // Check if user is trying to rate themselves
  if (userId === req.user.id) {
    return res.status(200).json({
      success: true,
      data: {
        canRate: false,
        reason: 'Cannot rate yourself',
      },
    });
  }

  // Check if listing exists
  const listing = await Listing.findById(listingId);
  if (!listing) {
    return res.status(200).json({
      success: true,
      data: {
        canRate: false,
        reason: 'Listing not found',
      },
    });
  }

  // Check if users have had a chat about this listing
  const chat = await Chat.findOne({
    listing: listingId,
    participants: { $all: [req.user.id, userId] },
  });

  if (!chat) {
    return res.status(200).json({
      success: true,
      data: {
        canRate: false,
        reason: 'No conversation found',
      },
    });
  }

  // Check if user has already rated this person for this listing
  const existingRating = await Rating.findOne({
    rater: req.user.id,
    ratedUser: userId,
    listing: listingId,
  });

  if (existingRating) {
    return res.status(200).json({
      success: true,
      data: {
        canRate: false,
        reason: 'Already rated',
        rating: existingRating,
      },
    });
  }

  res.status(200).json({
    success: true,
    data: {
      canRate: true,
    },
  });
});

// @desc    Delete a rating
// @route   DELETE /api/ratings/:id
// @access  Private
export const deleteRating = asyncHandler(async (req, res, next) => {
  const rating = await Rating.findById(req.params.id);

  if (!rating) {
    return next(new AppError('Rating not found', 404));
  }

  // Check if user is the rater or an admin
  if (rating.rater.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError('You are not authorized to delete this rating', 403)
    );
  }

  await rating.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});
