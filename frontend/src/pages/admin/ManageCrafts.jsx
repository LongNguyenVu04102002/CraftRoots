// QUẢN LÝ DANH MỤC VÀ NGHỀ
// Admin quản lý danh mục nghề và hồ sơ nghề thủ công chính thức.
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Star, Upload } from 'lucide-react';
import { craftService } from '../../services/craftService';
import { userService } from '../../services/userService';
import Loading from '../../components/Loading';

const emptyForm = {
  name: '',
  category: 'Gốm sứ',
  villageName: '',
  regionName: 'Đồng bằng Bắc Bộ',
  culturalBackground: '',
  material: '',
  technique: '',
  thumbnail: '',
  featured: true
};

export default function ManageCrafts() {
  const [crafts, setCrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadCrafts = () => {
    setLoading(true);
    craftService
      .getAll({ includeInactive: 'true' })
      .then((data) => setCrafts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCrafts();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await userService.uploadFile(file);
    setForm((prev) => ({ ...prev, thumbnail: res.url }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingId) {
      await craftService.update(editingId, form);
    } else {
      await craftService.create(form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    loadCrafts();
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name || '',
      category: item.category || 'Gốm sứ',
      villageName: item.villageName || '',
      regionName: item.regionName || 'Đồng bằng Bắc Bộ',
      culturalBackground: item.culturalBackground || '',
      material: item.material || '',
      technique: item.technique || '',
      thumbnail: item.thumbnail || '',
      featured: Boolean(item.featured)
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa hồ sơ nghề thủ công này?')) return;
    await craftService.remove(id);
    loadCrafts();
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
        <h1 style={{ margin: 0 }}>Quản lý Nghề Thủ Công</h1>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            setShowForm(!showForm);
          }}
        >
          <Plus size={17} /> {showForm ? 'Đóng biểu mẫu' : 'Thêm nghề thủ công'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="form-card" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: 0 }}>{editingId ? 'Cập nhật nghề thủ công' : 'Thêm mới nghề thủ công'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <input
              required
              placeholder="Tên nghề thủ công *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="Gốm sứ">Gốm sứ</option>
              <option value="Dệt may & Lụa">Dệt may & Lụa</option>
              <option value="Mây tre & Đèn">Mây tre & Đèn</option>
              <option value="Tranh dân gian">Tranh dân gian</option>
            </select>
            <input
              placeholder="Tên làng nghề (VD: Làng gốm Bát Tràng)"
              value={form.villageName}
              onChange={(e) => setForm({ ...form, villageName: e.target.value })}
            />
            <select
              value={form.regionName}
              onChange={(e) => setForm({ ...form, regionName: e.target.value })}
            >
              <option value="Đồng bằng Bắc Bộ">Đồng bằng Bắc Bộ</option>
              <option value="Duyên hải Miền Trung">Duyên hải Miền Trung</option>
              <option value="Đồng bằng Sông Cửu Long">Đồng bằng Sông Cửu Long</option>
            </select>
            <input
              placeholder="Nguyên liệu chính"
              value={form.material}
              onChange={(e) => setForm({ ...form, material: e.target.value })}
            />
            <input
              placeholder="Kỹ thuật đặc trưng"
              value={form.technique}
              onChange={(e) => setForm({ ...form, technique: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              style={{ flex: 1 }}
              placeholder="URL hình ảnh đại diện"
              value={form.thumbnail}
              onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
            />
            <label className="btn-outline" style={{ cursor: 'pointer' }}>
              <Upload size={15} /> Tải ảnh
              <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
            </label>
          </div>

          <textarea
            rows="3"
            placeholder="Bối cảnh văn hóa & mô tả nghề..."
            value={form.culturalBackground}
            onChange={(e) => setForm({ ...form, culturalBackground: e.target.value })}
          />

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            Hiển thị nổi bật trên Trang chủ & Hero Slider
          </label>

          <div>
            <button type="submit" className="btn-primary">
              {editingId ? 'Lưu cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      )}

      <div className="form-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f5efe9', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px 16px' }}>Ảnh</th>
              <th style={{ padding: '12px 16px' }}>Tên nghề</th>
              <th style={{ padding: '12px 16px' }}>Danh mục</th>
              <th style={{ padding: '12px 16px' }}>Vùng miền</th>
              <th style={{ padding: '12px 16px' }}>Nổi bật</th>
              <th style={{ padding: '12px 16px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {crafts.map((item) => (
              <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px' }}>
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    style={{ width: '56px', height: '42px', objectFit: 'cover', borderRadius: '6px' }}
                  />
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{item.name}</td>
                <td style={{ padding: '12px 16px' }}>{item.category}</td>
                <td style={{ padding: '12px 16px' }}>{item.regionName}</td>
                <td style={{ padding: '12px 16px' }}>
                  {item.featured ? <Star size={16} color="#d48806" fill="#d48806" /> : '—'}
                </td>
                <td style={{ padding: '12px 16px', display: 'flex', gap: '8px' }}>
                  <button type="button" className="btn-outline" onClick={() => handleEdit(item)}>
                    <Pencil size={14} /> Sửa
                  </button>
                  <button
                    type="button"
                    className="btn-outline"
                    style={{ color: '#c62828', borderColor: '#f5c2c7' }}
                    onClick={() => handleDelete(item._id)}
                  >
                    <Trash2 size={14} /> Xóa
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