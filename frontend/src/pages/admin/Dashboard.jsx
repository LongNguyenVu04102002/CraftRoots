// DASHBOARD ADMIN
// Tổng quan số lượng tài khoản, hồ sơ và đề xuất cần xử lý.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Hammer,
  MapPin,
  Gem,
  Award,
  FileCheck2,
  Mail,
  ArrowUpRight
} from 'lucide-react';
import { userService } from '../../services/userService';
import Loading from '../../components/Loading';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService
      .getStats()
      .then(setStats)
      .catch(() =>
        setStats({
          users: 0,
          crafts: 0,
          villages: 0,
          artifacts: 0,
          artisans: 0,
          pendingContributions: 0,
          newContacts: 0
        })
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Đang tổng hợp số liệu hệ thống..." />;

  const statCards = [
    {
      label: 'Tổng tài khoản',
      value: stats?.users ?? 0,
      icon: Users,
      color: '#2b5876',
      bg: '#eef4f8',
      link: '/admin/users'
    },
    {
      label: 'Nghề thủ công',
      value: stats?.crafts ?? 0,
      icon: Hammer,
      color: '#a84b2b',
      bg: '#fdf3eb',
      link: '/admin/crafts'
    },
    {
      label: 'Làng nghề di sản',
      value: stats?.villages ?? 0,
      icon: MapPin,
      color: '#2e7d32',
      bg: '#edf7ed',
      link: '/admin/villages'
    },
    {
      label: 'Hiện vật trưng bày',
      value: stats?.artifacts ?? 0,
      icon: Gem,
      color: '#6a1b9a',
      bg: '#f6eef9',
      link: '/admin/artifacts'
    },
    {
      label: 'Hồ sơ Nghệ nhân',
      value: stats?.artisans ?? 0,
      icon: Award,
      color: '#9c6514',
      bg: '#fdf6e7',
      link: '/admin/artisans'
    },
    {
      label: 'Đề xuất chờ duyệt',
      value: stats?.pendingContributions ?? 0,
      icon: FileCheck2,
      color: '#c62828',
      bg: '#fdecea',
      link: '/admin/contributions'
    },
    {
      label: 'Liên hệ mới',
      value: stats?.newContacts ?? 0,
      icon: Mail,
      color: '#00695c',
      bg: '#e6f4f2',
      link: '/admin/contacts'
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: '0 0 6px', fontSize: '1.75rem' }}>Tổng quan Quản trị CraftRoots</h1>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
          Theo dõi toàn cảnh kho dữ liệu di sản, hoạt động đóng góp của nghệ nhân và phản hồi người dùng.
        </p>
      </div>

      {/* Lưới 7 thẻ số liệu */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '20px'
        }}
      >
        {statCards.map((card, idx) => {
          const IconComponent = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className="form-card"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                padding: '22px',
                gap: '14px',
                transition: 'transform 0.2s ease'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: card.bg,
                    color: card.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <IconComponent size={22} />
                </div>
                <ArrowUpRight size={18} color="var(--text-muted)" />
              </div>

              <div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: card.color, lineHeight: 1.1 }}>
                  {card.value}
                </div>
                <div style={{ marginTop: '6px', fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                  {card.label}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}