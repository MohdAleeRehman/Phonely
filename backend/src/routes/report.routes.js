import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/rbac.middleware.js';
import {
  createReport,
  getMyReports,
  getAllReports,
  updateReportStatus,
} from '../controllers/report.controller.js';

const router = express.Router();

// Public routes - none

// Protected routes
router.post('/', protect, createReport);
router.get('/my-reports', protect, getMyReports);

// Admin routes
router.get('/', protect, requireAdmin, getAllReports);
router.put('/:id', protect, requireAdmin, updateReportStatus);

export default router;
