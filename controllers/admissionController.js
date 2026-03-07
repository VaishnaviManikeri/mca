const Admission = require('../models/Admission');
const { writeToExcel } = require('../utils/excelGenerator');

// @desc    Submit admission form
// @route   POST /api/admission/submit
// @access  Public
const submitAdmission = async (req, res) => {
  try {
    // Create new admission record
    const admissionData = {
      ...req.body,
      ipAddress: req.ip || req.connection.remoteAddress
    };

    // Parse academic records if they come as string
    if (typeof req.body.academicRecords === 'string') {
      admissionData.academicRecords = JSON.parse(req.body.academicRecords);
    }

    const admission = new Admission(admissionData);
    await admission.save();

    // Write to Excel file
    try {
      await writeToExcel(admission);
    } catch (excelError) {
      console.error('Excel write error:', excelError);
      // Continue even if Excel write fails
    }

    res.status(201).json({
      success: true,
      message: 'Admission form submitted successfully',
      data: admission
    });
  } catch (error) {
    console.error('Admission submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting admission form',
      error: error.message
    });
  }
};

// @desc    Get all admissions (admin only)
// @route   GET /api/admission/all
// @access  Private (Admin)
const getAllAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find().sort({ submittedAt: -1 });
    res.status(200).json({
      success: true,
      count: admissions.length,
      data: admissions
    });
  } catch (error) {
    console.error('Get admissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admissions',
      error: error.message
    });
  }
};

// @desc    Download Excel file
// @route   GET /api/admission/download-excel
// @access  Private (Admin)
const downloadExcel = async (req, res) => {
  try {
    const admissions = await Admission.find().sort({ submittedAt: -1 });
    const filePath = await writeToExcel(admissions, true); // true = return file path
    
    res.download(filePath, 'admissions.xlsx', (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({
          success: false,
          message: 'Error downloading file'
        });
      }
    });
  } catch (error) {
    console.error('Download excel error:', error);
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