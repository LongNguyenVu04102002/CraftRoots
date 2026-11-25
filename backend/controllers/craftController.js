// XỬ LÝ NGHIỆP VỤ NGHỀ THỦ CÔNG
// Dự kiến: danh sách, chi tiết, tìm kiếm/lọc và Admin quản lý hồ sơ nghề.
const Craft = require('../models/Craft');
const buildCrudController = require('./crudFactory');
module.exports = buildCrudController(Craft, ['name', 'category', 'regionName', 'villageName', 'material']);