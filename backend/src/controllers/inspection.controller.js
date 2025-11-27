import { asyncHandler, AppError } from '../middleware/error.middleware.js';
import Inspection from '../models/Inspection.model.js';
import Listing from '../models/Listing.model.js';
import axios from 'axios';

/**
 * @desc    Start AI inspection for a listing
 * @route   POST /api/v1/inspections/start
 * @access  Private
 */
export const startInspection = asyncHandler(async (req, res) => {
  const { listingId, images, phoneDetails, description } = req.body;

  // Validate inputs
  if (!listingId || !images || !phoneDetails || !description) {
    throw new AppError('Please provide all required fields', 400);
  }

  // Check if listing exists and belongs to user
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new AppError('Listing not found', 404);
  }

  if (listing.seller.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to inspect this listing', 403);
  }

  // Create inspection record
  const inspection = await Inspection.create({
    listing: listingId,
    user: req.user._id,
    images: images.map((img, index) => ({
      url: img.url,
      type: img.type,
      order: index,
      analysisResult: {
        processed: false,
      },
    })),
    status: 'pending',
  });

  // Call AI service asynchronously (fire and forget)
  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
  
  axios.post(
    `${aiServiceUrl}/api/v1/inspection/start`,
    {
      inspection_id: inspection._id.toString(),
      images: images.map(img => typeof img === 'string' ? img : img.url),
      phone_details: phoneDetails,
      description,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.AI_SERVICE_API_KEY,
      },
      timeout: 30000, // 30 seconds - enough time to start the inspection
    }
  ).then((response) => {
    console.log('✅ AI inspection started:', response.data.message || 'Processing');
    inspection.status = 'processing';
    inspection.save().catch(err => console.error('Failed to update inspection status:', err));
  }).catch((error) => {
    console.error('❌ Failed to start AI inspection:', error.message);
    inspection.status = 'failed';
    inspection.errors.push({
      agent: 'ai-service',
      message: error.message,
      timestamp: new Date(),
    });
    inspection.save().catch(err => console.error('Failed to save inspection error:', err));
  });

  res.status(200).json({
    status: 'success',
    message: 'Inspection started. Results will be available in 30-60 seconds.',
    data: {
      inspectionId: inspection._id,
      status: 'processing',
    },
  });
});

/**
 * @desc    Get inspection status
 * @route   GET /api/v1/inspections/:id/status
 * @access  Private
 */
export const getInspectionStatus = asyncHandler(async (req, res) => {
  const inspection = await Inspection.findById(req.params.id)
    .select('user status processingTime createdAt updatedAt');

  if (!inspection) {
    throw new AppError('Inspection not found', 404);
  }

  // Check if user owns this inspection
  if (inspection.user.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to view this inspection', 403);
  }

  res.status(200).json({
    status: 'success',
    data: {
      inspectionId: inspection._id,
      status: inspection.status,
      processingTime: inspection.processingTime,
      createdAt: inspection.createdAt,
      updatedAt: inspection.updatedAt,
    },
  });
});

/**
 * @desc    Get complete inspection report
 * @route   GET /api/v1/inspections/:id/report
 * @access  Private (owner only)
 */
export const getInspectionReport = asyncHandler(async (req, res) => {
  const inspection = await Inspection.findById(req.params.id)
    .populate('listing', 'title phone price')
    .populate('user', 'name email');

  if (!inspection) {
    throw new AppError('Inspection not found', 404);
  }

  // Check if user owns this inspection
  if (inspection.user._id.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to view this inspection', 403);
  }

  if (inspection.status !== 'completed') {
    throw new AppError('Inspection is not yet complete', 400);
  }

  // Calculate quality score
  const qualityScore = inspection.calculateQualityScore();

  res.status(200).json({
    status: 'success',
    data: {
      inspection: {
        ...inspection.toObject(),
        qualityScore,
      },
    },
  });
});

/**
 * @desc    Handle callback from AI service when inspection completes
 * @route   POST /api/v1/inspections/:id/callback
 * @access  Internal (AI service only)
 */
