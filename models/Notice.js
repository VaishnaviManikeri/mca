const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  fileUrl: String,
  cloudinaryId: String,
  date: {
    type: Date,
    default: Date.now
  },
  expiryDate: Date
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);