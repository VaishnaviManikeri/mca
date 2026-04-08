const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true,
    maxLength: 200
  },
  featuredImage: {
    type: String,
    required: true
  },
  author: {
    name: {
      type: String,
      required: true,
      default: 'Admin'
    },
    avatar: String
  },
  readingTime: {
    type: Number,
    required: true
  },
  tags: [String],
  metaTitle: String,
  metaDescription: String,
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate slug from title before saving
blogSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  this.updatedAt = Date.now();
  next();
});

// Calculate reading time
blogSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    const wordsPerMinute = 200;
    const wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / wordsPerMinute);
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
