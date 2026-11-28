import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { loginUser } from "../../services/authService";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Login = () => {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  //khai báo để dùng chuyển hướng trong hàm
  const navigate = useNavigate();
  // Xử lý đăng nhập
  const handleLogin = async (values) => {
    try {
      setLoading(true);

      const data = await loginUser(values.email, values.password);

      // Lưu token để sử dụng cho các API cần xác thực
      localStorage.setItem("token", data.token);
      // Đồng bộ người dùng đã đăng nhập vào Context
      signIn(data.user);
      message.success("Đăng nhập thành công!"); //component cua ant design
      //Sau khi thành công chuyển về "/profile"
      //navigate("/profile");
      // Điều hướng theo vai trò sau khi đăng nhập.
      const role = data.user?.role;
      const destination =
        role === "ADMIN" ? "/admin" : role === "ARTISAN" ? "/artisan" : "/user";
      navigate(destination, { replace: true });
    } catch (error) {
      message.error(error.message || "Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Form
        layout="vertical"
        onFinish={handleLogin}
        style={{
          width: "400px",
          margin: "50px auto",
          padding: "20px",
          border: "2px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <h2>Đăng nhập CraftRoots</h2>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input placeholder="Nhập email" />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
        >
          <Input.Password placeholder="Nhập mật khẩu" />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={loading} block>
          Đăng nhập
        </Button>
        <p>
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </p>
      </Form>
    </div>
  );
};

export default Login;
