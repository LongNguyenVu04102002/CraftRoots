// ROUTES CONTRIBUTION
// Khai báo URL API gửi, xem và kiểm duyệt đề xuất.
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/contributionController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

router.post('/', protect, authorizeRoles('ARTISAN', 'ADMIN'), ctrl.createContribution);
router.get('/mine', protect, ctrl.getMyContributions);
router.get('/', protect, authorizeRoles('ADMIN'), ctrl.getAllContributions);
router.put('/:id/review', protect, authorizeRoles('ADMIN'), ctrl.reviewContribution);

module.exports = router;