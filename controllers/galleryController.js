const Gallery = require('../models/Gallery');
const cloudinary = require('../config/cloudinary');

const getAllGallery = async (req, res) => {
  try {
    const gallery = await Gallery.find().sort({ createdAt: -1 });
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createGallery = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'gallery'
    });

    const gallery = await Gallery.create({
      title,
      description,
      category,
      imageUrl: result.secure_url,
      cloudinaryId: result.public_id
    });

    res.status(201).json(gallery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    let imageUrl = gallery.imageUrl;
    let cloudinaryId = gallery.cloudinaryId;

    if (req.file) {
      // Delete old image from Cloudinary
      await cloudinary.uploader.destroy(gallery.cloudinaryId);
      
      // Upload new image
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'gallery'
      });
      
      imageUrl = result.secure_url;
      cloudinaryId = result.public_id;
    }

    const updatedGallery = await Gallery.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title || gallery.title,
        description: req.body.description || gallery.description,
        category: req.body.category || gallery.category,
        imageUrl,
        cloudinaryId
      },
      { new: true }
    );

    res.json(updatedGallery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(gallery.cloudinaryId);

    await gallery.deleteOne();
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllGallery, createGallery, updateGallery, deleteGallery };