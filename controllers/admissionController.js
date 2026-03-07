const Admission = require('../models/Admission');
const { generateExcel } = require('../utils/excelGenerator');
const fs = require('fs');

// @desc    Submit new admission form
// @route   POST /api/admissions
// @access  Public
const submitAdmission = async (req, res) => {
  try {
    // Parse academic records if they exist
    let academicRecords = [];
    if (req.body.academicRecords) {
      try {
        academicRecords = JSON.parse(req.body.academicRecords);
      } catch (e) {
        academicRecords = req.body.academicRecords;
      }
    }

    // Create admission object
    const admissionData = {
      ...req.body,
      academicRecords,
      dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : null
    };

    // Save to database
    const admission = new Admission(admissionData);
    await admission.save();

    // Update Excel file with all admissions
    const allAdmissions = await Admission.find().sort({ submittedAt: -1 });
    await generateExcel(allAdmissions);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: admission
    });
  } catch (error) {
    console.error('Error submitting admission:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting application',
      error: error.message
    });
  }
};

// @desc    Get all admissions (Admin only)
// @route   GET /api/admissions
// @access  Private (Admin)
const getAllAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find().sort({ submittedAt: -1 });
    res.json({
      success: true,
      data: admissions
    });
  } catch (error) {
    console.error('Error fetching admissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admissions',
      error: error.message
    });
  }
};

// @desc    Download Excel file (Admin only)
// @route   GET /api/admissions/download
// @access  Private (Admin)
const downloadExcel = async (req, res) => {
  try {
    const admissions = await Admission.find().sort({ submittedAt: -1 });
    const filePath = await generateExcel(admissions);
    
    res.download(filePath, 'admissions.xlsx', (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({
          success: false,
          message: 'Error downloading file'
        });
      }
    });
  } catch (error) {
    console.error('Error generating Excel:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating Excel file',
      error: error.message
    });
  }
};

module.exports = {
  submitAdmission,
  getAllAdmissions,
  downloadExcel
};