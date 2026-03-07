const Admission = require('../models/Admission');
const { writeToExcel } = require('../utils/excelGenerator');
const path = require('path');
const fs = require('fs');

// @desc    Submit new admission form
// @route   POST /api/admissions/submit
// @access  Public
const submitAdmission = async (req, res) => {
  try {
    // Create new admission record
    const admissionData = {
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    // Parse academic records if sent as JSON string
    if (req.body.academicRecords && typeof req.body.academicRecords === 'string') {
      admissionData.academicRecords = JSON.parse(req.body.academicRecords);
    }

    // Parse fees installments if sent as JSON string
    if (req.body.feesPayment?.installments && typeof req.body.feesPayment.installments === 'string') {
      admissionData.feesPayment.installments = JSON.parse(req.body.feesPayment.installments);
    }

    const admission = new Admission(admissionData);
    await admission.save();

    // Write to Excel file
    try {
      await writeToExcel(admission);
    } catch (excelError) {
      console.error('Excel write error:', excelError);
      // Don't fail the request if Excel write fails
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: admission
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting application',
      error: error.message
    });
  }
};

// @desc    Get all admissions (admin only)
// @route   GET /api/admissions/all
// @access  Private
const getAllAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find().sort({ submittedAt: -1 });
    res.json({
      success: true,
      data: admissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admissions',
      error: error.message
    });
  }
};

// @desc    Download admissions as Excel (admin only)
// @route   GET /api/admissions/download-excel
// @access  Private
const downloadExcel = async (req, res) => {
  try {
    const admissions = await Admission.find().sort({ submittedAt: -1 });
    
    // Generate fresh Excel file
    const filePath = path.join(__dirname, '../../uploads/admission.xlsx');
    await writeToExcel(admissions, filePath, true); // true indicates generate full file

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