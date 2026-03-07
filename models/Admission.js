const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  // Course Details
  academicYear: {
    start: String,
    end: String
  },
  courseApplied: String,
  medium: String,

  // Personal Details
  surname: String,
  firstName: String,
  fatherName: String,
  nameInDevnagari: String,
  motherName: String,
  sex: String,
  nameChange: String,
  dateOfBirth: Date,
  maritalStatus: String,
  bloodGroup: String,
  motherTongue: String,
  nationality: String,
  religion: String,
  maharashtrian: String,
  aadharCardNo: String,
  cast: String,
  category: String,
  creamyLayer: String,
  otherLanguages: String,

  // Address Details
  presentAddress: String,
  presentAddressPin: String,
  permanentAddress: String,
  permanentAddressPin: String,

  // Contact Details
  studentContact: String,
  phone1: String,
  phone2: String,
  emailId: String,

  // Subjects Offered & Last College
  subjectsOffered: String,
  lastCollegeName: String,
  lastCollegeAddress: String,

  // Academic Records (array of records)
  academicRecords: [{
    examination: String,
    boardUniversity: String,
    yearOfPassing: String,
    percentage: String
  }],

  // Signatures
  applicantSignature: String,
  parentSignature: String,
  applicationDate: Date,

  // Metadata
  submittedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: String
});

module.exports = mongoose.model('Admission', admissionSchema);