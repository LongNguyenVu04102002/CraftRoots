const mongoose = require('mongoose');

const artisanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    fullName: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    title: { type: String, default: 'Nghệ nhân ưu tú' },
    birthYear: { type: Number, default: 1965 },
    yearsOfExperience: { type: Number, default: 25 },
    craftSpecialty: { type: String, required: true },
    villageName: { type: String, default: '' },
    province: { type: String, default: '' },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
    gallery: [{ url: String, caption: String }],
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'VERIFIED'
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Artisan', artisanSchema);