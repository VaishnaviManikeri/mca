const Blog = require('../models/Blog');
const cloudinary = require('../config/cloudinary');

const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true })
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: error.message });
  }
};

const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true });
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog by slug:', error);
    res.status(500).json({ message: error.message });
  }
};

const createBlog = async (req, res) => {
  try {
    console.log('Received blog creation request:', req.body);
    console.log('File received:', req.file);

    let imageUrl, cloudinaryId;

    if (req.file) {
      // Check if cloudinary is configured
      if (!cloudinary || !cloudinary.uploader) {
        console.error('Cloudinary not configured properly');
        return res.status(500).json({ message: 'Image upload service not configured' });
      }
      
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'blogs'
        });
        imageUrl = result.secure_url;
        cloudinaryId = result.public_id;
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        return res.status(500).json({ message: 'Failed to upload image to cloud storage' });
      }
    }

    // Generate slug from title if not provided
    let slug = req.body.slug;
    if (!slug && req.body.title) {
      slug = req.body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // Check if slug already exists
    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      slug = `${slug}-${Date.now()}`;
    }

    const blogData = {
      title: req.body.title,
      slug: slug,
      content: req.body.content,
      author: req.body.author,
      imageUrl,
      cloudinaryId,
      tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : JSON.parse(req.body.tags)) : [],
      readTime: req.body.readTime || Math.ceil(req.body.content.length / 1000),
      metaTitle: req.body.metaTitle,
      metaDescription: req.body.metaDescription,
      isPublished: req.body.isPublished === 'true' || req.body.isPublished === true
    };

    const blog = await Blog.create(blogData);
    res.status(201).json(blog);
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ 
      message: 'Failed to create blog post',
      error: error.message,
      details: error.errors 
    });
  }
};

const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    let imageUrl = blog.imageUrl;
    let cloudinaryId = blog.cloudinaryId;

    if (req.file) {
      if (blog.cloudinaryId) {
        try {
          await cloudinary.uploader.destroy(blog.cloudinaryId);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
      
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'blogs'
        });
        imageUrl = result.secure_url;
        cloudinaryId = result.public_id;
      } catch (error) {
        console.error('Error uploading new image:', error);
      }
    }

    // Handle slug update
    let slug = req.body.slug;
    if (!slug && req.body.title && req.body.title !== blog.title) {
      slug = req.body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Check if new slug already exists
      const existingBlog = await Blog.findOne({ slug, _id: { $ne: req.params.id } });
      if (existingBlog) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        slug: slug || blog.slug,
        imageUrl,
        cloudinaryId,
        tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : JSON.parse(req.body.tags)) : blog.tags,
        isPublished: req.body.isPublished === 'true' || req.body.isPublished === true || req.body.isPublished === blog.isPublished
      },
      { new: true, runValidators: true }
    );

    res.json(updatedBlog);
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog && blog.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(blog.cloudinaryId);
      } catch (error) {
        console.error('Error deleting image from cloudinary:', error);
      }
    }

    await blog.deleteOne();
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog };
