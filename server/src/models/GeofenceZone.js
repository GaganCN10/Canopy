import mongoose from 'mongoose';

const geofenceZoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Zone name is required'],
      trim: true,
    },
    description: {
      type: String,
    },
    geometry: {
      type: {
        type: String,
        enum: ['Polygon'],
        required: true,
      },
      coordinates: {
        type: [[[Number]]],
        required: true,
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

geofenceZoneSchema.index({ geometry: '2dsphere' });

const GeofenceZone = mongoose.model('GeofenceZone', geofenceZoneSchema);

export default GeofenceZone;
