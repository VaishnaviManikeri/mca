const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Blog = require('../models/Blog');
const { protect } = require('../middleware/auth');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/blogs/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, '../uploads/blogs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Public routes
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .select('title slug excerpt featuredImage author readingTime createdAt tags');
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' });
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    // Increment views
    blog.views += 1;
    await blog.save();
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin routes
router.post('/', protect, upload.single('featuredImage'), async (req, res) => {
  try {
    const { title, content, excerpt, authorName, tags, metaTitle, metaDescription, status } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Featured image is required' });
    }

    const blog = new Blog({
      title,
      content,
      excerpt,
      featuredImage: `/uploads/blogs/${req.file.filename}`,
      author: { name: authorName || 'Admin' },
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      status: status || 'published'
    });

    const savedBlog = await blog.save();
    res.status(201).json(savedBlog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', protect, upload.single('featuredImage'), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const updateData = {
      title: req.body.title,
      content: req.body.content,
      excerpt: req.body.excerpt,
      author: { name: req.body.authorName || blog.author.name },
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : blog.tags,
      metaTitle: req.body.metaTitle || req.body.title,
      metaDescription: req.body.metaDescription || req.body.excerpt,
      status: req.body.status || blog.status
    };

    if (req.file) {
      // Delete old image if exists
      const oldImagePath = path.join(__dirname, '..', blog.featuredImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      updateData.featuredImage = `/uploads/blogs/${req.file.filename}`;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedBlog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Delete featured image
    const imagePath = path.join(__dirname, '..', blog.featuredImage);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await blog.deleteOne();
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all blogs for admin
router.get('/admin/all', protect, async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
