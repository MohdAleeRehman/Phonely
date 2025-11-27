import jwt from 'jsonwebtoken';
import { asyncHandler, AppError } from './error.middleware.js';
import User from '../models/User.model.js';

// Protect routes - verify JWT token
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Not authorized to access this route', 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    if (!req.user.isActive) {
      throw new AppError('User account is deactivated', 403);
    }

    // Update last active
    req.user.updateLastActive();

    next();
  } catch (error) {
    throw new AppError('Not authorized to access this route', 401);
  }
});

// Restrict to specific roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError('You do not have permission to perform this action', 403);
    }
    next();
  };
};

// Optional auth - attach user if token exists but don't throw error
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Token invalid, but continue without user
      req.user = null;
    }
  }

  next();
});

// Verify ownership of resource
export const verifyOwnership = (model) => {
  return asyncHandler(async (req, res, next) => {
    const resourceId = req.params.id;
    const resource = await model.findById(resourceId);

    if (!resource) {
      throw new AppError('Resource not found', 404);
    }

    // Check if user owns the resource or is admin
    const isOwner =
      resource.seller?.toString() === req.user._id.toString() ||
      resource.user?.toString() === req.user._id.toString();

    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new AppError('You do not have permission to modify this resource', 403);
    }

    req.resource = resource;
    next();
  });
};
