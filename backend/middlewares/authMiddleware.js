const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Vui lòng đăng nhập để thực hiện chức năng này.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'craftroots_secret');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Tài khoản không tồn tại.' });
    }
    if (user.isLocked) {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa bởi Quản trị viên.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Phiên đăng nhập hết hạn hoặc không hợp lệ.' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này.' });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };