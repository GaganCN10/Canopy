import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema(
  {
    sighting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sighting',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vote: {
      type: String,
      enum: ['upvote', 'downvote'],
      required: true,
    },
  },
  { timestamps: true },
);

verificationSchema.index({ sighting: 1, user: 1 }, { unique: true });

const Verification = mongoose.model('Verification', verificationSchema);

export default Verification;
