const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  // Course Details
  academicYear: {
    start: String,
    end: String
  },
  courseAppliedFor: String,
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
  isMaharashtrian: {
    type: String,
    enum: ['Maharashtrian', 'Non-Maharashtrian']
  },
  aadharCardNo: String,
  cast: String,
  category: String,
  otherCategory: String,
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

  // Subjects Offered & Last College
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

  // Signatures
  studentSignature: String,
  parentSignature: String,
  applicationDate: Date,

  // Undertaking - Fees
  undertakingFees: {
    parentName: String,
    studentName: String,
    studentFatherName: String,
    course: String,
    parentSignature: String,
    studentSignature: String
  },

  // Undertaking - Attendance
  undertakingAttendance: {
    studentName: String,
    fathersName: String,
    className: String,
    branch: String,
    rollNo: String,
    parentSignature: String,
    studentSignature: String
  },

  // Documents Checklist
  documents: {
    gradCertificate: Boolean,
    tenthMarksheet: Boolean,
    twelfthMarksheet: Boolean,
    leavingCertificate: Boolean,
    migrationCertificate: Boolean,
    gapAffidavit: Boolean,
    passportPhotos: Boolean,
    casteCertificate: Boolean,
    nameChangeCertificate: Boolean,
    aadharCard: Boolean
  },

  // Fees Payment
  feesPayment: {
    totalFees: String,
    registrationFees: String,
    installments: [{
      amount: String,
      dueDate: Date
    }]
  },

  // Metadata
  submittedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String
});

module.exports = mongoose.model('Admission', admissionSchema);