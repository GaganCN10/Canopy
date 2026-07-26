import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },
    body: {
      type: String,
      required: [true, 'Body is required'],
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      enum: ['species-id', 'habitats', 'coexistence', 'anti-poaching', 'citizen-science', 'ecosystems', 'other'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    readTimeMinutes: {
      type: Number,
      default: 0,
    },
    publishedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

articleSchema.index({ topic: 1, status: 1 });

const Article = mongoose.model('Article', articleSchema);

export default Article;
