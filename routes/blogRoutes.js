const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for Render.com (use /tmp for writes)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = '/tmp/uploads/blogs';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Public routes
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published' }).sort('-createdAt');
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' });
    if (!blog) return res.status(404).json({ error: 'Not found' });
    blog.views += 1;
    await blog.save();
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin routes
router.get('/admin/all', protect, async (req, res) => {
  try {
    const blogs = await Blog.find().sort('-createdAt');
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin', protect, upload.single('featuredImage'), async (req, res) => {
  try {
    const { title, content, excerpt, author, status, tags } = req.body;
    
    // Create slug
    let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let existing = await Blog.findOne({ slug });
    let counter = 1;
    while (existing) {
      slug = `${slug}-${counter}`;
      existing = await Blog.findOne({ slug });
      counter++;
    }
    
    // Calculate read time
    const plainText = content.replace(/<[^>]*>/g, '');
    const wordCount = plainText.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));
    
    const blog = new Blog({
      title,
      slug,
      content,
      excerpt: excerpt || plainText.substring(0, 160),
      featuredImage: req.file ? `/uploads/blogs/${req.file.filename}` : null,
      author: author || 'Admin',
      readTime,
      status: status || 'draft',
      tags: tags ? tags.split(',').map(t => t.trim()) : []
    });
    
    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    console.error('Create error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/:id', protect, upload.single('featuredImage'), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Not found' });
    
    const { title, content, excerpt, author, status, tags } = req.body;
    
    if (title && title !== blog.title) {
      let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      let existing = await Blog.findOne({ slug, _id: { $ne: req.params.id } });
      let counter = 1;
      while (existing) {
        slug = `${slug}-${counter}`;
        existing = await Blog.findOne({ slug, _id: { $ne: req.params.id } });
        counter++;
      }
      blog.slug = slug;
      blog.title = title;
    }
    
    if (content) {
      blog.content = content;
      const plainText = content.replace(/<[^>]*>/g, '');
      blog.readTime = Math.max(1, Math.ceil(plainText.split(/\s+/).length / 200));
    }
    
    if (req.file) blog.featuredImage = `/uploads/blogs/${req.file.filename}`;
    if (excerpt) blog.excerpt = excerpt;
    if (author) blog.author = author;
    if (status) blog.status = status;
    if (tags) blog.tags = tags.split(',').map(t => t.trim());
    
    await blog.save();
    res.json(blog);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/admin/:id', protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Not found' });
    await blog.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
