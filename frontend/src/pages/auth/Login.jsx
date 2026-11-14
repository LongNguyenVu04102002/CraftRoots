import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { loginUser } from "../../services/authService";
import { Link } from "react-router-dom";

const Login = () => {
  const [loading, setLoading] = useState(false);

  // Xử lý đăng nhập
  const handleLogin = async (values) => {
    try {
      setLoading(true);

      const data = await loginUser(values.email, values.password);

      // Lưu token để sử dụng cho các API cần xác thực
      localStorage.setItem("token", data.token);

      message.success("Đăng nhập thành công!");
    } catch (error) {
      message.error(error.message || "Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Đăng nhập CraftRoots</h2>

      <Form layout="vertical" onFinish={handleLogin}>
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

        <Button type="primary" htmlType="submit" loading={loading}>
          Đăng nhập
        </Button>
      </Form>

      <p>
        Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
      </p>
    </div>
  );
};

export default Login;
