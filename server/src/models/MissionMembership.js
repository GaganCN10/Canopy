import mongoose from 'mongoose';

const missionMembershipSchema = new mongoose.Schema(
  {
    mission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mission',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['lead', 'co-lead', 'member'],
      default: 'member',
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'removed'],
      default: 'approved',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

missionMembershipSchema.index({ mission: 1, user: 1 }, { unique: true });

const MissionMembership = mongoose.model('MissionMembership', missionMembershipSchema);

export default MissionMembership;
