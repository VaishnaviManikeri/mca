const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// MEMORY STORAGE
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;

    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }

    cb(new Error('Only image files allowed'));
  }
});

// BUFFER TO BASE64
const bufferToBase64 = (buffer, mimetype) => {
  return `data:${mimetype};base64,${buffer.toString('base64')}`;
};





/* ======================================================
                    ADMIN ROUTES
====================================================== */

// GET ALL BLOGS (ADMIN)
router.get('/admin/all', protect, async (req, res) => {
  try {
    const blogs = await Blog.find().sort('-createdAt');

    res.json(blogs);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
});

// GET SINGLE BLOG (ADMIN)
router.get('/admin/:id', protect, async (req, res) => {
  try {

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        error: 'Not found'
      });
    }

    res.json(blog);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
});

// CREATE BLOG
router.post('/admin', protect, upload.single('featuredImage'), async (req, res) => {
  try {

    const {
      title,
      content,
      excerpt,
      author,
      status,
      tags
    } = req.body;

    // CREATE SLUG
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    let existing = await Blog.findOne({ slug });

    let counter = 1;

    while (existing) {

      slug = `${slug}-${counter}`;

      existing = await Blog.findOne({ slug });

      counter++;
    }

    // READ TIME
    const plainText = content.replace(/<[^>]*>/g, '');

    const wordCount = plainText.split(/\s+/).length;

    const readTime = Math.max(
      1,
      Math.ceil(wordCount / 200)
    );

    // IMAGE
    let featuredImage = null;

    if (req.file) {
      featuredImage = bufferToBase64(
        req.file.buffer,
        req.file.mimetype
      );
    }

    const blog = new Blog({
      title,
      slug,
      content,
      excerpt: excerpt || plainText.substring(0, 160),
      featuredImage,
      author: author || 'Admin',
      readTime,
      status: status || 'draft',
      tags: tags
        ? tags.split(',').map(tag => tag.trim())
        : []
    });

    await blog.save();

    res.status(201).json(blog);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message
    });

  }
});

// UPDATE BLOG
router.put('/admin/:id', protect, upload.single('featuredImage'), async (req, res) => {
  try {

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        error: 'Not found'
      });
    }

    const {
      title,
      content,
      excerpt,
      author,
      status,
      tags
    } = req.body;

    // UPDATE TITLE + SLUG
    if (title && title !== blog.title) {

      let slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      let existing = await Blog.findOne({
        slug,
        _id: { $ne: req.params.id }
      });

      let counter = 1;

      while (existing) {

        slug = `${slug}-${counter}`;

        existing = await Blog.findOne({
          slug,
          _id: { $ne: req.params.id }
        });

        counter++;
      }

      blog.slug = slug;
      blog.title = title;
    }

    // UPDATE CONTENT
    if (content) {

      blog.content = content;

      const plainText = content.replace(/<[^>]*>/g, '');

      blog.readTime = Math.max(
        1,
        Math.ceil(
          plainText.split(/\s+/).length / 200
        )
      );
    }

    // UPDATE IMAGE
    if (req.file) {
      blog.featuredImage = bufferToBase64(
        req.file.buffer,
        req.file.mimetype
      );
    }

    if (excerpt) blog.excerpt = excerpt;
    if (author) blog.author = author;
    if (status) blog.status = status;

    if (tags) {
      blog.tags = tags
        .split(',')
        .map(tag => tag.trim());
    }

    await blog.save();

    res.json(blog);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message
    });

  }
});

// DELETE BLOG
router.delete('/admin/:id', protect, async (req, res) => {
  try {

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        error: 'Not found'
      });
    }

    await blog.deleteOne();

    res.json({
      message: 'Deleted successfully'
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
});





/* ======================================================
                    PUBLIC ROUTES
====================================================== */

// GET ALL PUBLISHED BLOGS
router.get('/', async (req, res) => {
  try {

    const blogs = await Blog.find({
      status: 'published'
    }).sort('-createdAt');

    res.json(blogs);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
});

// GET BLOG BY SLUG
router.get('/:slug', async (req, res) => {
  try {

    const blog = await Blog.findOne({
      slug: req.params.slug,
      status: 'published'
    });

    if (!blog) {
      return res.status(404).json({
        error: 'Not found'
      });
    }

    blog.views += 1;

    await blog.save();

    res.json(blog);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
});

module.exports = router;
