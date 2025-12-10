import express from 'express';
import { protect, admin } from '../middleware/auth.middleware.js';
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
router.get('/', protect, admin, getAllReports);
router.put('/:id', protect, admin, updateReportStatus);

export default router;
