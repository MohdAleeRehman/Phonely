import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    rater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Rater is required'],
    },
    ratedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Rated user is required'],
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Listing is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    review: {
      type: String,
      trim: true,
      maxlength: [500, 'Review cannot exceed 500 characters'],
    },
    transactionType: {
      type: String,
      enum: ['buyer', 'seller'],
      required: [true, 'Transaction type is required'],
      // buyer: rater bought from ratedUser
      // seller: rater sold to ratedUser
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user can only rate another user once per listing
ratingSchema.index({ rater: 1, ratedUser: 1, listing: 1 }, { unique: true });

// Index for efficient queries
ratingSchema.index({ ratedUser: 1, createdAt: -1 });
ratingSchema.index({ rater: 1, createdAt: -1 });

// Static method to calculate and update user's average rating
ratingSchema.statics.calculateAverageRating = async function (userId) {
  const stats = await this.aggregate([
    {
      $match: { ratedUser: new mongoose.Types.ObjectId(userId) },
    },
    {
      $group: {
        _id: '$ratedUser',
        averageRating: { $avg: '$rating' },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('User').findByIdAndUpdate(userId, {
      'ratings.average': Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal
      'ratings.count': stats[0].ratingCount,
    });
  } else {
    // No ratings, reset to 0
    await mongoose.model('User').findByIdAndUpdate(userId, {
      'ratings.average': 0,
      'ratings.count': 0,
    });
  }
};

// After saving a new rating, recalculate average
ratingSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.ratedUser);
});

// After deleting a rating, recalculate average
ratingSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await this.model.calculateAverageRating(doc.ratedUser);
  }
});

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;
