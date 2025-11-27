import { asyncHandler, AppError } from '../middleware/error.middleware.js';
import User from '../models/User.model.js';
import Listing from '../models/Listing.model.js';
import Inspection from '../models/Inspection.model.js';
import Chat from '../models/Chat.model.js';

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/v1/admin/dashboard
 * @access  Private/Admin
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  // Get counts
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const verifiedUsers = await User.countDocuments({ verified: true });

  const totalListings = await Listing.countDocuments();
  const activeListings = await Listing.countDocuments({ status: 'active' });
  const soldListings = await Listing.countDocuments({ status: 'sold' });

  const totalInspections = await Inspection.countDocuments();
  const completedInspections = await Inspection.countDocuments({ status: 'completed' });

  const totalChats = await Chat.countDocuments();
  const activeChats = await Chat.countDocuments({ status: 'active' });

  // Get recent activity
  const recentUsers = await User.find()
    .select('name email createdAt verified')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentListings = await Listing.find()
    .populate('seller', 'name email')
    .select('title price status createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

  // Calculate growth (last 7 days vs previous 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const newUsersThisWeek = await User.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });

  const newUsersLastWeek = await User.countDocuments({
    createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
  });

  const newListingsThisWeek = await Listing.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });

  const newListingsLastWeek = await Listing.countDocuments({
    createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
  });

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          verified: verifiedUsers,
          newThisWeek: newUsersThisWeek,
          growth: newUsersLastWeek > 0 
            ? ((newUsersThisWeek - newUsersLastWeek) / newUsersLastWeek * 100).toFixed(1)
            : 0,
        },
        listings: {
          total: totalListings,
          active: activeListings,
          sold: soldListings,
          newThisWeek: newListingsThisWeek,
          growth: newListingsLastWeek > 0
            ? ((newListingsThisWeek - newListingsLastWeek) / newListingsLastWeek * 100).toFixed(1)
            : 0,
        },
        inspections: {
          total: totalInspections,
          completed: completedInspections,
          successRate: totalInspections > 0
            ? ((completedInspections / totalInspections) * 100).toFixed(1)
            : 0,
        },
        chats: {
          total: totalChats,
          active: activeChats,
        },
      },
      recentActivity: {
        users: recentUsers,
        listings: recentListings,
      },
    },
  });
});

/**
 * @desc    Get all users with filters
 * @route   GET /api/v1/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, verified, active, search } = req.query;

  const query = {};
  if (verified !== undefined) query.verified = verified === 'true';
  if (active !== undefined) query.isActive = active === 'true';
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') },
    ];
  }

  const skip = (page - 1) * limit;

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    },
  });
});

/**
 * @desc    Get all listings (including drafts and removed)
 * @route   GET /api/v1/admin/listings
 * @access  Private/Admin
 */
export const getAllListingsAdmin = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, brand } = req.query;

  const query = {};
  if (status) query.status = status;
  if (brand) query['phone.brand'] = brand;

  const skip = (page - 1) * limit;

  const listings = await Listing.find(query)
    .populate('seller', 'name email verified')
    .sort({ createdAt: -1 })
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
 * @desc    Delete a user (admin action)
 * @route   DELETE /api/v1/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Soft delete
  user.isActive = false;
  await user.save();

  // Remove all user's active listings
  await Listing.updateMany(
    { seller: user._id, status: 'active' },
    { status: 'removed' }
  );

  res.status(200).json({
    status: 'success',
    message: 'User deactivated successfully',
  });
});

/**
 * @desc    Delete a listing (admin action)
 * @route   DELETE /api/v1/admin/listings/:id
 * @access  Private/Admin
 */
export const deleteListingAdmin = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    throw new AppError('Listing not found', 404);
  }

  // Hard delete for admin
  await listing.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Listing deleted successfully',
  });
});
