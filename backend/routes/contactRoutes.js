// ROUTES CONTACT
// Khai báo URL API liên hệ.
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/contactController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

router.post('/', ctrl.create);
router.get('/', protect, authorizeRoles('ADMIN'), ctrl.getAll);
router.put('/:id', protect, authorizeRoles('ADMIN'), ctrl.update);
router.delete('/:id', protect, authorizeRoles('ADMIN'), ctrl.remove);

module.exports = router;