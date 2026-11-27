const API_URL = "http://localhost:5000/api/auth";
//1.Gọi API đăng nhập
const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    credentials: "include", //cho phép trình duyệt nhận và gửi cookie trong request khác origin
    //VD localhost:5173 và backend ở localhost:5000, khi server cấu hình CORS phù hợp
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      //chuyển object JS thành chuỗi JSON
      email,
      password,
    }),
  });
  const result = await response.json(); // đọc và chuyển chuỗi JSON thành object JS
  if (!response.ok) {
    throw new Error(result.message || "Đăng nhập thất bại");
  }
  return result.data; // chính là bên backend user và token cho component React sử dụng
};

//2. Gọi API đăng ký
const registerUser = async (values) => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
  const result = await response.json();
  if (!response.ok) {
    //backend sẽ trả về lỗi VD 400,409,500 ném lỗi về catch trong Register.jsx
    throw new Error(result.message || "Đăng ký thất bại");
  }

  return result.data.user;
};

//3. Làm mới Access Token
const refreshAccessToken = async () => {
  const response = await fetch(`${API_URL}/refresh`, {
    method: "POST",
    credentials: "include", //browser tự gửi Refresh Token trong cookie lên backend
  });

  const result = await response.json();
  if (!response.ok || !result.data?.token) {
    const error = new Error(result.message || "Không thể làm mới Access Token");
    error.status = response.status;
    throw error;
  }
  //Lưu Access Token mới
  const newToken = result.data.token; // Access Token mới do Backend tạo trả về
  localStorage.setItem("token", newToken); //Ghi đè Access Token cũ bằng token mới
  // Refresh Token ko bị thay đổi ở hiện tại vì chưa triển khai Refresh Token Rotation
  return newToken;
};

//4. Gọi API đăng xuất
const logoutUser = async () => {
  const response = await fetch(`${API_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Đăng xuất thất bại");
  }
  return result;
};

export { loginUser, registerUser, refreshAccessToken, logoutUser };
