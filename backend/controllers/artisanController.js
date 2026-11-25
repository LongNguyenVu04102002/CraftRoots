// XỬ LÝ NGHIỆP VỤ NGHỆ NHÂN
// Dự kiến: danh sách nghệ nhân, hồ sơ chi tiết và quản lý hồ sơ nghệ nhân.
const Artisan = require('../models/Artisan');
const User = require('../models/User');
const buildCrudController = require('./crudFactory');

const base = buildCrudController(Artisan, ['fullName', 'craftSpecialty', 'villageName', 'province']);

base.verifyArtisan = async (req, res) => {
  try {
    const { verificationStatus } = req.body;
    const artisan = await Artisan.findByIdAndUpdate(
      req.params.id,
      { verificationStatus },
      { new: true }
    );
    if (artisan && artisan.user && verificationStatus === 'VERIFIED') {
      await User.findByIdAndUpdate(artisan.user, { role: 'ARTISAN' });
    }
    res.json(artisan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = base;