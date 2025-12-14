import mongoose from 'mongoose';

const waitlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    source: {
      type: String,
      default: 'landing-page',
    },
    notified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster email lookups
waitlistSchema.index({ email: 1 });

const Waitlist = mongoose.model('Waitlist', waitlistSchema);

export default Waitlist;
