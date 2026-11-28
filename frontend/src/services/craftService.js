
import api from "./api";

// Chuẩn hóa dữ liệu trả về từ Backend
const getData = (response) => response.data?.data;

// Các API quản lý nghề thủ công
export const craftService = {
    // Lấy danh sách nghề thủ công dành cho Admin
    getAll: () =>
        api.get("/admin/crafts").then((response) => getData(response) || []),

    // Thêm nghề thủ công
    create: (data) =>
        api.post("/admin/crafts", data).then(getData),

    // Cập nhật nghề thủ công
    update: (id, data) =>
        api.put(`/admin/crafts/${id}`, data).then(getData),

    // Xóa mềm nghề thủ công
    remove: (id) =>
        api.delete(`/admin/crafts/${id}`),

    // Lấy danh sách danh mục nghề dành cho Admin
    getDirectories: () =>
        api
            .get("/public/craft-directories/admin")
            .then((response) => getData(response) || []),

    // Lấy danh sách làng nghề dành cho Admin
    getVillages: () =>
        api
            .get("/admin/villages", {
                params: { page: 1, limit: 1000 }
            })
            .then((response) => getData(response) || [])
};
