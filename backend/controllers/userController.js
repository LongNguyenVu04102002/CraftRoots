const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Artisan = require('../models/Artisan');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'craftroots_secret', { expiresIn: '7d' });
};

const toSlug = (str) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email đã được sử dụng.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phone: phone || ''
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('artisanProfile');
    if (!user) return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng.' });
    if (user.isLocked) return res.status(403).json({ message: 'Tài khoản đã bị khóa.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng.' });

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        artisanProfile: user.artisanProfile
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password').populate('artisanProfile');
  res.json(user);
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, phone, ...(avatar ? { avatar } : {}) },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Người dùng gửi đơn đăng ký trở thành Nghệ nhân
exports.applyArtisan = async (req, res) => {
  try {
    const { craftSpecialty, villageName, province, yearsOfExperience, bio, title } = req.body;
    let artisan = await Artisan.findOne({ user: req.user._id });
    if (artisan) {
      return res.status(400).json({ message: 'Bạn đã gửi hồ sơ nghệ nhân trước đó rồi.' });
    }

    artisan = await Artisan.create({
      user: req.user._id,
      fullName: req.user.fullName,
      slug: `${toSlug(req.user.fullName)}-${Date.now().toString().slice(-4)}`,
      title: title || 'Nghệ nhân làng nghề',
      craftSpecialty,
      villageName,
      province,
      yearsOfExperience: Number(yearsOfExperience) || 10,
      bio,
      avatar: req.user.avatar || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=500',
      verificationStatus: 'PENDING'
    });

    await User.findByIdAndUpdate(req.user._id, { artisanProfile: artisan._id });
    res.status(201).json({ message: 'Đã gửi hồ sơ đăng ký nghệ nhân, vui lòng chờ Admin xét duyệt.', artisan });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin quản lý danh sách User
exports.getAllUsers = async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
};

exports.updateUserByAdmin = async (req, res) => {
  try {
    const { role, isLocked } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...(role ? { role } : {}), ...(typeof isLocked === 'boolean' ? { isLocked } : {}) },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};