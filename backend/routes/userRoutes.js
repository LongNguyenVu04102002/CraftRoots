// ROUTES USER
// Khai báo URL API tài khoản và gắn từng URL với hàm trong userController.
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/profile', protect, ctrl.getProfile);
router.put('/profile', protect, ctrl.updateProfile);
router.post('/apply-artisan', protect, ctrl.applyArtisan);
router.get('/', protect, authorizeRoles('ADMIN'), ctrl.getAllUsers);
router.put('/:id', protect, authorizeRoles('ADMIN'), ctrl.updateUserByAdmin);

module.exports = router;