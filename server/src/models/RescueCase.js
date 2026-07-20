import mongoose from 'mongoose';

const treatmentLogSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      required: true,
    },
    treatment: {
      type: String,
    },
    veterinarian: {
      type: String,
    },
    medications: [
      {
        name: String,
        dosage: String,
      },
    ],
  },
  { timestamps: true },
);

const rescueCaseSchema = new mongoose.Schema(
  {
    caseNumber: {
      type: String,
      unique: true,
      required: true,
    },
    species: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Species',
      required: true,
    },
    animalDetails: {
      age: String,
      sex: String,
      weight: String,
      condition: String,
    },
    rescueLocation: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
    },
    rescueReason: {
      type: String,
      required: true,
    },
    rescuer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    center: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['intake', 'in_care', 'released', 'deceased'],
      default: 'intake',
    },
    treatmentLogs: [treatmentLogSchema],
    releaseNotes: {
      type: String,
    },
  },
  { timestamps: true },
);

rescueCaseSchema.index({ rescueLocation: '2dsphere' });

const RescueCase = mongoose.model('RescueCase', rescueCaseSchema);

export default RescueCase;
