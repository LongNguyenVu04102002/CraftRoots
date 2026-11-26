// API tải tệp dùng trong biểu mẫu làng nghề.
import api from './api';

export const userService = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api
      .post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => res.data);
  }
};
