const mongoose = require('mongoose');

const makeSlug = (text) =>
  `${text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}-${Date.now().toString().slice(-4)}`;

const buildCrudController = (Model, searchFields = ['name']) => ({
  getAll: async (req, res) => {
    try {
      const { q, category, region, includeInactive } = req.query;
      const filter = {};

      if (includeInactive !== 'true') {
        filter.isActive = { $ne: false };
      }
      if (category) {
        filter.category = category;
      }
      if (region) {
        filter.regionName = { $regex: region, $options: 'i' };
      }
      if (q && q.trim()) {
        filter.$or = searchFields.map((field) => ({
          [field]: { $regex: q.trim(), $options: 'i' }
        }));
      }

      const items = await Model.find(filter).sort({ featured: -1, createdAt: -1 });
      res.json(items);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getOne: async (req, res) => {
    try {
      const { idOrSlug } = req.params;
      const query = mongoose.Types.ObjectId.isValid(idOrSlug)
        ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] }
        : { slug: idOrSlug };

      const item = await Model.findOne(query);
      if (!item) return res.status(404).json({ message: 'Không tìm thấy dữ liệu.' });
      res.json(item);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const body = { ...req.body };
      const titleSource = body.name || body.fullName;
      if (!body.slug && titleSource) {
        body.slug = makeSlug(titleSource);
      }
      const created = await Model.create(body);
      res.status(201).json(created);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const updated = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ message: 'Không tìm thấy bản ghi.' });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  remove: async (req, res) => {
    try {
      await Model.findByIdAndDelete(req.params.id);
      res.json({ message: 'Đã xóa thành công.' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
});

module.exports = buildCrudController;