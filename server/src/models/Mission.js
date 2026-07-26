import mongoose from 'mongoose';

const missionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      enum: ['cleanup', 'monitoring', 'awareness_education', 'data_tagging', 'rescue_support', 'advocacy', 'other'],
    },
    locationType: {
      type: String,
      required: [true, 'Location type is required'],
      enum: ['remote', 'onsite', 'hybrid'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: function () {
          return this.locationType === 'onsite' || this.locationType === 'hybrid';
        },
      },
      coordinates: {
        type: [Number],
        required: function () {
          return this.locationType === 'onsite' || this.locationType === 'hybrid';
        },
        validate: {
          validator: function (v) {
            return v.length === 2 && !isNaN(v[0]) && !isNaN(v[1]);
          },
          message: 'Coordinates must be [longitude, latitude]',
        },
      },
    },
    address: {
      type: String,
      trim: true,
      required: function () {
        return this.locationType === 'onsite' || this.locationType === 'hybrid';
      },
    },
    joinType: {
      type: String,
      required: true,
      enum: ['open', 'request'],
      default: 'open',
    },
    memberCap: {
      type: Number,
      min: [1, 'Member cap must be at least 1'],
      validate: {
        validator: function (v) {
          return v === null || v > 0;
        },
        message: 'Member cap must be a positive number',
      },
    },
    status: {
      type: String,
      required: true,
      enum: ['planning', 'active', 'completed', 'archived', 'cancelled'],
      default: 'planning',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coLeads: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    targetDate: {
      type: Date,
    },
  },
  { timestamps: true },
);

missionSchema.index({ location: '2dsphere' }, { sparse: true });

const Mission = mongoose.model('Mission', missionSchema);

export default Mission;
