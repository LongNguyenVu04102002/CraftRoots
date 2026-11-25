import { useEffect, useState } from 'react';
import { Map, Pencil, Plus, Trash2, X } from 'lucide-react';
import { regionService } from '../../services/regionService';
import Loading from '../../components/Loading';

const emptyRegion = { name: '', slug: '', description: '' };

export default function ManageRegions() {
  const [regions, setRegions] = useState([]);
  const [form, setForm] = useState(emptyRegion);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      setRegions(await regionService.getAll({ search: search.trim() || undefined }));
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được danh sách vùng miền.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [search]);

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyRegion);
  };

  const editRegion = (region) => {
    setEditingId(region._id);
    setForm({ name: region.name || '', slug: region.slug || '', description: region.description || '' });
    setShowForm(true);
    setError('');
  };

  const saveRegion = async (event) => {
    event.preventDefault();
    setError('');
    try {
      if (editingId) await regionService.update(editingId, form);
      else await regionService.create(form);
      closeForm();
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không lưu được vùng miền. Kiểm tra slug có bị trùng không.');
    }
  };

  const togglePublished = async (region) => {
    try {
      await regionService.setPublished(region._id, !region.isPublished);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không cập nhật được trạng thái vùng miền.');
    }
  };

  const deleteRegion = async (region) => {
    if (!window.confirm(`Xóa mềm vùng miền “${region.name}”?`)) return;
    try {
      await regionService.remove(region._id);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không xóa được vùng miền. Nếu còn làng nghề thuộc vùng này, hãy chuyển làng sang vùng khác trước.');
    }
  };

  if (loading && regions.length === 0) return <Loading />;

  return (
    <div className="container page-wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 22 }}>
        <div><h1 style={{ margin: 0 }}>Quản lý vùng miền</h1><p style={{ margin: '7px 0 0', color: 'var(--text-muted)' }}>Quản lý thông tin và trạng thái công khai của các vùng văn hóa.</p></div>
        <button type="button" className="btn-primary" onClick={() => { setForm(emptyRegion); setEditingId(null); setShowForm(!showForm); }}><Plus size={17} /> {showForm ? 'Đóng biểu mẫu' : 'Thêm vùng miền'}</button>
      </div>

      <div className="filter-bar" style={{ marginBottom: 18 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}><Map size={17} color="var(--text-muted)" /><input aria-label="Tìm vùng miền" placeholder="Tìm theo tên hoặc mô tả..." value={search} onChange={(event) => setSearch(event.target.value)} style={{ width: '100%', padding: 10, border: 0, outline: 0 }} /></label>
      </div>

      {error && <div role="alert" className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}
      {showForm && <form onSubmit={saveRegion} className="form-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h3 style={{ margin: 0 }}>{editingId ? 'Cập nhật vùng miền' : 'Thêm vùng miền'}</h3><button type="button" className="btn-icon" aria-label="Đóng biểu mẫu" onClick={closeForm}><X size={17} /></button></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
          <input required maxLength={120} placeholder="Tên vùng miền *" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <input maxLength={160} placeholder="Slug (tự tạo nếu để trống)" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} />
        </div>
        <textarea rows="3" placeholder="Mô tả vùng miền" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}><button type="button" className="btn-outline" onClick={closeForm}>Hủy</button><button type="submit" className="btn-primary">{editingId ? 'Lưu cập nhật' : 'Tạo vùng miền'}</button></div>
      </form>}

      <div className="form-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead><tr style={{ background: '#f5efe9', borderBottom: '1px solid var(--border)' }}><th style={{ padding: '12px 16px' }}>Vùng miền</th><th style={{ padding: '12px 16px' }}>Slug</th><th style={{ padding: '12px 16px' }}>Trạng thái</th><th style={{ padding: '12px 16px' }}>Thao tác</th></tr></thead>
          <tbody>{regions.map((region) => <tr key={region._id} style={{ borderBottom: '1px solid var(--border)' }}>
            <td style={{ padding: '12px 16px' }}><strong>{region.name}</strong><div style={{ color: 'var(--text-muted)', fontSize: '.88rem', marginTop: 4 }}>{region.description || 'Chưa có mô tả'}</div></td>
            <td style={{ padding: '12px 16px' }}>{region.slug}</td><td style={{ padding: '12px 16px' }}>{region.isPublished ? 'Đang công khai' : 'Đang ẩn'}</td>
            <td style={{ padding: '12px 16px' }}><div style={{ display: 'flex', gap: 8 }}><button type="button" className="btn-outline" onClick={() => editRegion(region)}><Pencil size={14} /> Sửa</button><button type="button" className="btn-outline" onClick={() => togglePublished(region)}>{region.isPublished ? 'Ẩn' : 'Công khai'}</button><button type="button" className="btn-outline" style={{ color: '#c62828', borderColor: '#f5c2c7' }} onClick={() => deleteRegion(region)}><Trash2 size={14} /> Xóa</button></div></td>
          </tr>)}</tbody>
        </table>
        {!loading && regions.length === 0 && <p style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Không tìm thấy vùng miền.</p>}
      </div>
    </div>
  );
}
