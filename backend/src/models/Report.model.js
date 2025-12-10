import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reportedListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
    },
    reportType: {
      type: String,
      enum: ['user', 'listing'],
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        'scam',
        'fake-listing',
        'inappropriate-content',
        'spam',
        'harassment',
        'fake-photos',
        'counterfeit-phone',
        'misleading-information',
        'other',
      ],
    },
    description: {
      type: String,
      required: true,
      maxLength: 500,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
    },
    adminNotes: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
reportSchema.index({ reporter: 1, createdAt: -1 });
reportSchema.index({ reportedUser: 1, status: 1 });
reportSchema.index({ reportedListing: 1, status: 1 });
reportSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Report', reportSchema);
