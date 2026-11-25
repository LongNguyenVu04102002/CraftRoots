// XỬ LÝ NGHIỆP VỤ HIỆN VẬT/SẢN PHẨM THỦ CÔNG
// Dự kiến: danh sách, chi tiết, tìm kiếm/lọc và Admin quản lý hồ sơ.
const Artifact = require('../models/Artifact');
const buildCrudController = require('./crudFactory');
module.exports = buildCrudController(Artifact, ['name', 'craftName', 'artisanName', 'material']);