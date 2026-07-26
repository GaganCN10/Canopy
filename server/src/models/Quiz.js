import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
      unique: true,
    },
    passThresholdPercent: {
      type: Number,
      min: 0,
      max: 100,
    },
    retakePolicy: {
      type: String,
      required: true,
      enum: ['unlimited', 'single-attempt'],
      default: 'unlimited',
    },
  },
  { timestamps: true }
);

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
