import { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import {
  Button,
  Card,
  ConfigProvider,
  Form,
  Input,
  message,
  Upload,
} from "antd";
import {
  UserRound,
  ShieldCheck,
  Pencil,
  KeyRound,
  House,
  LogOut,
  Camera,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import {
  updateProfile,
  changePassword,
  uploadAvatar,
} from "../../services/userService";

import "./Profile.css";

const Profile = () => {
  const { logout } = useAuth();
  const { user, setUser } = useOutletContext();
  const navigate = useNavigate();

  // 1. State cho Update Profile
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // 2. State cho Change Password
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm] = Form.useForm();

  // 3. State cho Logout
  const [loggingOut, setLoggingOut] = useState(false);

  //4. State cho Upload Avatar
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  // Trang chủ theo vai trò
  const homePath =
    user.role === "ADMIN"
      ? "/adminuser"
      : user.role === "ARTISAN"
        ? "/artisan"
        : "/user";

  // 4. Cập nhật Profile
  const handleUpdateProfile = async (values) => {
    try {
      setSaving(true);

      const updatedUser = await updateProfile({
        fullName: values.fullName.trim(),
        phone: (values.phone ?? "").trim(),
      });

      // Cập nhật state React
      setUser(updatedUser);

      // Khóa chế độ chỉnh sửa sau khi lưu thành công
      setIsEditing(false);

      message.success("Cập nhật thông tin thành công!");
    } catch (error) {
      message.error(error.message || "Cập nhật thất bại!");
    } finally {
      setSaving(false);
    }
  };

  // 5. Đổi mật khẩu
  const handleChangePassword = async (values) => {
    try {
      setChangingPassword(true);

      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      message.success("Đổi mật khẩu thành công!");

      passwordForm.resetFields();
      setShowPasswordForm(false);
    } catch (error) {
      message.error(error.message || "Đổi mật khẩu thất bại");
    } finally {
      setChangingPassword(false);
    }
  };

  // 6. Đăng xuất
  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await logout();

      message.success("Đăng xuất thành công");
      navigate("/login", { replace: true });
    } catch (error) {
      message.error(error.message || "Đăng xuất thất bại");
    } finally {
      setLoggingOut(false);
    }
  };

  // 7. Xử lý Upload Avatar
  const handleAvatarUpload = async (file) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    // Kiểm tra loại ảnh
    if (!allowedTypes.includes(file.type)) {
      message.error("Chỉ hỗ trợ JPG, PNG hoặc WebP");
      return;
    }

    // Kiểm tra dung lượng
    if (file.size > 3 * 1024 * 1024) {
      message.error("Ảnh không được vượt quá 3 MiB");
      return;
    }

    try {
      setUploadingAvatar(true);

      const updatedUser = await uploadAvatar(file);

      // Cập nhật AuthContext
      setUser(updatedUser);

      message.success("Cập nhật Avatar thành công!");
    } catch (error) {
      console.error("Upload Avatar Error:", error);
      message.error(error.message || "Upload thất bại");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // 8. Tạo URL ảnh từ đường dẫn Backend
  const avatarSrc = user.avatarUrl
    ? new URL(user.avatarUrl, "http://localhost:5000").href
    : null;
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#a84b2b",
          borderRadius: 5,
        },
      }}
    >
      <div className="profile-page">
        {/* 1. ĐƯỜNG DẪN TRANG CHỦ */}
        <div className="profile-breadcrumb">
          <Link to={homePath}>
            <House size={16} />
            Trang chủ
          </Link>
          <span>/</span>
          <span>Hồ sơ cá nhân</span>
        </div>

        {/* 2. GIỚI THIỆU VÀ UPLOAD AVATAR */}
        <div className="profile-heading">
          <Upload
            accept="image/jpeg,image/png,image/webp"
            showUploadList={false}
            disabled={uploadingAvatar}
            beforeUpload={(file) => {
              handleAvatarUpload(file);

              // Không để Ant Design tự gửi request
              return false;
            }}
          >
            <button
              type="button"
              className="profile-avatar"
              disabled={uploadingAvatar}
              title="Nhấn để thay ảnh đại diện"
              aria-label="Thay ảnh đại diện"
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Ảnh đại diện"
                  className="profile-avatar-image"
                />
              ) : (
                <UserRound size={27} />
              )}
              {/* Lớp phủ hiển thị khi hover */}
              <span className="profile-avatar-overlay">
                <Camera size={26} />
              </span>
            </button>
          </Upload>

          <div>
            <h1>Hồ sơ của tôi</h1>
            <p>Quản lý thông tin cá nhân và bảo mật tài khoản</p>
            {uploadingAvatar && <p>Đang tải ảnh lên...</p>}
          </div>
        </div>

        {/* 3. CARD THÔNG TIN CÁ NHÂN */}
        <Card
          className="profile-card"
          title={
            <span className="profile-card-title">
              <UserRound size={16} />
              Thông tin cá nhân
            </span>
          }
          extra={
            !isEditing && (
              <Button
                icon={<Pencil size={15} />}
                onClick={() => setIsEditing(true)}
              >
                Chỉnh sửa
              </Button>
            )
          }
        >
          {/* CHẾ ĐỘ XEM THÔNG TIN */}
          {!isEditing && (
            <div className="profile-details">
              <div className="profile-field">
                <span>Họ và tên</span>
                <strong>{user.fullName}</strong>
              </div>

              <div className="profile-field">
                <span>Số điện thoại</span>
                <strong>{user.phone || "Chưa cập nhật"}</strong>
              </div>

              <div className="profile-field">
                <span>Email</span>
                <strong>{user.email}</strong>
              </div>

              <div className="profile-field">
                <span>Vai trò</span>
                <strong>{user.role}</strong>
              </div>

              <div className="profile-field">
                <span>Trạng thái tài khoản</span>
                <span className="profile-status">{user.accountStatus}</span>
              </div>
            </div>
          )}

          {/* CHẾ ĐỘ CHỈNH SỬA THÔNG TIN */}
          {isEditing && (
            <Form
              layout="vertical"
              initialValues={{
                fullName: user.fullName,
                phone: user.phone || "",
              }}
              onFinish={handleUpdateProfile}
            >
              <Form.Item
                label="Họ tên"
                name="fullName"
                validateTrigger="onBlur"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: "Vui lòng nhập họ tên",
                  },
                  {
                    max: 50,
                    message: "Họ tên không được vượt quá 50 ký tự",
                  },
                  {
                    pattern: /^[\p{L}\p{M}\s.'-]+$/u,
                    message: "Họ tên không hợp lệ",
                  },
                ]}
              >
                <Input placeholder="Nhập họ tên" />
              </Form.Item>

              <Form.Item label="Email">
                <Input value={user.email} disabled />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="phone"
                validateTrigger="onBlur"
                rules={[
                  {
                    pattern: /^(?:0\d{9})?$/,
                    message:
                      "Số điện thoại phải bắt đầu bằng 0 và gồm 10 chữ số",
                  },
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>

              <div className="profile-form-actions">
                <Button disabled={saving} onClick={() => setIsEditing(false)}>
                  Hủy
                </Button>

                <Button type="primary" htmlType="submit" loading={saving}>
                  Lưu thay đổi
                </Button>
              </div>
            </Form>
          )}
        </Card>

        {/* 4. CARD BẢO MẬT TÀI KHOẢN */}
        <Card
          className="profile-card"
          title={
            <span className="profile-card-title">
              <ShieldCheck size={19} />
              Bảo mật tài khoản
            </span>
          }
          extra={
            !showPasswordForm && (
              <Button
                icon={<KeyRound size={15} />}
                onClick={() => setShowPasswordForm(true)}
              >
                Đổi mật khẩu
              </Button>
            )
          }
        >
          {/* HIỂN THỊ KHI CHƯA ĐỔI MẬT KHẨU */}
          {!showPasswordForm && (
            <div className="profile-password-preview">
              <div className="profile-field">
                <span>Mật khẩu</span>
                <strong>•••••••••••</strong>
              </div>
            </div>
          )}

          {/* FORM ĐỔI MẬT KHẨU */}
          {showPasswordForm && (
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleChangePassword}
              autoComplete="off"
            >
              <Form.Item
                label="Mật khẩu hiện tại"
                name="currentPassword"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mật khẩu hiện tại",
                  },
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                label="Mật khẩu mới"
                name="newPassword"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mật khẩu mới",
                  },
                  {
                    min: 8,
                    message: "Mật khẩu phải có ít nhất 8 ký tự",
                  },
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                label="Xác nhận mật khẩu mới"
                name="confirmPassword"
                dependencies={["newPassword"]}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng xác nhận mật khẩu",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (value === getFieldValue("newPassword")) {
                        return Promise.resolve();
                      }

                      return Promise.reject(
                        new Error("Mật khẩu xác nhận không khớp"),
                      );
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>

              <div className="profile-form-actions">
                <Button
                  disabled={changingPassword}
                  onClick={() => {
                    passwordForm.resetFields();
                    setShowPasswordForm(false);
                  }}
                >
                  Hủy
                </Button>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={changingPassword}
                >
                  Lưu mật khẩu
                </Button>
              </div>
            </Form>
          )}
        </Card>

        {/* 5. ĐĂNG XUẤT */}
        <div className="profile-bottom">
          <Button
            danger
            icon={<LogOut size={16} />}
            loading={loggingOut}
            onClick={handleLogout}
          >
            Đăng xuất
          </Button>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Profile;
