// TRANG DANH SÁCH LÀNG NGHỀ
// Hiển thị, tìm kiếm và lọc các làng nghề công khai.
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, RotateCcw } from 'lucide-react';
import { villageService } from '../../services/villageService';
import { regionService } from '../../services/regionService';
import { locationService } from '../../services/locationService';
import Loading from '../../components/Loading';

export default function VillageList({ artisanMode = false, villagePath }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [villages, setVillages] = useState([]);
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const q = searchParams.get('q') || '';
  const regionId = searchParams.get('regionId') || '';
  const province = searchParams.get('province') || '';
  const commune = searchParams.get('commune') || '';
  const detailsBasePath = villagePath || (artisanMode ? '/artisan/villages' : '/user/villages');

  const updateParams = (next) => {
    const merged = { q, regionId, province, commune, ...next };
    const clean = {};
    if (merged.q) clean.q = merged.q;
    if (merged.regionId) clean.regionId = merged.regionId;
    if (merged.province) clean.province = merged.province;
    if (merged.commune) clean.commune = merged.commune;
    setSearchParams(clean);
  };

  useEffect(() => {
    let cancelled = false;
    regionService
      .getPublic()
      .then((data) => { if (!cancelled) setRegions(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setRegions([]); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingProvinces(true);
    locationService
      .getProvinces(regionId ? { regionId } : {})
      .then((data) => { if (!cancelled) setProvinces(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setProvinces([]); })
      .finally(() => { if (!cancelled) setLoadingProvinces(false); });
    return () => { cancelled = true; };
  }, [regionId]);

  useEffect(() => {
    if (!province) {
      setWards([]);
      return;
    }
    let cancelled = false;
    setLoadingWards(true);
    locationService
      .getWards({ province })
      .then((data) => {
        if (!cancelled) setWards(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setWards([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingWards(false);
      });
    return () => {
      cancelled = true;
    };
  }, [province]);

  useEffect(() => {
    setLoading(true);
    villageService
      .getAll({ q, regionId, province, commune })
      .then((data) => setVillages(Array.isArray(data) ? data : []))
      .catch(() => setVillages([]))
      .finally(() => setLoading(false));
  }, [q, regionId, province, commune]);

  return (
    <div className="container page-wrap">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1>{artisanMode ? 'Làng nghề truyền thống' : 'Bản đồ Làng nghề Truyền thống Việt Nam'}</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {artisanMode
            ? 'Tra cứu hồ sơ, địa chỉ và lịch sử các làng nghề truyền thống.'
            : 'Khám phá lịch sử hình thành, địa danh văn hóa và nét đặc trưng của các làng nghề lâu đời trên khắp ba miền.'}
        </p>
      </div>

      {/* Thanh tìm kiếm và lọc theo vùng, tỉnh, xã/phường */}
      <div className="filter-bar" style={{ flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 260px', display: 'flex', alignItems: 'center' }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Tìm tên làng nghề, tỉnh/thành phố (VD: Bát Tràng, Hà Nội, Hội An...)"
            value={q}
            onChange={(e) => updateParams({ q: e.target.value })}
            style={{ width: '100%', paddingLeft: '40px' }}
          />
        </div>

        <select
          aria-label="Lọc theo vùng"
          value={regionId}
          onChange={(e) => updateParams({ regionId: e.target.value, province: '', commune: '' })}
        >
          <option value="">Tất cả vùng</option>
          {regions.map((region) => (
            <option key={region._id} value={region._id}>{region.name}</option>
          ))}
        </select>

        <select
          aria-label="Lọc theo tỉnh thành"
          value={province}
          disabled={loadingProvinces}
          onChange={(e) => updateParams({ province: e.target.value, commune: '' })}
        >
          <option value="">
            {loadingProvinces
              ? 'Đang tải tỉnh/TP...'
              : 'Tất cả tỉnh/thành'}
          </option>
          {provinces.map((p) => (
            <option key={p.code ?? p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Lọc theo xã phường"
          value={commune}
          disabled={!province || loadingWards}
          onChange={(e) => updateParams({ commune: e.target.value })}
        >
          <option value="">
            {!province
              ? 'Chọn tỉnh trước'
              : loadingWards
              ? 'Đang tải xã/phường...'
              : 'Tất cả xã/phường'}
          </option>
          {wards.map((w) => (
            <option key={w.code ?? w.name} value={w.name}>
              {w.name}
            </option>
          ))}
        </select>

        {(q || regionId || province || commune) && (
          <button
            type="button"
            className="btn-outline"
            onClick={() => setSearchParams({})}
          >
            <RotateCcw size={15} /> Xóa lọc
          </button>
        )}
      </div>

      {loading ? (
        <Loading text="Đang tải danh sách làng nghề..." />
      ) : villages.length === 0 ? (
        <div className="form-card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            {q.trim()
              ? `Không tìm thấy làng nghề phù hợp với từ khóa "${q.trim()}"${regionId || province || commune ? ' và bộ lọc đã chọn' : ''}.`
              : regionId || province || commune
              ? 'Không tìm thấy làng nghề phù hợp với bộ lọc địa phương đã chọn.'
              : 'Chưa có làng nghề nào được công khai.'}
          </p>
        </div>
      ) : (
        <div className="cards-grid">
          {villages.map((village) => (
            <Link
              key={village._id || village.slug}
              to={`${detailsBasePath}/${village.slug}`}
              className="heritage-card"
            >
              <div className="card-thumb">
                <img src={village.thumbnail} alt={village.name} />
                <span className="card-badge">{village.province}</span>
              </div>
              <div className="card-body">
                <span className="card-meta">{[village.province, village.commune].filter(Boolean).join(' · ')}</span>
                <h3>{village.name}</h3>
                <p>{village.description || village.history}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
