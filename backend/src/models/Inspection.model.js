import mongoose from 'mongoose';

const inspectionSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    images: [
      {
        url: String,
        type: {
          type: String,
          enum: ['front', 'back', 'left-side', 'right-side', 'top', 'bottom', 'front-camera-on', 'back-camera-on', 'display-test', 'sides', 'screen', 'camera', 'accessories', 'other'],
        },
        analysisResult: {
          detectedIssues: [String],
          confidence: Number,
          processed: Boolean,
        },
      },
    ],
    visionAnalysis: {
      overallCondition: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor'],
      },
      conditionScore: {
        type: Number,
        min: 0,
        max: 10,
      },
      detectedIssues: [
        {
          type: {
            type: String,
            enum: [
              'screen_crack',
              'body_scratch',
              'body_dent',
              'discoloration',
              'camera_scratch',
              'button_damage',
              'port_damage',
              'water_damage',
              'other',
            ],
          },
          severity: {
            type: String,
            enum: ['minor', 'moderate', 'major'],
          },
          location: String,
          confidence: Number,
        },
      ],
      authenticity: {
        isAuthentic: Boolean,
        confidence: Number,
        modelVerified: Boolean,
        brandVerified: Boolean,
        suspiciousIndicators: [String],
      },
      accessories: {
        box: Boolean,
        charger: Boolean,
        cable: Boolean,
        earphones: Boolean,
      },
    },
    textAnalysis: {
      descriptionQuality: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor'],
      },
      completeness: Number, // 0-100
      consistencyWithVision: Boolean,
      inconsistencies: [String],
      missingInformation: [String],
      extractedSpecs: {
        storage: String,
        ram: String,
        color: String,
        condition: String,
      },
    },
    pricingAnalysis: {
      suggestedMinPrice: Number,
      suggestedMaxPrice: Number,
      marketAverage: Number,
      confidenceLevel: {
        type: String,
        enum: ['high', 'medium', 'low'],
      },
      factors: {
        conditionAdjustment: Number,
        demandMultiplier: Number,
        locationAdjustment: Number,
        ageAdjustment: Number,
      },
      comparables: [
        {
          source: String,
          price: Number,
          url: String,
          similarity: Number,
        },
      ],
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    processingTime: {
      visionAgent: Number, // milliseconds
      textAgent: Number,
      pricingAgent: Number,
      total: Number,
    },
    errors: [
      {
        agent: String,
        message: String,
        timestamp: Date,
      },
    ],
    metadata: {
      modelVersion: String,
      apiVersion: String,
      requestId: String,
    },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true, // Suppress warning for 'errors' field
  }
);

// Index for faster queries
inspectionSchema.index({ listing: 1, createdAt: -1 });
inspectionSchema.index({ user: 1, createdAt: -1 });
inspectionSchema.index({ status: 1 });

// Method to calculate overall quality score
inspectionSchema.methods.calculateQualityScore = function () {
  const visionScore = this.visionAnalysis?.conditionScore || 0;
  const textScore = this.textAnalysis?.completeness || 0;
  const pricingConfidence =
    this.pricingAnalysis?.confidenceLevel === 'high'
      ? 100
      : this.pricingAnalysis?.confidenceLevel === 'medium'
      ? 70
      : 40;

  return ((visionScore * 10 + textScore + pricingConfidence) / 3).toFixed(2);
};

const Inspection = mongoose.model('Inspection', inspectionSchema);

export default Inspection;
