
import api from "./api";

const BASE_URL = "/public/craft-directories";

const getData = (response) => response.data?.data;

export const craftDirectoryService = {

    // 1. Lấy danh sách nhóm nghề công khai
    getPublic: () =>
        api.get(BASE_URL)
            .then(response => getData(response) || []),

    // 2. Lấy tất cả nhóm nghề dành cho Admin
    getAll: () =>
        api.get(`${BASE_URL}/admin`, {
            requiresAuth: true
        }).then(response => getData(response) || []),

    // 3. Thêm nhóm nghề
    create: (data) =>
        api.post(BASE_URL, data, {
            requiresAuth: true
        }).then(getData),

    // 4. Cập nhật nhóm nghề
    update: (id, data) =>
        api.put(`${BASE_URL}/${id}`, data, {
            requiresAuth: true
        }).then(getData),

    // 5. Ẩn nhóm nghề
    remove: (id) =>
        api.delete(`${BASE_URL}/${id}`, {
            requiresAuth: true
        }).then(getData),

    // 6. Thay đổi trạng thái / khôi phục
    toggleActive: (id, isActive) =>
        api.put(
            `${BASE_URL}/${id}`,
            { isActive },
            { requiresAuth: true }
        ).then(getData),

    // 7. Xóa vĩnh viễn nhóm nghề
    permanentDelete: (id) =>
        api.delete(`${BASE_URL}/${id}/permanent`, {
            requiresAuth: true
        }).then(response => response.data)
};
