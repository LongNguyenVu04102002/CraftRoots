import api from './api';

const list = (response) => response.data?.data || [];

export const regionService = {
  getPublic: () => api.get('/public/regions').then(list),
  getAll: (params = {}) => api.get('/admin/regions', { params }).then(list),
  create: (data) => api.post('/admin/regions', data).then((response) => response.data.data),
  update: (id, data) => api.put(`/admin/regions/${id}`, data).then((response) => response.data.data),
  setPublished: (id, isPublished) => api.patch(`/admin/regions/${id}/status`, { isPublished }),
  remove: (id) => api.delete(`/admin/regions/${id}`)
};
