import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  startInspection,
  getInspectionStatus,
  getInspectionReport,
  handleInspectionCallback,
} from '../controllers/inspection.controller.js';

const router = express.Router();

/**
 * @route   POST /api/v1/inspections/start
 * @desc    Start AI inspection for a listing
 * @access  Private
 */
router.post('/start', protect, startInspection);

/**
 * @route   GET /api/v1/inspections/:id/status
 * @desc    Get inspection status
 * @access  Private
 */
router.get('/:id/status', protect, getInspectionStatus);

/**
 * @route   GET /api/v1/inspections/:id/report
 * @desc    Get complete inspection report
 * @access  Private (owner only)
 */
router.get('/:id/report', protect, getInspectionReport);

/**
 * @route   POST /api/v1/inspections/:id/callback
 * @desc    Callback from AI service when inspection completes
 * @access  Internal (from AI service)
 */
router.post('/:id/callback', handleInspectionCallback);

export default router;
