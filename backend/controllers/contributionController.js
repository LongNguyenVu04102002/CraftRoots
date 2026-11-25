// XỬ LÝ NGHIỆP VỤ ĐỀ XUẤT VÀ KIỂM DUYỆT
// Dự kiến: nghệ nhân gửi/xem/rút đề xuất; Admin xem, duyệt hoặc từ chối.
// Khi duyệt, phối hợp Model/Controller tương ứng để cập nhật dữ liệu chính thức.
const Contribution = require('../models/Contribution');
const Village = require('../models/Village');
const Craft = require('../models/Craft');
const Artifact = require('../models/Artifact');

const toSlug = (str) =>
  `${str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}-${Date.now().toString().slice(-4)}`;

// Nghệ nhân gửi đề xuất mới
exports.createContribution = async (req, res) => {
  try {
    const { targetType, actionType, targetId, title, payload } = req.body;
    const item = await Contribution.create({
      submittedBy: req.user._id,
      submitterName: req.user.fullName,
      targetType,
      actionType: actionType || 'CREATE',
      targetId: targetId || '',
      title,
      payload
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Nghệ nhân xem các đề xuất của mình
exports.getMyContributions = async (req, res) => {
  const list = await Contribution.find({ submittedBy: req.user._id }).sort({ createdAt: -1 });
  res.json(list);
};

// Admin xem toàn bộ đề xuất
exports.getAllContributions = async (req, res) => {
  const list = await Contribution.find().sort({ createdAt: -1 });
  res.json(list);
};

// Admin duyệt hoặc từ chối đề xuất (tự động đồng bộ vào bảng chính nếu APPROVED)
exports.reviewContribution = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const contrib = await Contribution.findById(req.params.id);
    if (!contrib) return res.status(404).json({ message: 'Không tìm thấy đề xuất.' });

    contrib.status = status;
    contrib.adminNote = adminNote || '';
    await contrib.save();

    if (status === 'APPROVED') {
      const data = { ...contrib.payload };
      if (!data.slug && data.name) data.slug = toSlug(data.name);

      if (contrib.targetType === 'VILLAGE') {
        if (contrib.actionType === 'CREATE') await Village.create(data);
        else if (contrib.actionType === 'UPDATE' && contrib.targetId)
          await Village.findByIdAndUpdate(contrib.targetId, data);
        else if (contrib.actionType === 'DELETE' && contrib.targetId)
          await Village.findByIdAndUpdate(contrib.targetId, { isActive: false });
      } else if (contrib.targetType === 'CRAFT') {
        if (contrib.actionType === 'CREATE') await Craft.create(data);
        else if (contrib.actionType === 'UPDATE' && contrib.targetId)
          await Craft.findByIdAndUpdate(contrib.targetId, data);
        else if (contrib.actionType === 'DELETE' && contrib.targetId)
          await Craft.findByIdAndUpdate(contrib.targetId, { isActive: false });
      } else if (contrib.targetType === 'ARTIFACT') {
        if (contrib.actionType === 'CREATE') await Artifact.create(data);
        else if (contrib.actionType === 'UPDATE' && contrib.targetId)
          await Artifact.findByIdAndUpdate(contrib.targetId, data);
        else if (contrib.actionType === 'DELETE' && contrib.targetId)
          await Artifact.findByIdAndUpdate(contrib.targetId, { isActive: false });
      }
    }

    res.json({ message: 'Đã cập nhật trạng thái đề xuất.', contribution: contrib });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};