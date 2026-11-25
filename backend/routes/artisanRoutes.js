// ROUTES ARTISAN
// Khai báo URL API hồ sơ nghệ nhân.
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/artisanController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/', ctrl.getAll);
router.get('/:idOrSlug', ctrl.getOne);
router.post('/', protect, authorizeRoles('ADMIN'), ctrl.create);
router.put('/:id', protect, authorizeRoles('ARTISAN', 'ADMIN'), ctrl.update);
router.put('/:id/verify', protect, authorizeRoles('ADMIN'), ctrl.verifyArtisan);
router.delete('/:id', protect, authorizeRoles('ADMIN'), ctrl.remove);

module.exports = router;