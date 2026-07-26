import mongoose from 'mongoose';

const quizQuestionSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['single-choice', 'multi-choice', 'true-false'],
      default: 'single-choice',
    },
    options: [
      {
        id: {
          type: String,
          required: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    correctOptionIds: {
      type: [String],
      required: [true, 'At least one correct answer is required'],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: 'At least one correct answer is required',
      },
    },
    explanation: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

quizQuestionSchema.index({ quiz: 1, order: 1 });

const QuizQuestion = mongoose.model('QuizQuestion', quizQuestionSchema);

export default QuizQuestion;
