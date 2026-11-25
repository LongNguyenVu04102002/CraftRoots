// CẤU HÌNH AXIOS DÙNG CHUNG
// Khai báo baseURL Backend và cấu hình gửi token xác thực khi cần.
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Tự động đính kèm JWT Token từ localStorage vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('craftroots_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;