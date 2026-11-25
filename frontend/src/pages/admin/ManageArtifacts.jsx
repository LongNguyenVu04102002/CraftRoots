// QUẢN LÝ HIỆN VẬT
// Admin quản lý hồ sơ hiện vật/sản phẩm thủ công chính thức.
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Upload } from 'lucide-react';
import { artifactService } from '../../services/artifactService';
import { userService } from '../../services/userService';
import Loading from '../../components/Loading';

const emptyArtifact = {
  name: '',
  craftName: '',
  artisanName: '',
  eraOrYear: '2025',
  dimensions: '',
  material: '',
  technique: '',
  culturalMeaning: '',
  thumbnail: ''
};

export default function ManageArtifacts() {
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyArtifact);

  const loadData = () => {
    setLoading(true);
    artifactService
      .getAll({ includeInactive: 'true' })
      .then((data) => setArtifacts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await userService.uploadFile(file);
    setForm((prev) => ({ ...prev, thumbnail: res.url }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingId) await artifactService.update(editingId, form);
    else await artifactService.create(form);

    setShowForm(false);
    setEditingId(null);
    setForm(emptyArtifact);
    loadData();
  };

  const handleEdit = (a) => {
    setEditingId(a._id);
    setForm({
      name: a.name || '',
      craftName: a.craftName || '',
      artisanName: a.artisanName || '',
      eraOrYear: a.eraOrYear || '2025',
      dimensions: a.dimensions || '',
      material: a.material || '',
      technique: a.technique || '',
      culturalMeaning: a.culturalMeaning || '',
      thumbnail: a.thumbnail || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa hiện vật này khỏi phòng trưng bày?')) return;
    await artifactService.remove(id);
    loadData();
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
        <h1 style={{ margin: 0 }}>Quản lý Hiện vật Trưng bày Di sản</h1>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            setEditingId(null);
            setForm(emptyArtifact);
            setShowForm(!showForm);
          }}
        >
          <Plus size={17} /> {showForm ? 'Đóng biểu mẫu' : 'Thêm hiện vật'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="form-card" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: 0 }}>{editingId ? 'Cập nhật hiện vật' : 'Thêm hiện vật di sản'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <input
              required
              placeholder="Tên hiện vật / tác phẩm *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              required
              placeholder="Thuộc dòng nghề (VD: Gốm Men Rạn Bát Tràng) *"
              value={form.craftName}
              onChange={(e) => setForm({ ...form, craftName: e.target.value })}
            />
            <input
              placeholder="Nghệ nhân chế tác"
              value={form.artisanName}
              onChange={(e) => setForm({ ...form, artisanName: e.target.value })}
            />
            <input
              placeholder="Niên đại / Năm hoàn thiện"
              value={form.eraOrYear}
              onChange={(e) => setForm({ ...form, eraOrYear: e.target.value })}
            />
            <input
              placeholder="Kích thước (VD: Cao 48cm x Rộng 32cm)"
              value={form.dimensions}
              onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
            />
            <input
              placeholder="Chất liệu chế tác"
              value={form.material}
              onChange={(e) => setForm({ ...form, material: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              style={{ flex: 1 }}
              placeholder="URL hình ảnh hiện vật"
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
            placeholder="Ý nghĩa văn hóa & giá trị nghệ thuật..."
            value={form.culturalMeaning}
            onChange={(e) => setForm({ ...form, culturalMeaning: e.target.value })}
          />

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
              <th style={{ padding: '12px 16px' }}>Tên hiện vật</th>
              <th style={{ padding: '12px 16px' }}>Dòng nghề</th>
              <th style={{ padding: '12px 16px' }}>Nghệ nhân</th>
              <th style={{ padding: '12px 16px' }}>Niên đại</th>
              <th style={{ padding: '12px 16px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {artifacts.map((a) => (
              <tr key={a._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px' }}>
                  <img
                    src={a.thumbnail}
                    alt={a.name}
                    style={{ width: '56px', height: '42px', objectFit: 'cover', borderRadius: '6px' }}
                  />
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{a.name}</td>
                <td style={{ padding: '12px 16px' }}>{a.craftName}</td>
                <td style={{ padding: '12px 16px' }}>{a.artisanName}</td>
                <td style={{ padding: '12px 16px' }}>{a.eraOrYear}</td>
                <td style={{ padding: '12px 16px', display: 'flex', gap: '8px' }}>
                  <button type="button" className="btn-outline" onClick={() => handleEdit(a)}>
                    <Pencil size={14} /> Sửa
                  </button>
                  <button
                    type="button"
                    className="btn-outline"
                    style={{ color: '#c62828', borderColor: '#f5c2c7' }}
                    onClick={() => handleDelete(a._id)}
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