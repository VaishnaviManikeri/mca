const Career = require('../models/Career');

const getAllCareers = async (req, res) => {
  try {
    const careers = await Career.find({ isActive: true })
      .sort({ createdAt: -1 });
    res.json(careers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCareer = async (req, res) => {
  try {
    const career = await Career.create(req.body);
    res.status(201).json(career);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCareer = async (req, res) => {
  try {
    const career = await Career.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(career);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCareer = async (req, res) => {
  try {
    await Career.findByIdAndDelete(req.params.id);
    res.json({ message: 'Career deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllCareers, createCareer, updateCareer, deleteCareer };