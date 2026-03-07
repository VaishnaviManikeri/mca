const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  // Course Details
  academicYear: {
    start: String,
    end: String
  },
  courseApplied: String,
  medium: {
    type: String,
    enum: ['English', 'Marathi']
  },

  // Personal Details
  surname: String,
  firstName: String,
  fathersName: String,
  nameInDevnagari: String,
  mothersName: String,
  sex: {
    type: String,
    enum: ['Male', 'Female']
  },
  nameChange: String,
  dateOfBirth: Date,
  maritalStatus: {
    type: String,
    enum: ['Married', 'Unmarried']
  },
  bloodGroup: String,
  motherTongue: String,
  nationality: String,
  religion: String,
  maharashtrian: {
    type: String,
    enum: ['Maharashtrian', 'Non-Maharashtrian']
  },
  aadharCardNo: String,
  cast: String,
  category: String,
  creamyLayer: {
    type: String,
    enum: ['Yes', 'No']
  },
  otherLanguages: String,

  // Address Details
  presentAddress: String,
  presentPin: String,
  permanentAddress: String,
  permanentPin: String,

  // Contact Details
  studentContact: String,
  phone1: String,
  phone2: String,
  emailId: String,

  // Subjects and Last College
  subjectsOffered: String,
  lastCollegeName: String,
  lastCollegeAddress: String,

  // Academic Records
  academicRecords: [{
    srNo: Number,
    examination: String,
    boardUniversity: String,
    yearOfPassing: String,
    percentage: String
  }],

  // Timestamps
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Admission', admissionSchema);