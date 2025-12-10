import { asyncHandler, AppError } from '../middleware/error.middleware.js';
import Listing from '../models/Listing.model.js';
import User from '../models/User.model.js';
import axios from 'axios';

/**
 * @desc    Create a new listing
 * @route   POST /api/v1/listings
 * @access  Private
 */
export const createListing = asyncHandler(async (req, res) => {
  const {
    phone,
    condition,
    conditionDetails,
    price,
    priceNegotiable,
    title,
    description,
    images,
    accessories,
    location,
  } = req.body;

  // Validate required fields
  if (!phone || !condition || !price || !title || !description || !images || !location) {
    throw new AppError('Please provide all required fields', 400);
  }

  // Validate phone object required fields
  if (!phone.brand || !phone.model || !phone.storage) {
    throw new AppError('Phone brand, model, and storage are required', 400);
  }

  // Validate location required fields
  if (!location.city) {
    throw new AppError('City is required in location', 400);
  }

  // Validate images array
  if (!Array.isArray(images) || images.length === 0) {
    throw new AppError('At least one image is required', 400);
  }

  // Validate IMEI length if provided (optional field)
  if (phone.imei && phone.imei.length < 15) {
    throw new AppError('IMEI must be at least 15 characters', 400);
  }

  // Create listing
  const listing = await Listing.create({
    seller: req.user._id,
    phone,
    condition,
    conditionDetails,
    price,
    priceNegotiable,
    title,
    description,
    images,
    accessories,
    location,
    status: 'draft', // Start as draft until inspection complete
  });

  // Update user's active listings count
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { activeListings: 1 },
  });

  res.status(201).json({
    status: 'success',
    message: 'Listing created successfully',
    data: {
      listing,
    },
  });
});

/**
 * @desc    Get all active listings with filters
 * @route   GET /api/v1/listings
 * @access  Public
 */
export const getAllListings = asyncHandler(async (req, res) => {
  const {
    brand,
    model,
    minPrice,
    maxPrice,
    condition,
    city,
    storage,
    ptaApproved,
    page = 1,
    limit = 20,
    sort = '-createdAt',
  } = req.query;

  // Build query
  const query = { status: 'active', visibility: 'public' };

  if (brand) query['phone.brand'] = brand;
  if (model) query['phone.model'] = new RegExp(model, 'i');
  if (condition) query.condition = condition;
  if (city) query['location.city'] = city;
  if (storage) query['phone.storage'] = storage;
  
  // PTA Approval filter
  if (ptaApproved !== undefined) {
    query.ptaApproved = ptaApproved === 'true' || ptaApproved === true;
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  const skip = (page - 1) * limit;

  const listings = await Listing.find(query)
    .populate('seller', 'name avatar verified verificationBadge ratings')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

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
 * @desc    Get listing by ID
 * @route   GET /api/v1/listings/:id
 * @access  Public
 */
export const getListingById = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate('seller', 'name avatar verified verificationBadge ratings location createdAt')
    .populate('inspectionReport.reportId');

  if (!listing) {
    throw new AppError('Listing not found', 404);
  }

  // Increment view count asynchronously (in background)
  Listing.findByIdAndUpdate(
    req.params.id,
    { $inc: { 'metrics.views': 1 } },
    { new: false }
  ).catch((err) => console.error('Failed to increment view count:', err));

  res.status(200).json({
    status: 'success',
    data: {
      listing,
    },
  });
});

/**
 * @desc    Update listing
 * @route   PUT /api/v1/listings/:id
 * @access  Private (owner only)
 */
export const updateListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    throw new AppError('Listing not found', 404);
  }

  // Check ownership
  if (listing.seller.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to update this listing', 403);
  }

  // Don't allow updating certain fields
  const allowedFields = [
    'price',
    'priceNegotiable',
    'description',
    'condition',
    'conditionDetails',
    'accessories',
    'status',
  ];

  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      listing[key] = req.body[key];
    }
  });

  await listing.save();

  res.status(200).json({
    status: 'success',
    message: 'Listing updated successfully',
    data: {
      listing,
    },
  });
});

/**
 * @desc    Delete listing
 * @route   DELETE /api/v1/listings/:id
 * @access  Private (owner only)
 */
export const deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    throw new AppError('Listing not found', 404);
  }

  // Check ownership
  if (listing.seller.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to delete this listing', 403);
  }

  // Soft delete
  listing.status = 'removed';
  await listing.save();

  // Update user's active listings count
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { activeListings: -1 },
  });

  res.status(200).json({
    status: 'success',
    message: 'Listing deleted successfully',
  });
});

