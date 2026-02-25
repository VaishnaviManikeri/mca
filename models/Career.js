const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  location: String,
  description: {
    type: String,
    required: true
  },
  requirements: [String],
  salary: String,
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    default: 'Full-time'
  },
  deadline: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Career', careerSchema);