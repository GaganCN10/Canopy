import mongoose from 'mongoose';

const missionThreadPostSchema = new mongoose.Schema(
  {
    mission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mission',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['post', 'update'],
      default: 'post',
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
      maxlength: [2000, 'Content cannot exceed 2000 characters'],
    },
    attachments: [
      {
        type: String,
        trim: true,
      },
    ],
    parentPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MissionThreadPost',
      default: null,
    },
  },
  { timestamps: true }
);

missionThreadPostSchema.index({ mission: 1, createdAt: -1 });

const MissionThreadPost = mongoose.model('MissionThreadPost', missionThreadPostSchema);

export default MissionThreadPost;
