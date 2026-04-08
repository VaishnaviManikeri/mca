const Blog = require('../models/Blog');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

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

const getAllBlogsAdmin = async (req, res) => {
  try {
    const blogs = await Blog.find({})
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching all blogs:', error);
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
    console.log('Received blog creation request');
    console.log('Body:', req.body);
    console.log('File:', req.file);

    let imageUrl = '';
    let cloudinaryId = '';

    // Handle image upload if file exists
    if (req.file) {
      try {
        // Check if cloudinary is configured
        if (!cloudinary.config().cloud_name) {
          console.error('Cloudinary not configured properly');
          return res.status(500).json({ message: 'Cloudinary configuration missing' });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'blogs',
          use_filename: true,
          unique_filename: true
        });
        
        imageUrl = result.secure_url;
        cloudinaryId = result.public_id;
        
        // Remove temporary file
        fs.unlinkSync(req.file.path);
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        return res.status(500).json({ message: 'Failed to upload image: ' + cloudinaryError.message });
      }
    }

    // Calculate read time (approx 200 words per minute)
    const textContent = req.body.content.replace(/<[^>]*>/g, '');
    const wordCount = textContent.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    // Create blog data
    const blogData = {
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      imageUrl,
      cloudinaryId,
      tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : JSON.parse(req.body.tags)) : [],
      readTime: readTime,
      metaTitle: req.body.metaTitle || req.body.title,
      metaDescription: req.body.metaDescription || req.body.content.substring(0, 160).replace(/<[^>]*>/g, ''),
      isPublished: req.body.isPublished === 'true' || req.body.isPublished === true
    };

    // Only add slug if provided, otherwise let pre-save hook generate it
    if (req.body.slug && req.body.slug.trim()) {
      blogData.slug = req.body.slug;
    }

    const blog = await Blog.create(blogData);
    res.status(201).json(blog);
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ 
      message: 'Failed to create blog post',
      error: error.message
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

    // Handle new image upload
    if (req.file) {
      // Delete old image if exists
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
        
        // Remove temporary file
        fs.unlinkSync(req.file.path);
      } catch (error) {
        console.error('Error uploading new image:', error);
        return res.status(500).json({ message: 'Failed to upload new image' });
      }
    }

    // Calculate read time
    const textContent = req.body.content.replace(/<[^>]*>/g, '');
    const wordCount = textContent.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    const updateData = {
      title: req.body.title || blog.title,
      content: req.body.content || blog.content,
      author: req.body.author || blog.author,
      imageUrl,
      cloudinaryId,
      tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : JSON.parse(req.body.tags)) : blog.tags,
      readTime: readTime,
      metaTitle: req.body.metaTitle || req.body.title || blog.metaTitle,
      metaDescription: req.body.metaDescription || blog.metaDescription,
      isPublished: req.body.isPublished === 'true' || req.body.isPublished === true || req.body.isPublished === blog.isPublished
    };

    // Only update slug if explicitly provided and different
    if (req.body.slug && req.body.slug.trim() && req.body.slug !== blog.slug) {
      updateData.slug = req.body.slug;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
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

    // Delete image from cloudinary if exists
    if (blog.cloudinaryId) {
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

module.exports = { 
  getAllBlogs, 
  getBlogBySlug, 
  createBlog, 
  updateBlog, 
  deleteBlog,
  getAllBlogsAdmin 
};
