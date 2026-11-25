const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['NEW', 'IN_PROGRESS', 'RESOLVED'],
      default: 'NEW'
    },
    adminReply: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contact', contactSchema);