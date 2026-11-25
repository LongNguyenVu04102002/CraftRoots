// ROUTES CRAFT
// Khai báo URL API nghề thủ công.
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/craftController'); // đổi tên controller tương ứng từng file
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/', ctrl.getAll);
router.get('/:idOrSlug', ctrl.getOne);
router.post('/', protect, authorizeRoles('ADMIN'), ctrl.create);
router.put('/:id', protect, authorizeRoles('ADMIN'), ctrl.update);
router.delete('/:id', protect, authorizeRoles('ADMIN'), ctrl.remove);

module.exports = router;