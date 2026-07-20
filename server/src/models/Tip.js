import mongoose from 'mongoose';

const tipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
    },
    evidence: [
      {
        url: String,
        filename: String,
      },
    ],
    status: {
      type: String,
      enum: ['new', 'under_review', 'actioned', 'closed'],
      default: 'new',
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function () {
        return !!this.submitterEmail;
      },
    },
    submitterEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    submitterPhone: {
      type: String,
      trim: true,
    },
    isAnonymous: {
      type: Boolean,
      default: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewNotes: {
      type: String,
    },
  },
  { timestamps: true },
);

tipSchema.index({ location: '2dsphere' });
tipSchema.index({ status: 1, createdAt: -1 });

const Tip = mongoose.model('Tip', tipSchema);

export default Tip;
