const mongoose = require('mongoose');

const artifactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    craft: { type: mongoose.Schema.Types.ObjectId, ref: 'Craft', default: null },
    craftName: { type: String, default: '' },
    artisan: { type: mongoose.Schema.Types.ObjectId, ref: 'Artisan', default: null },
    artisanName: { type: String, default: '' },
    eraOrYear: { type: String, default: 'Đương đại' },
    dimensions: { type: String, default: '' },
    material: { type: String, default: '' },
    technique: { type: String, default: '' },
    culturalMeaning: { type: String, default: '' },
    description: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    gallery: [{ url: String, caption: String }],
    videoUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Artifact', artifactSchema);