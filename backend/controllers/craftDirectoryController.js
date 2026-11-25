// XỬ LÝ NGHIỆP VỤ DANH MỤC NGHỀ
// Dự kiến: lấy danh sách và Admin thêm/sửa/ẩn danh mục nghề.
const CraftDirectory = require('../models/CraftDirectory');
const buildCrudController = require('./crudFactory');
module.exports = buildCrudController(CraftDirectory, ['name', 'description']);