// API NGHỆ NHÂN
// Tập trung các hàm gọi API hồ sơ nghệ nhân.
import api from './api';

export const artisanService = {
  getAll: (params) => api.get('/artisans', { params }).then((res) => res.data),
  getBySlug: (slug) => api.get(`/artisans/${slug}`).then((res) => res.data),
  update: (id, data) => api.put(`/artisans/${id}`, data).then((res) => res.data),
  verify: (id, verificationStatus) =>
    api.put(`/artisans/${id}/verify`, { verificationStatus }).then((res) => res.data)
};