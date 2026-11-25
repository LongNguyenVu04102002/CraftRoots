const mongoose = require('mongoose');

const craftSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    directory: { type: mongoose.Schema.Types.ObjectId, ref: 'CraftDirectory', default: null },
    category: { type: String, required: true },
    village: { type: mongoose.Schema.Types.ObjectId, ref: 'Village', default: null },
    villageName: { type: String, default: '' },
    regionName: { type: String, default: '' },
    culturalBackground: { type: String, default: '' },
    history: { type: String, default: '' },
    material: { type: String, default: '' },
    technique: { type: String, default: '' },
    tools: [{ type: String }],
    process: [{ type: String }],
    traditionalUse: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    gallery: [{ url: String, caption: String }],
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Craft', craftSchema);