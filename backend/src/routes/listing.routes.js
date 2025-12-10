import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
  toggleLike,
  searchListings,
  getNearbyListings,
  getSwipeFeed,
  markAsSold,
  getChatParticipants,
} from '../controllers/listing.controller.js';

const router = express.Router();

/**
 * @route   GET /api/v1/listings
 * @desc    Get all active listings with filters
 * @access  Public
 */
router.get('/', getAllListings);

/**
 * @route   GET /api/v1/listings/search
 * @desc    Search listings
 * @access  Public
 */
router.get('/search', searchListings);

/**
 * @route   GET /api/v1/listings/nearby
 * @desc    Get nearby listings based on location
 * @access  Public
 */
router.get('/nearby', getNearbyListings);

/**
 * @route   GET /api/v1/listings/swipe-feed
 * @desc    Get personalized swipe feed
 * @access  Private
 */
router.get('/swipe-feed', protect, getSwipeFeed);

/**
 * @route   GET /api/v1/listings/my-listings
 * @desc    Get current user's listings
 * @access  Private
 */
router.get('/my-listings', protect, async (req, res) => {
  const { asyncHandler } = await import('../middleware/error.middleware.js');
  const Listing = (await import('../models/Listing.model.js')).default;
  
  const handler = asyncHandler(async (req, res) => {
    const listings = await Listing.find({ seller: req.user._id })
      .populate('seller', 'name avatar verified')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: listings.length,
      data: listings,
    });
  });
  
  return handler(req, res);
});

/**
 * @route   POST /api/v1/listings
 * @desc    Create a new listing
 * @access  Private
 */
router.post('/', protect, createListing);

/**
 * @route   GET /api/v1/listings/:id
 * @desc    Get listing by ID
 * @access  Public
 */
router.get('/:id', getListingById);

/**
 * @route   PUT /api/v1/listings/:id
 * @desc    Update listing
 * @access  Private (owner only)
 */
router.put('/:id', protect, updateListing);

/**
 * @route   DELETE /api/v1/listings/:id
 * @desc    Delete listing
 * @access  Private (owner only)
 */
router.delete('/:id', protect, deleteListing);

/**
 * @route   POST /api/v1/listings/:id/like
 * @desc    Toggle like on a listing
 * @access  Private
 */
router.post('/:id/like', protect, toggleLike);

/**
 * @route   PATCH /api/v1/listings/:id/sold
 * @desc    Mark listing as sold
 * @access  Private (owner only)
 */
router.patch('/:id/sold', protect, markAsSold);

/**
 * @route   GET /api/v1/listings/:id/chat-participants
 * @desc    Get chat participants for a listing
 * @access  Private (owner only)
 */
router.get('/:id/chat-participants', protect, getChatParticipants);

export default router;
