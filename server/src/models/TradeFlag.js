import mongoose from 'mongoose';

const tradeFlagSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    confidence: {
      type: Number,
      default: 0,
    },
    matchedKeywords: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'dismissed'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewNotes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

tradeFlagSchema.index({ source: 1, status: 1, createdAt: -1 });

const TradeFlag = mongoose.model('TradeFlag', tradeFlagSchema);

export default TradeFlag;
