const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
    role: {
      type: String,
      enum: ['USER', 'ARTISAN', 'ADMIN'],
      default: 'USER'
    },
    isLocked: { type: Boolean, default: false },
    artisanProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Artisan', default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);