// FORM GỬI ĐỀ XUẤT
// ARTISAN nhập đề xuất tạo mới/cập nhật/yêu cầu xóa hồ sơ làng nghề,
// nghề thủ công hoặc hiện vật.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, Send, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { userService } from '../../services/userService';
import { contributionService } from '../../services/contributionService';

export default function ContributionForm() {
  const navigate = useNavigate();
  const rawUser = localStorage.getItem('craftroots_user');
  const currentUser = rawUser ? JSON.parse(rawUser) : null;

  const [targetType, setTargetType] = useState('CRAFT');
  const [thumbnail, setThumbnail] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Các trường dữ liệu linh hoạt theo từng loại đối tượng
  const [formData, setFormData] = useState({
    name: '',
    // Dùng cho VILLAGE
    province: '',
    district: '',
    address: '',
    regionName: 'Đồng bằng Bắc Bộ',
    history: '',
    description: '',
    // Dùng cho CRAFT
    category: 'Gốm sứ',
    villageName: '',
    culturalBackground: '',
    material: '',
    technique: '',
    toolsText: '',
    processText: '',
    // Dùng cho ARTIFACT
    craftName: '',
    eraOrYear: 'Đương đại',
    dimensions: '',
    culturalMeaning: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Upload ảnh lên Backend (/api/upload) qua userService.uploadFile
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    try {
      setUploading(true);
      const res = await userService.uploadFile(file);
      setThumbnail(res.url);
    } catch (err) {
      setError(err.response?.data?.message || 'Tải ảnh lên thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Vui lòng nhập tên đối tượng di sản.');
      return;
    }

    // Đóng gói payload chuẩn khớp với Schema Mongoose ở Backend
    let payload = {
      name: formData.name.trim(),
      thumbnail:
        thumbnail ||
        'https://images.pexels.com/photos/6621339/pexels-photo-6621339.jpeg?auto=compress&cs=tinysrgb&w=1000'
    };

    if (targetType === 'VILLAGE') {
      payload = {
        ...payload,
        province: formData.province,
        district: formData.district,
        address: formData.address,
        regionName: formData.regionName,
        history: formData.history,
        description: formData.description
      };
    } else if (targetType === 'CRAFT') {
      payload = {
        ...payload,
        category: formData.category,
        villageName: formData.villageName,
        regionName: formData.regionName,
        culturalBackground: formData.culturalBackground,
        material: formData.material,
        technique: formData.technique,
        tools: formData.toolsText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        process: formData.processText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
      };
    } else if (targetType === 'ARTIFACT') {
      payload = {
        ...payload,
        craftName: formData.craftName,
        artisanName: currentUser?.fullName || 'Nghệ nhân CraftRoots',
        eraOrYear: formData.eraOrYear,
        dimensions: formData.dimensions,
        material: formData.material,
        technique: formData.technique,
        culturalMeaning: formData.culturalMeaning,
        description: formData.description
      };
    }

    try {
      setSubmitting(true);
      await contributionService.create({
        targetType,
        actionType: 'CREATE',
        title: formData.name.trim(),
        payload
      });
      navigate('/artisan/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Gửi đề xuất thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page-wrap" style={{ maxWidth: '760px' }}>
      <Link
        to="/artisan/dashboard"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--primary)',
          fontWeight: 600,
          textDecoration: 'none',
          marginBottom: '16px'
        }}
      >
        <ArrowLeft size={16} /> Quay lại Bảng điều khiển Nghệ nhân
      </Link>

      <div className="page-header" style={{ marginBottom: '22px' }}>
        <h1 style={{ margin: '0 0 8px' }}>Gửi Đề xuất Tư liệu Di sản Mới</h1>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
          Đóng góp hồ sơ Làng nghề, Nghề thủ công hoặc Hiện vật tiêu biểu. Sau khi Quản trị viên phê duyệt, nội dung sẽ hiển thị chính thức trên cổng thông tin.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        {error && (
          <div
            style={{
              background: '#fdecea',
              color: '#b71c1c',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '0.9rem'
            }}
          >
            {error}
          </div>
        )}

        {/* Chọn loại đối tượng đề xuất */}
        <label>1. Chọn loại tư liệu di sản muốn đóng góp *</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {[
            { value: 'CRAFT', label: 'Nghề thủ công' },
            { value: 'VILLAGE', label: 'Làng nghề' },
            { value: 'ARTIFACT', label: 'Hiện vật / Tác phẩm' }
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTargetType(opt.value)}
              style={{
                padding: '12px',
                borderRadius: '10px',
                border:
                  targetType === opt.value
                    ? '2px solid var(--primary)'
                    : '1px solid var(--border)',
                background: targetType === opt.value ? '#fdf3eb' : '#ffffff',
                color: targetType === opt.value ? 'var(--primary)' : 'var(--text-dark)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Tên đối tượng */}
        <label>
          2. Tên{' '}
          {targetType === 'VILLAGE'
            ? 'làng nghề'
            : targetType === 'ARTIFACT'
            ? 'hiện vật / tác phẩm'
            : 'nghề thủ công'}{' '}
          *
        </label>
        <input
          type="text"
          name="name"
          required
          placeholder={
            targetType === 'VILLAGE'
              ? 'VD: Làng gốm Phù Lãng'
              : targetType === 'ARTIFACT'
              ? 'VD: Bình gốm men da lươn khắc nổi'
              : 'VD: Nghề làm nón bài thơ Huế'
          }
          value={formData.name}
          onChange={handleChange}
        />

        {/* Khu vực Upload ảnh đại diện */}
        <label>3. Hình ảnh tư liệu đại diện</label>
        <div
          style={{
            border: '1px dashed var(--primary)',
            borderRadius: '12px',
            padding: '16px',
            background: '#fcf9f5',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <label
              className="btn-outline"
              style={{ cursor: 'pointer', margin: 0 }}
            >
              <Upload size={16} /> {uploading ? 'Đang tải ảnh lên...' : 'Chọn file ảnh từ máy'}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Hỗ trợ JPG, PNG, WEBP (tối đa 20MB)
            </span>
          </div>

          <input
            type="url"
            placeholder="Hoặc dán trực tiếp đường dẫn URL hình ảnh (https://...)"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
          />

          {thumbnail && (
            <div style={{ marginTop: '6px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.82rem',
                  color: '#1b5e20',
                  marginBottom: '6px'
                }}
              >
                <CheckCircle2 size={14} /> Xem trước ảnh đã tải lên:
              </div>
              <img
                src={thumbnail}
                alt="Preview"
                style={{
                  width: '100%',
                  maxHeight: '240px',
                  objectFit: 'cover',
                  borderRadius: '10px',
                  display: 'block'
                }}
              />
            </div>
          )}
        </div>

        {/* Trường nhập riêng cho từng loại đối tượng */}
        {targetType === 'VILLAGE' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>Tỉnh / Thành phố *</label>
                <input
                  name="province"
                  required
                  placeholder="VD: Bắc Ninh"
                  value={formData.province}
                  onChange={handleChange}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>Vùng miền *</label>
                <select name="regionName" value={formData.regionName} onChange={handleChange}>
                  <option value="Đồng bằng Bắc Bộ">Đồng bằng Bắc Bộ</option>
                  <option value="Duyên hải Miền Trung">Duyên hải Miền Trung</option>
                  <option value="Đồng bằng Sông Cửu Long">Đồng bằng Sông Cửu Long</option>
                </select>
              </div>
            </div>

            <label>Địa chỉ cụ thể</label>
            <input
              name="address"
              placeholder="Xã / Phường, Quận / Huyện..."
              value={formData.address}
              onChange={handleChange}
            />

            <label>Giới thiệu không gian làng nghề *</label>
            <textarea
              name="description"
              rows="3"
              required
              value={formData.description}
              onChange={handleChange}
            />

            <label>Lịch sử hình thành & truyền thống</label>
            <textarea
              name="history"
              rows="4"
              value={formData.history}
              onChange={handleChange}
            />
          </>
        )}

        {targetType === 'CRAFT' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>Danh mục nghề *</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  <option value="Gốm sứ">Gốm sứ</option>
                  <option value="Dệt may & Lụa">Dệt may & Lụa</option>
                  <option value="Mây tre & Đèn">Mây tre & Đèn</option>
                  <option value="Tranh dân gian">Tranh dân gian</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>Vùng miền *</label>
                <select name="regionName" value={formData.regionName} onChange={handleChange}>
                  <option value="Đồng bằng Bắc Bộ">Đồng bằng Bắc Bộ</option>
                  <option value="Duyên hải Miền Trung">Duyên hải Miền Trung</option>
                  <option value="Đồng bằng Sông Cửu Long">Đồng bằng Sông Cửu Long</option>
                </select>
              </div>
            </div>

            <label>Làng nghề tiêu biểu</label>
            <input
              name="villageName"
              placeholder="VD: Làng gốm Bát Tràng"
              value={formData.villageName}
              onChange={handleChange}
            />

            <label>Bối cảnh văn hóa & Đặc trưng nghệ thuật *</label>
            <textarea
              name="culturalBackground"
              rows="3"
              required
              value={formData.culturalBackground}
              onChange={handleChange}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>Nguyên liệu chính *</label>
                <input
                  name="material"
                  required
                  placeholder="VD: Đất sét trắng, men tro trấu"
                  value={formData.material}
                  onChange={handleChange}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>Kỹ thuật chế tác *</label>
                <input
                  name="technique"
                  required
                  placeholder="VD: Vuốt tay bàn xoay, nung củi"
                  value={formData.technique}
                  onChange={handleChange}
                />
              </div>
            </div>

            <label>Công cụ chế tác (cách nhau bởi dấu phẩy)</label>
            <input
              name="toolsText"
              placeholder="VD: Bàn xoay gốm, Que tre tạo hình, Bút lông vẽ men"
              value={formData.toolsText}
              onChange={handleChange}
            />

            <label>Các bước quy trình chế tác (mỗi bước xuống 1 dòng)</label>
            <textarea
              name="processText"
              rows="4"
              placeholder={'Bước 1: Chọn và ngâm ủ đất sét\nBước 2: Tạo hình trên bàn xoay\nBước 3: Phủ men và nung lò'}
              value={formData.processText}
              onChange={handleChange}
            />
          </>
        )}

        {targetType === 'ARTIFACT' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>Thuộc dòng nghề thủ công *</label>
                <input
                  name="craftName"
                  required
                  placeholder="VD: Gốm Men Rạn Bát Tràng"
                  value={formData.craftName}
                  onChange={handleChange}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>Niên đại / Năm chế tác</label>
                <input
                  name="eraOrYear"
                  placeholder="VD: 2025"
                  value={formData.eraOrYear}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>Kích thước hiện vật</label>
                <input
                  name="dimensions"
                  placeholder="VD: Cao 45cm x Đường kính 30cm"
                  value={formData.dimensions}
                  onChange={handleChange}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>Chất liệu *</label>
                <input
                  name="material"
                  required
                  placeholder="VD: Đất sét trắng, men cổ"
                  value={formData.material}
                  onChange={handleChange}
                />
              </div>
            </div>

            <label>Kỹ thuật thực hiện</label>
            <input
              name="technique"
              placeholder="VD: Chạm khắc nổi thủ công hoàn toàn"
              value={formData.technique}
              onChange={handleChange}
            />

            <label>Ý nghĩa văn hóa & Giá trị di sản *</label>
            <textarea
              name="culturalMeaning"
              rows="3"
              required
              value={formData.culturalMeaning}
              onChange={handleChange}
            />

            <label>Mô tả chi tiết tác phẩm</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
            />
          </>
        )}

        <button
          type="submit"
          disabled={submitting || uploading}
          className="btn-primary"
          style={{ justifyContent: 'center', marginTop: '10px', padding: '12px 20px' }}
        >
          <Send size={16} /> {submitting ? 'Đang gửi đề xuất...' : 'Gửi đề xuất cho Quản trị viên duyệt'}
        </button>
      </form>
    </div>
  );
}