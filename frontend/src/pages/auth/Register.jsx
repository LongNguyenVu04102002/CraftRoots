import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Xử lý đăng ký
  const handleRegister = async (values) => {
    //kiểm tra 2 mật khẩu có giống nhau không
    if (values.password !== values.confirmPassword) {
      message.error("Mật khẩu xác nhận không khớp");
      return;
    }
    try {
      setLoading(true);
      //gọi api đăng ký
      await registerUser(values);

      message.success("Đăng ký tài khoản thành công!");
      navigate("/login");
    } catch (error) {
      message.error(error.message || "Đăng ký thất bại!");
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
        onFinish={handleRegister}
        style={{
          width: "400px",
          margin: "50px auto",
          padding: "20px",
          border: "2px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <h2>Đăng ký CraftRoots</h2>
        {/* Họ tên */}
        <Form.Item
          label="Họ tên"
          name="fullName"
          rules={[
            {
              required: true,
              whitespace: true,
              message: "Vui lòng nhập họ tên",
            },
          ]}
        >
          <Input placeholder="Nhập họ tên" />
        </Form.Item>
        {/* Email */}
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
        {/* Mật khẩu */}
        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu" },
            { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
          ]}
        >
          <Input.Password placeholder="Nhập mật khẩu" />
        </Form.Item>
        {/* Xác nhận mật khẩu */}
        <Form.Item
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu" }]}
        >
          <Input.Password placeholder="Nhập lại mật khẩu" />
        </Form.Item>
        {/* Số điện thoại */}
        <Form.Item label="Số điện thoại" name="phone">
          <Input placeholder="Không bắt buộc" />
        </Form.Item>
        {/* Nút đăng ký */}
        <Button type="primary" htmlType="submit" loading={loading} block>
          Đăng ký
        </Button>
        <p>
          Đã có tài khoản ? <Link to="/login">Đăng nhập</Link>
        </p>
      </Form>
    </div>
  );
};
export default Register;
