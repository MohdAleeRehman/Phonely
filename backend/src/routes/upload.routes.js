import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { uploadLimiter } from '../middleware/rateLimiter.middleware.js';
import { uploadImages, deleteImage, upload } from '../controllers/upload.controller.js';

const router = express.Router();

/**
 * @route   POST /api/v1/upload/images
 * @desc    Upload multiple images (max 6)
 * @access  Private
 */
router.post('/images', protect, uploadLimiter, upload.array('images', 6), uploadImages);

/**
 * @route   DELETE /api/v1/upload/images/:filename
 * @desc    Delete an image
 * @access  Private
 */
router.delete('/images/:filename', protect, deleteImage);

export default router;
