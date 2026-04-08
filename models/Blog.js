const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  content: { type: String, required: true },
  excerpt: { type: String, default: '' },
  featuredImage: { type: String, default: null },
  author: { type: String, default: 'Admin' },
  readTime: { type: Number, default: 3 },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  views: { type: Number, default: 0 },
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  tags: [{ type: String, trim: true }]
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