/**
 * @desc    Toggle like on a listing
 * @route   POST /api/v1/listings/:id/like
 * @access  Private
 */
export const toggleLike = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    throw new AppError('Listing not found', 404);
  }

  await listing.toggleLike(req.user._id);

  const isLiked = listing.likedBy.includes(req.user._id);

  res.status(200).json({
    status: 'success',
    message: isLiked ? 'Listing liked' : 'Listing unliked',
    data: {
      isLiked,
      likesCount: listing.metrics.likes,
    },
  });
});

/**
 * @desc    Search listings
 * @route   GET /api/v1/listings/search
 * @access  Public
 */
export const searchListings = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;

  if (!q) {
    throw new AppError('Search query is required', 400);
  }

  const query = {
    $text: { $search: q },
    status: 'active',
    visibility: 'public',
  };

  const skip = (page - 1) * limit;

  const listings = await Listing.find(query)
    .populate('seller', 'name avatar verified')
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(parseInt(limit));

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
 * @desc    Get nearby listings based on location
 * @route   GET /api/v1/listings/nearby
 * @access  Public
 */
export const getNearbyListings = asyncHandler(async (req, res) => {
  const { lat, lng, maxDistance = 50000, limit = 20 } = req.query;

  if (!lat || !lng) {
    throw new AppError('Latitude and longitude are required', 400);
  }

  const listings = await Listing.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        $maxDistance: parseInt(maxDistance),
      },
    },
    status: 'active',
    visibility: 'public',
  })
    .populate('seller', 'name avatar verified')
    .limit(parseInt(limit));

  res.status(200).json({
    status: 'success',
    results: listings.length,
    data: {
      listings,
    },
  });
});

/**
 * @desc    Get personalized swipe feed
 * @route   GET /api/v1/listings/swipe-feed
 * @access  Private
 */
export const getSwipeFeed = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  // Get listings user hasn't liked and aren't their own
  const listings = await Listing.find({
    status: 'active',
    visibility: 'public',
    seller: { $ne: req.user._id },
    likedBy: { $nin: [req.user._id] },
  })
    .populate('seller', 'name avatar verified ratings')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    status: 'success',
    results: listings.length,
    data: {
      listings,
    },
  });
});

/**
 * @desc    Mark listing as sold
 * @route   PATCH /api/v1/listings/:id/sold
 * @access  Private (owner only)
 */
export const markAsSold = asyncHandler(async (req, res) => {
  const { soldTo, soldOutside } = req.body;

  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    throw new AppError('Listing not found', 404);
  }

  // Check ownership
  if (listing.seller.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to update this listing', 403);
  }

  // Check if already sold
  if (listing.status === 'sold') {
    throw new AppError('This listing is already marked as sold', 400);
  }

  // Update listing
  listing.status = 'sold';
  listing.soldAt = new Date();

  if (soldOutside) {
    listing.soldOutside = true;
    listing.soldTo = null;
  } else if (soldTo) {
    listing.soldTo = soldTo;
    listing.soldOutside = false;
  }

  await listing.save();

  // Populate soldTo for response
  await listing.populate('soldTo', 'name avatar');

  res.status(200).json({
    status: 'success',
    message: 'Listing marked as sold',
    data: {
      listing,
    },
  });
});

/**
 * @desc    Get chat participants for a listing
 * @route   GET /api/v1/listings/:id/chat-participants
 * @access  Private (owner only)
 */
export const getChatParticipants = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    throw new AppError('Listing not found', 404);
  }

  // Check ownership
  if (listing.seller.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to access this resource', 403);
  }

  // Get all chats for this listing
  const Chat = (await import('../models/Chat.model.js')).default;
  const chats = await Chat.find({ listing: req.params.id })
    .populate('participants', 'name avatar');

  // Extract unique participants (excluding the seller)
  const participantsMap = new Map();
  chats.forEach((chat) => {
    chat.participants.forEach((participant) => {
      const participantId = participant._id.toString();
      if (participantId !== req.user._id.toString()) {
        participantsMap.set(participantId, {
          _id: participant._id,
          name: participant.name,
          avatar: participant.avatar,
        });
      }
    });
  });

  const participants = Array.from(participantsMap.values());

  res.status(200).json({
    status: 'success',
    data: {
      participants,
    },
  });
});
