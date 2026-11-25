const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema(
  {
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    submitterName: { type: String, default: '' },
    targetType: {
      type: String,
      enum: ['VILLAGE', 'CRAFT', 'ARTIFACT'],
      required: true
    },
    actionType: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE'],
      default: 'CREATE'
    },
    targetId: { type: String, default: '' },
    title: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    },
    adminNote: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contribution', contributionSchema);