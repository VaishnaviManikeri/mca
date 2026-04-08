const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  author: {
    type: String,
    required: [true, 'Author is required']
  },
  imageUrl: {
    type: String,
    default: ''
  },
  cloudinaryId: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  readTime: {
    type: Number,
    default: 0
  },
  metaTitle: String,
  metaDescription: String,
  isPublished: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Generate slug from title before saving (only if slug is not provided)
blogSchema.pre('save', async function(next) {
  if (this.isModified('title') && (!this.slug || this.slug === '')) {
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Check if slug exists
    let slug = baseSlug;
    let counter = 1;
    while (await mongoose.model('Blog').findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    this.slug = slug;
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
