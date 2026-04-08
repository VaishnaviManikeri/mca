const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    sparse: true // Allow null/undefined for existing documents
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  imageUrl: String,
  cloudinaryId: String,
  tags: [String],
  readTime: Number,
  metaTitle: String,
  metaDescription: String,
  isPublished: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Generate slug from title before saving
blogSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
