import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password by default
    },
    avatar: {
      type: String,
      default: null,
    },
    location: {
      city: {
        type: String,
        required: function() {
          // Only require city for non-admin users
          return this.role !== 'admin';
        },
      },
      country: {
        type: String,
        default: 'Pakistan',
      },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [0, 0],
        },
      },
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationBadge: {
      type: {
        type: String,
        enum: ['email', 'phone', 'identity', 'trusted'],
        default: null,
      },
      verifiedAt: Date,
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    activeListings: {
      type: Number,
      default: 0,
    },
    soldItems: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    verificationTokenExpiry: {
      type: Date,
      default: null,
    },
    adminOtp: {
      code: {
        type: String,
        default: null,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
      attempts: {
        type: Number,
        default: 0,
      },
    },
    fcmTokens: [
      {
        type: String,
      },
    ],
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
      privacy: {
        showPhone: { type: Boolean, default: false },
        showEmail: { type: Boolean, default: false },
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for geospatial queries
userSchema.index({ 'location.coordinates': '2dsphere' });

// Index for search
userSchema.index({ name: 'text', email: 'text' });

// Virtual for user's listings
userSchema.virtual('listings', {
  ref: 'Listing',
  localField: '_id',
  foreignField: 'seller',
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate auth token payload
userSchema.methods.getAuthPayload = function () {
  return {
    id: this._id,
    email: this.email,
    role: this.role,
  };
};

// Update last active timestamp
userSchema.methods.updateLastActive = function () {
  this.lastActive = Date.now();
  return this.save({ validateBeforeSave: false });
};

const User = mongoose.model('User', userSchema);

export default User;
