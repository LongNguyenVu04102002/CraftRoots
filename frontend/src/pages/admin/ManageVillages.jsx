import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Upload, Search, X, RotateCcw } from 'lucide-react';
import { villageService } from '../../services/villageService';
import { regionService } from '../../services/regionService';
import { locationService } from '../../services/locationService';
import { userService } from '../../services/userService';
import Loading from '../../components/Loading';

const emptyVillage = {
  name: '', slug: '', regionId: '', province: '', commune: '', address: '',
  description: '', history: '', mainImage: ''
};

export default function ManageVillages() {
  const [villages, setVillages] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyVillage);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [communeFilter, setCommuneFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');

  // Dữ liệu địa giới cho bộ lọc bảng
  const [filterProvinces, setFilterProvinces] = useState([]);
  const [filterWards, setFilterWards] = useState([]);
  // Dữ liệu địa giới cho biểu mẫu thêm/sửa
  const [formProvinces, setFormProvinces] = useState([]);
  const [formWards, setFormWards] = useState([]);
  const [loadingFormProvinces, setLoadingFormProvinces] = useState(false);
  const [loadingFormWards, setLoadingFormWards] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await villageService.getAll({
        includeInactive: 'true',
        search,
        regionId: regionFilter,
        province: provinceFilter,
        commune: communeFilter,
        isPublished: statusFilter
      });
      setVillages(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được danh sách. Hãy kiểm tra backend.');
      setVillages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, regionFilter, provinceFilter, communeFilter, statusFilter]);

  useEffect(() => {
    regionService.getAll().then(setRegions).catch(() => setRegions([]));
  }, []);

  // Load tỉnh theo vùng cho thanh bộ lọc
  useEffect(() => {
    if (!regionFilter) {
      setFilterProvinces([]);
      return;
    }
    let cancelled = false;
    locationService
      .getProvinces({ regionId: regionFilter })
      .then((data) => { if (!cancelled) setFilterProvinces(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setFilterProvinces([]); });
    return () => { cancelled = true; };
  }, [regionFilter]);

  // Load xã/phường theo tỉnh cho thanh bộ lọc
  useEffect(() => {
    if (!provinceFilter) {
      setFilterWards([]);
      return;
    }
    let cancelled = false;
    locationService
      .getWards({ province: provinceFilter })
      .then((data) => { if (!cancelled) setFilterWards(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setFilterWards([]); });
    return () => { cancelled = true; };
  }, [provinceFilter]);

  // Load tỉnh theo vùng cho form thêm/sửa
  useEffect(() => {
    if (!showForm || !form.regionId) {
      setFormProvinces([]);
      return;
    }
    let cancelled = false;
    setLoadingFormProvinces(true);
    locationService
      .getProvinces({ regionId: form.regionId })
      .then((data) => { if (!cancelled) setFormProvinces(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setFormProvinces([]); })
      .finally(() => { if (!cancelled) setLoadingFormProvinces(false); });
    return () => { cancelled = true; };
  }, [showForm, form.regionId]);

  // Load xã/phường theo tỉnh cho form thêm/sửa
  useEffect(() => {
    if (!showForm || !form.province) {
      setFormWards([]);
      return;
    }
    let cancelled = false;
    setLoadingFormWards(true);
    locationService
      .getWards({ province: form.province })
      .then((data) => { if (!cancelled) setFormWards(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setFormWards([]); })
      .finally(() => { if (!cancelled) setLoadingFormWards(false); });
    return () => { cancelled = true; };
  }, [showForm, form.province]);

  const hasLegacyProvince = Boolean(form.province && !formProvinces.some((p) => p.name === form.province));
  const hasLegacyCommune = Boolean(form.commune && !formWards.some((w) => w.name === form.commune));

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyVillage);
    setShowForm(false);
    setError('');
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const result = await userService.uploadFile(file);
      setForm((current) => ({ ...current, mainImage: result.url }));
    } catch (err) {
      setError(err.response?.data?.message || 'Tải ảnh lên thất bại.');
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError('');
    try {
      if (editingId) await villageService.update(editingId, form);
      else await villageService.create(form);
      resetForm();
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu làng nghề thất bại.');
    }
  };

  const handleEdit = (village) => {
    setEditingId(village._id);
    setForm({
      name: village.name || '', slug: village.slug || '',
      regionId: village.regionId?._id || village.regionId || '',
      province: village.province || '', commune: village.commune || '',
      address: village.address || '', description: village.description || '',
      history: village.history || '', mainImage: village.mainImage || ''
    });
    setShowForm(true);
    setError('');
  };

  const handleToggleStatus = async (village) => {
    try {
      await villageService.setPublished(village._id, !village.isPublished);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không đổi được trạng thái công khai.');
    }
  };

  const handleDelete = async (village) => {
    if (!window.confirm(`Ẩn/xóa mềm làng nghề “${village.name}”?`)) return;
    try {
      await villageService.remove(village._id);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Xóa làng nghề thất bại.');
    }
  };

  if (loading && villages.length === 0 && !showForm) return <Loading />;

  return (
    <div className="container page-wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 22 }}>
        <div><h1 style={{ margin: 0 }}>Quản lý Làng nghề Truyền thống</h1><p style={{ margin: '7px 0 0', color: 'var(--text-muted)' }}>Tìm kiếm và lọc làng nghề theo vùng, tỉnh và trạng thái.</p></div>
        <button type="button" className="btn-primary" onClick={() => { setEditingId(null); setForm({ ...emptyVillage, regionId: regions[0]?._id || '' }); setShowForm(!showForm); }}>
          <Plus size={17} /> {showForm ? 'Đóng biểu mẫu' : 'Thêm làng nghề'}
        </button>
      </div>

      <div className="filter-bar" style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1.4fr) repeat(4, minmax(140px, 1fr))', gap: 10, marginBottom: 18 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 9, background: '#fff' }}>
          <Search size={17} color="var(--text-muted)" /><input aria-label="Tìm làng nghề" placeholder="Tìm tên hoặc mô tả..." value={search} onChange={(event) => setSearch(event.target.value)} style={{ width: '100%', minWidth: 0, padding: '11px 0', border: 0, outline: 0 }} />
        </label>
        <select aria-label="Lọc vùng miền" value={regionFilter} onChange={(event) => { setRegionFilter(event.target.value); setProvinceFilter(''); setCommuneFilter(''); }}>
          <option value="">Tất cả vùng miền</option>
          {regions.map((region) => <option key={region._id} value={region._id}>{region.name}</option>)}
        </select>
        <select aria-label="Lọc tỉnh thành" value={provinceFilter} disabled={!regionFilter} onChange={(event) => { setProvinceFilter(event.target.value); setCommuneFilter(''); }}>
          <option value="">{regionFilter ? 'Tất cả tỉnh/thành' : 'Chọn vùng trước'}</option>
          {filterProvinces.map((p) => <option key={p.code ?? p.name} value={p.name}>{p.name}</option>)}
        </select>
        <select aria-label="Lọc xã phường" value={communeFilter} disabled={!provinceFilter} onChange={(event) => setCommuneFilter(event.target.value)}>
          <option value="">{provinceFilter ? 'Tất cả xã/phường' : 'Chọn tỉnh trước'}</option>
          {filterWards.map((w) => <option key={w.code ?? w.name} value={w.name}>{w.name}</option>)}
        </select>
        <select aria-label="Lọc trạng thái" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">Mọi trạng thái</option><option value="true">Đang công khai</option><option value="false">Đang ẩn</option></select>
      </div>

      {error && <div role="alert" className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}
      {showForm && (
        <form onSubmit={handleSave} className="form-card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h3 style={{ margin: 0 }}>{editingId ? 'Cập nhật làng nghề' : 'Thêm mới làng nghề'}</h3><button type="button" className="btn-icon" aria-label="Đóng biểu mẫu" onClick={resetForm}><X size={17} /></button></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
            <input required maxLength={160} placeholder="Tên làng nghề *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input maxLength={200} placeholder="Slug (tự tạo nếu để trống)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <select required value={form.regionId} onChange={(e) => setForm({ ...form, regionId: e.target.value, province: '', commune: '' })}>
              <option value="">Chọn vùng miền *</option>
              {regions.map((region) => <option key={region._id} value={region._id}>{region.name}</option>)}
            </select>
            <select required value={form.province} disabled={!form.regionId || loadingFormProvinces} onChange={(e) => setForm({ ...form, province: e.target.value, commune: '' })}>
              <option value="">
                {!form.regionId ? 'Chọn vùng miền trước *' : loadingFormProvinces ? 'Đang tải tỉnh/TP...' : 'Chọn Tỉnh / Thành phố *'}
              </option>
              {hasLegacyProvince && <option value={form.province}>{form.province} (dữ liệu cũ)</option>}
              {formProvinces.map((p) => <option key={p.code ?? p.name} value={p.name}>{p.name}</option>)}
            </select>
            <select value={form.commune} disabled={!form.province || loadingFormWards} onChange={(e) => setForm({ ...form, commune: e.target.value })}>
              <option value="">
                {!form.province ? 'Chọn tỉnh/TP trước' : loadingFormWards ? 'Đang tải xã/phường...' : 'Chọn Xã / Phường'}
              </option>
              {hasLegacyCommune && <option value={form.commune}>{form.commune} (dữ liệu cũ)</option>}
              {formWards.map((w) => <option key={w.code ?? w.name} value={w.name}>{w.name}</option>)}
            </select>
            <input placeholder="Địa chỉ cụ thể" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <textarea required rows="2" placeholder="Mô tả tổng quan làng nghề *" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <textarea rows="3" placeholder="Lịch sử hình thành" value={form.history} onChange={(e) => setForm({ ...form, history: e.target.value })} />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><input style={{ flex: 1 }} placeholder="URL ảnh đại diện" value={form.mainImage} onChange={(e) => setForm({ ...form, mainImage: e.target.value })} /><label className="btn-outline" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}><Upload size={15} /> Tải ảnh<input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} /></label></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}><button type="button" className="btn-outline" onClick={resetForm}>Hủy</button><button type="submit" className="btn-primary">{editingId ? 'Lưu cập nhật' : 'Tạo mới'}</button></div>
        </form>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 2px 10px', color: 'var(--text-muted)', fontSize: '.9rem' }}><span>{loading ? 'Đang cập nhật...' : `Tìm thấy ${villages.length} làng nghề`}</span><button type="button" className="btn-outline" onClick={() => { setSearch(''); setRegionFilter(''); setProvinceFilter(''); setCommuneFilter(''); setStatusFilter(''); }}><RotateCcw size={14} /> Xóa bộ lọc</button></div>
      <div className="form-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead><tr style={{ background: '#f5efe9', borderBottom: '1px solid var(--border)' }}><th style={{ padding: '12px 16px' }}>Ảnh</th><th style={{ padding: '12px 16px' }}>Tên làng nghề</th><th style={{ padding: '12px 16px' }}>Tỉnh/Thành - Xã/Phường</th><th style={{ padding: '12px 16px' }}>Vùng miền</th><th style={{ padding: '12px 16px' }}>Trạng thái</th><th style={{ padding: '12px 16px' }}>Thao tác</th></tr></thead>
          <tbody>{villages.map((village) => <tr key={village._id} style={{ borderBottom: '1px solid var(--border)' }}>
            <td style={{ padding: '12px 16px' }}>{village.mainImage ? <img src={village.mainImage} alt={village.name} style={{ width: 56, height: 42, objectFit: 'cover', borderRadius: 6 }} /> : '—'}</td>
            <td style={{ padding: '12px 16px', fontWeight: 600 }}>{village.name}</td><td style={{ padding: '12px 16px' }}>{[village.province, village.commune].filter(Boolean).join(' — ') || '—'}</td><td style={{ padding: '12px 16px' }}>{village.regionId?.name || '—'}</td>
            <td style={{ padding: '12px 16px' }}>{village.isPublished ? 'Đang công khai' : 'Đang ẩn'}</td><td style={{ padding: '12px 16px' }}><div style={{ display: 'flex', gap: 8 }}><button type="button" className="btn-outline" onClick={() => handleEdit(village)}><Pencil size={14} /> Sửa</button><button type="button" className="btn-outline" onClick={() => handleToggleStatus(village)}>{village.isPublished ? 'Ẩn' : 'Công khai'}</button><button type="button" className="btn-outline" style={{ color: '#c62828', borderColor: '#f5c2c7' }} onClick={() => handleDelete(village)}><Trash2 size={14} /> Xóa</button></div></td>
          </tr>)}</tbody>
        </table>
        {!loading && villages.length === 0 && <p style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Không tìm thấy làng nghề phù hợp với bộ lọc.</p>}
      </div>
    </div>
  );
}
