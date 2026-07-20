import mongoose from 'mongoose';

const sightingSchema = new mongoose.Schema(
  {
    species: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Species',
      required: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    notes: {
      type: String,
    },
    images: [
      {
        url: String,
        filename: String,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    verificationCount: {
      type: Number,
      default: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

sightingSchema.index({ location: '2dsphere' });
sightingSchema.index({ species: 1, status: 1 });
sightingSchema.index({ timestamp: -1 });

const Sighting = mongoose.model('Sighting', sightingSchema);

export default Sighting;
