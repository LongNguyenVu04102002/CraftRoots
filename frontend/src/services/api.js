// CẤU HÌNH AXIOS DÙNG CHUNG
// Khai báo baseURL Backend cho các API của dự án.
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
