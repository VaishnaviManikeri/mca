const Notice = require('../models/Notice');
const cloudinary = require('../config/cloudinary');

const getAllNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ date: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createNotice = async (req, res) => {
  try {
    let fileUrl, cloudinaryId;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'notices',
        resource_type: 'auto'
      });
      fileUrl = result.secure_url;
      cloudinaryId = result.public_id;
    }

    const notice = await Notice.create({
      ...req.body,
      fileUrl,
      cloudinaryId
    });

    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    let fileUrl = notice.fileUrl;
    let cloudinaryId = notice.cloudinaryId;

    if (req.file) {
      if (notice.cloudinaryId) {
        await cloudinary.uploader.destroy(notice.cloudinaryId);
      }
      
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'notices',
        resource_type: 'auto'
      });
      
      fileUrl = result.secure_url;
      cloudinaryId = result.public_id;
    }

    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id,
      { ...req.body, fileUrl, cloudinaryId },
      { new: true }
    );

    res.json(updatedNotice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (notice && notice.cloudinaryId) {
      await cloudinary.uploader.destroy(notice.cloudinaryId);
    }

    await notice.deleteOne();
    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllNotices, createNotice, updateNotice, deleteNotice };