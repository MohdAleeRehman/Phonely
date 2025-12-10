import asyncHandler from 'express-async-handler';
import Report from '../models/Report.model.js';

/**
 * @desc    Create a new report
 * @route   POST /api/v1/reports
 * @access  Private
 */
export const createReport = asyncHandler(async (req, res) => {
  const { reportType, reportedUser, reportedListing, reason, description } = req.body;

  // Validation
  if (!reportType || !reason || !description) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  if (reportType === 'user' && !reportedUser) {
    res.status(400);
    throw new Error('Please provide the user to report');
  }

  if (reportType === 'listing' && !reportedListing) {
    res.status(400);
    throw new Error('Please provide the listing to report');
  }

  // Prevent self-reporting
  if (reportType === 'user' && reportedUser === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot report yourself');
  }

  // Check for duplicate reports (same reporter, same target, within 24 hours)
  const existingReport = await Report.findOne({
    reporter: req.user._id,
    ...(reportType === 'user' ? { reportedUser } : { reportedListing }),
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });

  if (existingReport) {
    res.status(400);
    throw new Error('You have already reported this. Please wait for review.');
  }

  const report = await Report.create({
    reporter: req.user._id,
    reportType,
    reportedUser: reportType === 'user' ? reportedUser : undefined,
    reportedListing: reportType === 'listing' ? reportedListing : undefined,
    reason,
    description,
  });

  res.status(201).json({
    message: 'Report submitted successfully. We will review it within 24 hours.',
    report,
  });
});

/**
 * @desc    Get my reports
 * @route   GET /api/v1/reports/my-reports
 * @access  Private
 */
export const getMyReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ reporter: req.user._id })
    .populate('reportedUser', 'name email')
    .populate('reportedListing', 'title')
    .sort('-createdAt');

  res.json(reports);
});

/**
 * @desc    Get all reports (Admin only)
 * @route   GET /api/v1/reports
 * @access  Private/Admin
 */
export const getAllReports = asyncHandler(async (req, res) => {
  const { status, reportType } = req.query;

  const query = {};
  if (status) query.status = status;
  if (reportType) query.reportType = reportType;

  const reports = await Report.find(query)
    .populate('reporter', 'name email')
    .populate('reportedUser', 'name email')
    .populate('reportedListing', 'title')
    .populate('reviewedBy', 'name')
    .sort('-createdAt');

  res.json(reports);
});

/**
 * @desc    Update report status (Admin only)
 * @route   PUT /api/v1/reports/:id
 * @access  Private/Admin
 */
export const updateReportStatus = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;

  const report = await Report.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  report.status = status || report.status;
  report.adminNotes = adminNotes || report.adminNotes;
  report.reviewedBy = req.user._id;
  report.reviewedAt = new Date();

  await report.save();

  res.json({
    message: 'Report updated successfully',
    report,
  });
});
