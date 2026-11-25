// API ĐỀ XUẤT
// Tập trung các hàm gọi API gửi, theo dõi và kiểm duyệt đề xuất.
import api from './api';

export const contributionService = {
  create: (data) => api.post('/contributions', data).then((res) => res.data),
  getMine: () => api.get('/contributions/mine').then((res) => res.data),
  getAll: () => api.get('/contributions').then((res) => res.data),
  review: (id, data) => api.put(`/contributions/${id}/review`, data).then((res) => res.data),
  sendContact: (data) => api.post('/contacts', data).then((res) => res.data),
  getContacts: () => api.get('/contacts').then((res) => res.data),
  updateContact: (id, data) => api.put(`/contacts/${id}`, data).then((res) => res.data)
};