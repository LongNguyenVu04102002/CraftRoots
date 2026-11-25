// API NGHỀ THỦ CÔNG
// Tập trung các hàm gọi API danh mục và hồ sơ nghề thủ công.
import api from './api';

export const craftService = {
  getAll: (params) => api.get('/crafts', { params }).then((res) => res.data),
  getBySlug: (slug) => api.get(`/crafts/${slug}`).then((res) => res.data),
  create: (data) => api.post('/crafts', data).then((res) => res.data),
  update: (id, data) => api.put(`/crafts/${id}`, data).then((res) => res.data),
  remove: (id) => api.delete(`/crafts/${id}`).then((res) => res.data),
  getDirectories: () => api.get('/directories').then((res) => res.data),
  createDirectory: (data) => api.post('/directories', data).then((res) => res.data),
  removeDirectory: (id) => api.delete(`/directories/${id}`).then((res) => res.data),
  getRegions: () => api.get('/regions').then((res) => res.data?.data || [])
};
