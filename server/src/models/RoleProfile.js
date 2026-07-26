import mongoose from 'mongoose';

const roleProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: ['researcher_ngo', 'ranger', 'rescue_center_staff'],
    },
    fields: {
      orgName: { type: String, trim: true },
      orgType: { type: String, trim: true },
      position: { type: String, trim: true },
      orgWebsite: { type: String, trim: true },
      phone: { type: String, trim: true },
      department: { type: String, trim: true },
      designation: { type: String, trim: true },
      badgeId: { type: String, trim: true },
      centerName: { type: String, trim: true },
      centerAddress: { type: String, trim: true },
      centerRole: { type: String, trim: true },
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const RoleProfile = mongoose.model('RoleProfile', roleProfileSchema);

export default RoleProfile;
