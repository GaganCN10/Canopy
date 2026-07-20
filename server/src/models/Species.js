import mongoose from 'mongoose';

const speciesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Species name is required'],
      trim: true,
    },
    scientificName: {
      type: String,
      trim: true,
    },
    conservationStatus: {
      type: String,
      enum: ['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'DD', 'NE'],
      default: 'DD',
    },
    description: {
      type: String,
    },
    region: {
      type: [String],
      default: [],
    },
    images: [
      {
        url: String,
        filename: String,
      },
    ],
  },
  { timestamps: true },
);

const Species = mongoose.model('Species', speciesSchema);

export default Species;
