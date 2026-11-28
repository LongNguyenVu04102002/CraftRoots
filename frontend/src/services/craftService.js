
import api from "./api";

// Chuẩn hóa dữ liệu trả về từ Backend
const getData = (response) => response.data?.data;

export const craftService = {

    // ==========================================
    // 1. API CÔNG KHAI - DÀNH CHO NGƯỜI DÙNG
    // ==========================================

    // Lấy danh sách nghề thủ công công khai
    getPublic: () =>
        api
            .get("/public/crafts")
            .then((response) => getData(response) || []),

    // Lấy chi tiết nghề thủ công theo ID
    getDetail: (id) =>
        api
            .get(`/public/crafts/${id}`)
            .then(getData),

    // Lấy danh sách nhóm nghề đang hiển thị
    getPublicDirectories: () =>
        api
            .get("/public/craft-directories")
            .then((response) => getData(response) || []),

    // ==========================================
    // 2. API QUẢN TRỊ - DÀNH CHO ADMIN
    // ==========================================

    // Lấy danh sách nghề thủ công
    getAll: () =>
        api
            .get("/admin/crafts")
            .then((response) => getData(response) || []),

    // Thêm nghề thủ công
    create: (data) =>
        api
            .post("/admin/crafts", data)
            .then(getData),

    // Cập nhật nghề thủ công
    update: (id, data) =>
        api
            .put(`/admin/crafts/${id}`, data)
            .then(getData),

    // Xóa mềm nghề thủ công
    remove: (id) =>
        api.delete(`/admin/crafts/${id}`),

    // Lấy danh sách danh mục dành cho Admin
    getDirectories: () =>
        api
            .get("/public/craft-directories/admin")
            .then((response) => getData(response) || []),

    // Lấy danh sách làng nghề dành cho Admin
    getVillages: () =>
        api
            .get("/admin/villages", {
                params: {
                    page: 1,
                    limit: 1000
                }
            })
            .then((response) => getData(response) || [])
};
