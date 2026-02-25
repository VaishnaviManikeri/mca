const Blog = require('../models/Blog');
const cloudinary = require('../config/cloudinary');

const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true })
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBlog = async (req, res) => {
  try {
    let imageUrl, cloudinaryId;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'blogs'
      });
      imageUrl = result.secure_url;
      cloudinaryId = result.public_id;
    }

    const blog = await Blog.create({
      ...req.body,
      imageUrl,
      cloudinaryId
    });

    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
        await cloudinary.uploader.destroy(blog.cloudinaryId);
      }
      
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'blogs'
      });
      
      imageUrl = result.secure_url;
      cloudinaryId = result.public_id;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { ...req.body, imageUrl, cloudinaryId },
      { new: true }
    );

    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (blog && blog.cloudinaryId) {
      await cloudinary.uploader.destroy(blog.cloudinaryId);
    }

    await blog.deleteOne();
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllBlogs, createBlog, updateBlog, deleteBlog };