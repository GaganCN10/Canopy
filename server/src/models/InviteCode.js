import mongoose from 'mongoose';

const inviteCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: ['ranger'],
      default: 'ranger',
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    usedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
  },
  { timestamps: true }
);

const InviteCode = mongoose.model('InviteCode', inviteCodeSchema);

export default InviteCode;
