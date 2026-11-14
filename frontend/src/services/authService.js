const API_URL = "http://localhost:5000/api/auth";

//Gọi API đăng nhập
const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
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

const getMe = async (token) => {
  const response = await fetch(`${API_URL}/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Lấy thông tin người dùng thất bại");
  }
  return result.data.user;
};

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

export { loginUser, getMe, registerUser };
