const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads/blogs';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// GET all published blogs (public)
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .select('title slug excerpt featuredImage author readTime createdAt updatedAt tags');
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single blog by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' });
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    // Increment view count
    blog.views += 1;
    await blog.save();
    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ error: error.message });
  }
});

// ADMIN ROUTES

// GET all blogs for admin (including drafts)
router.get('/admin/all', protect, async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching admin blogs:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single blog by ID for admin
router.get('/admin/:id', protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog by ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// CREATE new blog
router.post('/admin', protect, upload.single('featuredImage'), async (req, res) => {
  try {
    console.log('Received blog creation request');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    const { title, content, excerpt, author, status, metaTitle, metaDescription, tags } = req.body;
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    // Generate slug from title
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Check if slug exists and make it unique
    let existingBlog = await Blog.findOne({ slug });
    let counter = 1;
    while (existingBlog) {
      slug = `${slug}-${counter}`;
      existingBlog = await Blog.findOne({ slug });
      counter++;
    }
    
    // Calculate read time (approx 200 words per minute)
    const plainText = content.replace(/<[^>]*>/g, '');
    const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));
    
    // Parse tags
    let tagsArray = [];
    if (tags) {
      tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
    
    const blog = new Blog({
      title,
      slug,
      content,
      excerpt: excerpt || plainText.substring(0, 160),
      featuredImage: req.file ? `/uploads/blogs/${req.file.filename}` : null,
      author: author || 'Admin',
      readTime,
      status: status || 'draft',
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || (excerpt || plainText.substring(0, 160)),
      tags: tagsArray
    });
    
    await blog.save();
    console.log('Blog created successfully:', blog._id);
    res.status(201).json(blog);
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// UPDATE blog
router.put('/admin/:id', protect, upload.single('featuredImage'), async (req, res) => {
  try {
    console.log('Received blog update request for ID:', req.params.id);
    
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    const { title, content, excerpt, author, status, metaTitle, metaDescription, tags } = req.body;
    
    // Update slug if title changed
    let slug = blog.slug;
    if (title && title !== blog.title) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      let existingBlog = await Blog.findOne({ slug, _id: { $ne: req.params.id } });
      let counter = 1;
      while (existingBlog) {
        slug = `${slug}-${counter}`;
        existingBlog = await Blog.findOne({ slug, _id: { $ne: req.params.id } });
        counter++;
      }
    }
    
    // Update read time if content changed
    let readTime = blog.readTime;
    if (content && content !== blog.content) {
      const plainText = content.replace(/<[^>]*>/g, '');
      const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
      readTime = Math.max(1, Math.ceil(wordCount / 200));
    }
    
    // Parse tags
    let tagsArray = blog.tags;
    if (tags !== undefined) {
      tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
    
    blog.title = title || blog.title;
    blog.slug = slug;
    blog.content = content || blog.content;
    blog.excerpt = excerpt || (content ? content.replace(/<[^>]*>/g, '').substring(0, 160) : blog.excerpt);
    
    if (req.file) {
      // Delete old image if exists
      if (blog.featuredImage) {
        const oldImagePath = path.join(__dirname, '..', blog.featuredImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      blog.featuredImage = `/uploads/blogs/${req.file.filename}`;
    }
    
    blog.author = author || blog.author;
    blog.readTime = readTime;
    blog.status = status || blog.status;
    blog.metaTitle = metaTitle || blog.metaTitle;
    blog.metaDescription = metaDescription || blog.metaDescription;
    blog.tags = tagsArray;
    
    await blog.save();
    console.log('Blog updated successfully:', blog._id);
    res.json(blog);
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// DELETE blog
router.delete('/admin/:id', protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    // Delete featured image if exists
    if (blog.featuredImage) {
      const imagePath = path.join(__dirname, '..', blog.featuredImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await blog.deleteOne();
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
