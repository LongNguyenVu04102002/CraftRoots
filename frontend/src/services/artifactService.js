// API HIỆN VẬT/SẢN PHẨM THỦ CÔNG
// Tập trung các hàm gọi API danh sách và chi tiết hiện vật.
import api from './api';

export const artifactService = {
  getAll: (params) => api.get('/artifacts', { params }).then((res) => res.data),
  getBySlug: (slug) => api.get(`/artifacts/${slug}`).then((res) => res.data),
  create: (data) => api.post('/artifacts', data).then((res) => res.data),
  update: (id, data) => api.put(`/artifacts/${id}`, data).then((res) => res.data),
  remove: (id) => api.delete(`/artifacts/${id}`).then((res) => res.data)
};