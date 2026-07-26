import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const roleRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestedRole: {
      type: String,
      required: [true, 'Requested role is required'],
      enum: ['researcher_ngo', 'ranger', 'rescue_center_staff'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
      maxlength: [1000, 'Reason cannot exceed 1000 characters'],
    },
    orgOrDeptName: {
      type: String,
      required: [true, 'Organization/Department name is required'],
      trim: true,
    },
    documentFile: {
      type: String,
      trim: true,
    },
    documentOriginalName: {
      type: String,
      trim: true,
    },
    inviteCode: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
    },
    decisionToken: {
      type: String,
      trim: true,
    },
    decisionTokenExpiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

roleRequestSchema.index({ status: 1, requestedRole: 1 });
roleRequestSchema.index({ decisionToken: 1 }, { unique: true, sparse: true });

const RoleRequest = mongoose.model('RoleRequest', roleRequestSchema);

export default RoleRequest;
