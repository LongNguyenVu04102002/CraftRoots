// API TÀI KHOẢN
// Tập trung các hàm gọi API đăng ký, đăng nhập, hồ sơ và đơn đăng ký nghệ nhân.
import api from './api';

export const userService = {
  register: (data) => api.post('/users/register', data).then((res) => res.data),
  login: (data) => api.post('/users/login', data).then((res) => res.data),
  getProfile: () => api.get('/users/profile').then((res) => res.data),
  updateProfile: (data) => api.put('/users/profile', data).then((res) => res.data),
  applyArtisan: (data) => api.post('/users/apply-artisan', data).then((res) => res.data),
  getAllUsers: () => api.get('/users').then((res) => res.data),
  updateUserByAdmin: (id, data) => api.put(`/users/${id}`, data).then((res) => res.data),
  getStats: () => api.get('/stats').then((res) => res.data),
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api
      .post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => res.data);
  }
};