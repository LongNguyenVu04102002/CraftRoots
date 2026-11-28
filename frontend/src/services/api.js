// CẤU HÌNH AXIOS DÙNG CHUNG
// Khai báo baseURL Backend cho các API của dự án.
import axios from "axios";
import { refreshAccessToken } from "./authService";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, //cho phép gửi cookie trong request khác origin

  // KHÔNG ép Content-Type thành application/json.
  // Axios sẽ tự xử lý JSON hoặc FormData tùy request.
});

//1. REQUEST INTERCEPTOR
//Chạy trước mỗi request sử dụng API
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

//2. REPONSE INTERCEPTOR
//  api.interceptors.response là đoạn code xử lý response hoặc lỗi sau khi request được thực hiện.
api.interceptors.response.use(
  (response) => response, //Request thành công trả response
  //Nếu request lỗi
  async (error) => {
    const originalRequest = error.config; //config chứa method, url
    const status = error.response?.status; // dấu ?. giúp ko gặp lỗi đọc undefined(mất mạng)

    //Chỉ thử Refresh cho API được đánh dấu cần xác thực
    if (
      status === 401 && //backend từ chối xác thực
      originalRequest?.requiresAuth && //API được đánh dấu cần xác thực
      !originalRequest._retry // này là cờ tự thêm để tránh lặp vô hạn khi Refresh Token hết hạn
    ) {
      //Request đã bắt đầu thử refresh token, đánh dấu cờ để tránh lặp vô hạn
      originalRequest._retry = true;

      try {
        // trường hợp refresh token thành công
        //gọi API refresh token để lấy access token mới
        const newToken = await refreshAccessToken();

        originalRequest.headers.Authorization = `Bearer ${newToken}`; //Gắn token mới vào request cũ
        return api(originalRequest); //Gửi lại request ban đầu khi đã nhận Access Token mới
      } catch (refreshError) {
        //refresh token thất bại throw lỗi ở authService.js Backend
        if (refreshError.status === 401) {
          //Refresh Token hết hạn or bị thu hồi
          localStorage.removeItem("token"); //Xóa Access Token cũ
        }
        return Promise.reject(refreshError); //Đẩy lỗi ra ngoài để React xử lý
      }
    }
    //Chuẩn hóa lỗi để React xử lý
    error.status = status;
    error.message = error.response?.data?.message || error.message;

    return Promise.reject(error);
  },
);
export default api;
