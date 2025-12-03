import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    phone: {
      brand: {
        type: String,
        required: [true, 'Phone brand is required'],
        enum: [
          'Apple',
          'Samsung',
          'Google',
          'OnePlus',
          'Xiaomi',
          'Oppo',
          'Vivo',
          'Realme',
          'Huawei',
          'Nokia',
          'Motorola',
          'Sony',
          'Other',
        ],
      },
      model: {
        type: String,
        required: [true, 'Phone model is required'],
        trim: true,
      },
      storage: {
        type: String,
        required: true,
        enum: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB'],
      },
      ram: {
        type: String,
        enum: ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB', '18GB'],
      },
      color: {
        type: String,
        required: true,
      },
      imei: {
        type: String,
        // Encrypted IMEI stored here
        select: false,
      },
      warranty: {
        hasWarranty: { type: Boolean, default: false },
        expiryDate: Date,
        type: {
          type: String,
          enum: ['official', 'shop', 'expired', 'none'],
        },
      },
    },
    condition: {
      type: String,
      required: true,
      enum: ['excellent', 'good', 'fair', 'poor'],
    },
    ptaApproved: {
      type: Boolean,
      default: true,
      index: true,
    },
    conditionDetails: {
      screenCondition: String,
      bodyCondition: String,
      batteryHealth: Number,
      functionalIssues: [String],
      // Phonely's Unique Fields
      displayQuality: {
        type: String,
        enum: ['flawless', 'minor-scratches', 'noticeable-wear', 'cracked'],
      },
      allFeaturesWorking: {
        type: Boolean,
        default: true,
      },
      additionalNotes: {
        type: String,
        maxlength: 500,
      },
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    priceRange: {
      min: Number,
      max: Number,
    },
    priceNegotiable: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    images: [
      {
        url: String,
        type: {
          type: String,
          enum: [
            'front', 
            'back', 
            'left-side', 
            'right-side', 
            'top', 
            'bottom', 
            'front-camera-on', 
            'back-camera-on', 
            'display-test', 
            'screen', 
            'accessories', 
            'other'
          ],
        },
        order: Number,
      },
    ],
    inspectionReport: {
      reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inspection',
      },
      conditionScore: {
        type: Number,
        min: 0,
        max: 10,
      },
      detectedIssues: [String],
      authenticityScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      completedAt: Date,
    },
    accessories: {
      box: { type: Boolean, default: false },
      charger: { type: Boolean, default: false },
      cable: { type: Boolean, default: false },
      earphones: { type: Boolean, default: false },
      case: { type: Boolean, default: false },
      screenProtector: { type: Boolean, default: false },
    },
    location: {
      city: {
        type: String,
        required: true,
      },
      area: String,
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
        },
      },
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'sold', 'removed', 'expired'],
      default: 'draft',
      index: true,
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'hidden'],
      default: 'public',
    },
    metrics: {
      views: {
        type: Number,
        default: 0,
      },
      likes: {
        type: Number,
        default: 0,
      },
      shares: {
        type: Number,
        default: 0,
      },
      inquiries: {
        type: Number,
        default: 0,
      },
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },
    featuredUntil: Date,
    boostCount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      // Auto-expire listings after 90 days
      default: () => new Date(+new Date() + 90 * 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
listingSchema.index({ 'location.coordinates': '2dsphere' });
listingSchema.index({ status: 1, createdAt: -1 });
listingSchema.index({ 'phone.brand': 1, 'phone.model': 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ seller: 1, status: 1 });

// Text search index
listingSchema.index({
  title: 'text',
  description: 'text',
  'phone.brand': 'text',
  'phone.model': 'text',
});

// Virtual for age of listing
listingSchema.virtual('age').get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to increment view count
listingSchema.methods.incrementViews = function () {
  this.metrics.views += 1;
  return this.save({ validateBeforeSave: false });
};

// Method to toggle like
listingSchema.methods.toggleLike = function (userId) {
  const index = this.likedBy.indexOf(userId);
  if (index === -1) {
    this.likedBy.push(userId);
    this.metrics.likes += 1;
  } else {
    this.likedBy.splice(index, 1);
    this.metrics.likes -= 1;
  }
  return this.save({ validateBeforeSave: false });
};

// Static method to find nearby listings
listingSchema.statics.findNearby = function (coordinates, maxDistance = 50000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates,
        },
        $maxDistance: maxDistance, // in meters
      },
    },
    status: 'active',
  });
};

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;
