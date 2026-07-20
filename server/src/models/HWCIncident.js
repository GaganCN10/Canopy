import mongoose from 'mongoose';

const hwcIncidentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Incident type is required'],
      enum: ['crop_raiding', 'livestock_predation', 'property_damage', 'injury', 'fatal', 'other'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
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
    lossDescription: {
      type: String,
    },
    images: [
      {
        url: String,
        filename: String,
      },
    ],
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['reported', 'investigating', 'resolved', 'closed'],
      default: 'reported',
    },
  },
  { timestamps: true },
);

hwcIncidentSchema.index({ location: '2dsphere' });

const HWCIncident = mongoose.model('HWCIncident', hwcIncidentSchema);

export default HWCIncident;
