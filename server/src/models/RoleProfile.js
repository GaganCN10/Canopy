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
      fullName: { type: String, trim: true },
      dateOfBirth: { type: String, trim: true },
      gender: { type: String, trim: true },
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
      emergencyContact: { type: String, trim: true },
      emergencyPhone: { type: String, trim: true },
      qualifications: { type: String, trim: true },
      experience: { type: String, trim: true },
      specializations: { type: String, trim: true },
      certifications: { type: String, trim: true },
      languages: { type: String, trim: true },
      bio: { type: String, trim: true },
      profilePhoto: { type: String, trim: true },
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
