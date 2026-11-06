import mongoose from 'mongoose';

const trackerItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['hackathon', 'job', 'internship'],
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Please provide an opportunity name/title'],
      trim: true
    },
    company: {
      type: String,
      default: 'Tech Company',
      trim: true
    },
    link: {
      type: String,
      required: [true, 'Please provide the official application/registration link'],
      trim: true
    },
    lastDateApply: {
      type: String,
      required: true
    },
    lastDateSubmission: {
      type: String,
      default: null
    },
    secondDate: {
      type: String,
      default: null
    },
    compensation: {
      type: String,
      default: 'Competitive'
    },
    status: {
      type: String,
      enum: ['read', 'unread'],
      default: 'unread'
    },
    hasNewEmail: {
      type: Boolean,
      default: true
    },
    emailNotification: {
      type: String,
      default: null
    },
    tags: {
      type: [String],
      default: []
    },
    mode: {
      type: String,
      default: 'Online / Remote'
    },
    description: {
      type: String,
      default: ''
    },
    isSaved: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Compound index to quickly fetch user's items by category
trackerItemSchema.index({ user: 1, type: 1 });

export default mongoose.model('TrackerItem', trackerItemSchema);
