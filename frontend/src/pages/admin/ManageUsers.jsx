// QUẢN LÝ TÀI KHOẢN
// Admin xem, khóa/mở khóa và quản lý vai trò theo quyền được phép.
import { useEffect, useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { userService } from '../../services/userService';
import Loading from '../../components/Loading';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = () => {
    setLoading(true);
    userService
      .getAllUsers()
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleLock = async (user) => {
    await userService.updateUserByAdmin(user._id, { isLocked: !user.isLocked });
    loadUsers();
  };

  const handleChangeRole = async (userId, newRole) => {
    await userService.updateUserByAdmin(userId, { role: newRole });
    loadUsers();
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div style={{ marginBottom: '22px' }}>
        <h1 style={{ margin: 0 }}>Quản lý Tài khoản & Phân quyền</h1>
      </div>

      <div className="form-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f5efe9', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px 16px' }}>Họ và tên</th>
              <th style={{ padding: '12px 16px' }}>Email</th>
              <th style={{ padding: '12px 16px' }}>Vai trò</th>
              <th style={{ padding: '12px 16px' }}>Trạng thái</th>
              <th style={{ padding: '12px 16px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{u.fullName}</td>
                <td style={{ padding: '12px 16px' }}>{u.email}</td>
                <td style={{ padding: '12px 16px' }}>
                  <select
                    value={u.role}
                    onChange={(e) => handleChangeRole(u._id, e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                  >
                    <option value="USER">USER</option>
                    <option value="ARTISAN">ARTISAN</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {u.isLocked ? (
                    <span style={{ color: '#c62828', fontWeight: 600 }}>● Đã khóa</span>
                  ) : (
                    <span style={{ color: '#2e7d32', fontWeight: 600 }}>● Đang hoạt động</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button
                    type="button"
                    className="btn-outline"
                    style={{ color: u.isLocked ? '#2e7d32' : '#c62828' }}
                    onClick={() => handleToggleLock(u)}
                  >
                    {u.isLocked ? (
                      <>
                        <Unlock size={14} /> Mở khóa
                      </>
                    ) : (
                      <>
                        <Lock size={14} /> Khóa tài khoản
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}