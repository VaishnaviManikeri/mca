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

const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true });
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    blog.views += 1;
    await blog.save();
    res.json(blog);
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

    // Generate excerpt from content (strip HTML tags)
    const excerpt = req.body.content.replace(/<[^>]*>/g, '').substring(0, 160);

    const blog = await Blog.create({
      ...req.body,
      excerpt,
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

    // Update excerpt if content changed
    let excerpt = req.body.excerpt;
    if (req.body.content && req.body.content !== blog.content) {
      excerpt = req.body.content.replace(/<[^>]*>/g, '').substring(0, 160);
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { ...req.body, excerpt, imageUrl, cloudinaryId },
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

module.exports = { getAllBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog };
