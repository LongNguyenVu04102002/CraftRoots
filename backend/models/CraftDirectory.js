const mongoose = require('mongoose');

const craftDirectorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    icon: { type: String, default: 'Sparkles' },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CraftDirectory', craftDirectorySchema);