export const handleInspectionCallback = asyncHandler(async (req, res) => {
  const { inspection_id, status: inspectionStatus, results } = req.body;

  // Verify API key from AI service
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.AI_SERVICE_API_KEY) {
    throw new AppError('Unauthorized callback', 401);
  }

  const inspection = await Inspection.findById(inspection_id)
    .populate('listing')
    .populate('user', 'name email');

  if (!inspection) {
    throw new AppError('Inspection not found', 404);
  }

  if (inspectionStatus === 'completed' && results) {
    // Log received results for debugging
    console.log('📊 Received inspection results:', JSON.stringify({
      vision_analysis: results.vision_analysis ? 'present' : 'missing',
      text_analysis: results.text_analysis ? 'present' : 'missing',
      pricing_analysis: results.pricing_analysis ? 'present' : 'missing',
    }));

    // Validate required data
    if (!results.vision_analysis) {
      console.error('❌ Missing vision_analysis in results:', results);
      throw new AppError('Invalid inspection results: missing vision analysis', 400);
    }

    // Update inspection with results
    inspection.status = 'completed';
    
    // Map detected_issues to the format expected by Inspection model
    const detectedIssues = (results.vision_analysis.detected_issues || []).map(issue => {
      // If issue is already an object with type/severity, use it
      if (typeof issue === 'object' && issue.type) {
        return {
          type: issue.type || 'other',
          severity: issue.severity || 'minor',
          location: issue.location || '',
          confidence: issue.confidence || 0.5
        };
      }
      // If issue is a string, convert to simplified object
      return {
        type: 'other',
        severity: 'minor',
        location: typeof issue === 'string' ? issue : '',
        confidence: 0.5
      };
    });
    
    inspection.visionAnalysis = {
      conditionScore: results.vision_analysis.condition_score || 0,
      condition: results.vision_analysis.condition || 'unknown',
      detectedIssues: detectedIssues,
      authenticityScore: results.vision_analysis.authenticity?.score || 0,
    };

    inspection.textAnalysis = {
      descriptionQuality: results.text_analysis?.description_quality || 'unknown',
      completeness: results.text_analysis?.completeness || 0,
      consistency: results.text_analysis?.consistency_with_vision || false,
    };

    inspection.pricingAnalysis = {
      suggestedMinPrice: results.pricing_analysis?.suggested_min_price || 0,
      suggestedMaxPrice: results.pricing_analysis?.suggested_max_price || 0,
      marketAverage: results.pricing_analysis?.market_average || 0,
      confidenceLevel: results.pricing_analysis?.confidence_level || 'low',
    };

    inspection.processingTime = results.processing_time;

    await inspection.save();

    // Update listing
    const listing = inspection.listing;
    
    // Extract issue descriptions (handle both string array and object array formats)
    const detectedIssuesArray = results.vision_analysis.detected_issues || [];
    const detectedIssueStrings = detectedIssuesArray.map(issue => {
      if (typeof issue === 'string') return issue;
      if (typeof issue === 'object') return issue.location || issue.type || 'Unknown issue';
      return 'Unknown issue';
    });
    
    listing.inspectionReport = {
      reportId: inspection._id,
      conditionScore: results.vision_analysis.condition_score || 0,
      detectedIssues: detectedIssueStrings,
      authenticityScore: results.vision_analysis.authenticity?.score || 0, // Already 0-100 from AI
      completedAt: new Date(),
    };

    listing.priceRange = {
      min: results.pricing_analysis?.suggested_min_price || listing.price * 0.9,
      max: results.pricing_analysis?.suggested_max_price || listing.price * 1.1,
    };

    // Activate listing after successful inspection
    listing.status = 'active';
    await listing.save();

    // Send email notification to seller
    try {
      const { sendListingNotification } = await import('../services/email.service.js');
      await sendListingNotification(
        inspection.user.email,
        inspection.user.name,
        {
          _id: listing._id,
          title: listing.title,
          price: listing.price,
          images: listing.images,
          description: listing.description,
        }
      );
      console.log(`✉️  Listing notification sent to ${inspection.user.email}`);
    } catch (emailError) {
      console.error('Failed to send listing notification:', emailError.message);
    }

    res.status(200).json({
      status: 'success',
      message: 'Inspection results processed successfully',
    });
  } else if (inspectionStatus === 'failed') {
    // Handle failed inspection
    inspection.status = 'failed';
    inspection.errors.push({
      agent: 'ai-service',
      message: results?.error || 'Inspection failed',
      timestamp: new Date(),
    });
    await inspection.save();

    res.status(200).json({
      status: 'success',
      message: 'Inspection failure recorded',
    });
  } else {
    throw new AppError('Invalid callback data', 400);
  }
});

