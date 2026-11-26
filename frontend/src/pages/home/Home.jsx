// TRANG CHỦ
// Giới thiệu CraftRoots và dẫn người dùng đến các khu vực nội dung chính.
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { craftService } from '../../services/craftService';
import { villageService } from '../../services/villageService';
import { artifactService } from '../../services/artifactService';

export default function Home({ basePath = '/user' }) {
  const [crafts, setCrafts] = useState([]);
  const [villages, setVillages] = useState([]);
  const [artifacts, setArtifacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const villagesPath = `${basePath}/villages`;

  useEffect(() => {
    Promise.all([
      craftService.getAll().catch(() => []),
      villageService.getAll().catch(() => []),
      artifactService.getAll().catch(() => [])
    ]).then(([cData, vData, aData]) => {
      setCrafts(cData);
      setVillages(vData);
      setArtifacts(aData);
    });
  }, []);

  const slides = crafts.slice(0, 6);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/crafts?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div>
      {/* HERO SHOWCASE 2 CỘT ĐỘNG */}
      <section className="hero-showcase">
        {slides.map((slide, idx) => (
          <div
            key={slide._id || idx}
            className={`hero-bg-layer ${idx === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url("${slide.thumbnail}")` }}
          />
        ))}
        <div className="hero-bg-mask" />

        <div className="container hero-grid">
          <div className="hero-left">
            <span className="hero-pill-badge">
              <Sparkles size={14} /> Di sản Văn hóa & Làng nghề Việt
            </span>
            <h1 className="hero-main-title">
              Kết nối cội nguồn <span>thủ công truyền thống</span>
            </h1>
            <p className="hero-subtitle">
              CraftRoots lưu giữ câu chuyện, kỹ thuật chế tác tinh xảo và chân dung các nghệ nhân
              bậc thầy trên khắp mọi miền đất nước.
            </p>

            <form onSubmit={handleSearch} className="hero-search-bar">
              <Search size={20} className="hero-search-icon" />
              <input
                type="text"
                placeholder="Tìm tên nghề, vùng miền, chất liệu (VD: Gốm, Bát Tràng, Lụa...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="hero-search-btn">
                Tìm kiếm
              </button>
            </form>

            <div className="hero-quick-row">
              <span className="hero-quick-label">Khám phá nhanh:</span>
              <Link to="/crafts?category=Gốm sứ" className="hero-quick-chip">Gốm sứ</Link>
              <Link to="/crafts?category=Dệt may & Lụa" className="hero-quick-chip">Dệt may & Lụa</Link>
              <Link to="/crafts?category=Mây tre & Đèn" className="hero-quick-chip">Mây tre & Đèn</Link>
            </div>
          </div>

          <div className="hero-right">
            <div className="showcase-card-frame">
              {slides.map((slide, idx) => {
                let positionClass = 'next';
                if (idx === currentSlide) positionClass = 'active';
                else if (idx === (currentSlide - 1 + slides.length) % slides.length) positionClass = 'prev';

                return (
                  <Link
                    key={slide._id || idx}
                    to={`/crafts/${slide.slug}`}
                    className={`showcase-slide-card ${positionClass}`}
                  >
                    <img src={slide.thumbnail} alt={slide.name} className="showcase-slide-img" />
                    <div className="showcase-slide-gradient" />
                    <span className="showcase-cat-tag">{slide.category}</span>
                    <div className="showcase-slide-info">
                      <div className="showcase-loc">
                        <MapPin size={14} /> <span>{slide.regionName || slide.villageName}</span>
                      </div>
                      <h3>{slide.name}</h3>
                      <p>{slide.culturalBackground}</p>
                      <span className="showcase-cta">
                        Khám phá chi tiết <ArrowRight size={15} />
                      </span>
                    </div>
                  </Link>
                );
              })}

              {slides.length > 1 && (
                <div className="showcase-controls">
                  <button
                    type="button"
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                    className="showcase-nav-btn"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="showcase-dots">
                    {slides.map((s, idx) => (
                      <button
                        key={s._id || idx}
                        type="button"
                        className={`showcase-dot ${idx === currentSlide ? 'active' : ''}`}
                        onClick={() => setCurrentSlide(idx)}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                    className="showcase-nav-btn"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* NGHỀ THỦ CÔNG TIÊU BIỂU */}
      <section className="container section-block">
        <div className="section-head">
          <h2>Nghề thủ công tiêu biểu</h2>
          <Link to="/crafts">Xem tất cả nghề →</Link>
        </div>
        <div className="cards-grid">
          {crafts.slice(0, 3).map((item) => (
            <Link key={item._id} to={`/crafts/${item.slug}`} className="heritage-card">
              <div className="card-thumb">
                <img src={item.thumbnail} alt={item.name} />
                <span className="card-badge">{item.category}</span>
              </div>
              <div className="card-body">
                <span className="card-meta">{item.regionName}</span>
                <h3>{item.name}</h3>
                <p>{item.culturalBackground}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* LÀNG NGHỀ TRUYỀN THỐNG */}
      <section className="container section-block">
        <div className="section-head">
          <h2>Làng nghề di sản</h2>
          <Link to={villagesPath}>Khám phá bản đồ làng nghề →</Link>
        </div>
        <div className="cards-grid">
          {villages.slice(0, 3).map((v) => (
            <Link key={v._id} to={`${villagesPath}/${v.slug}`} className="heritage-card">
              <div className="card-thumb">
                <img src={v.thumbnail} alt={v.name} />
                <span className="card-badge">{v.province}</span>
              </div>
              <div className="card-body">
                <h3>{v.name}</h3>
                <p>{v.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* HIỆN VẬT / TÁC PHẨM ĐỘC BẢN */}
      <section className="container section-block">
        <div className="section-head">
          <h2>Hiện vật & Tác phẩm thủ công</h2>
          <Link to="/artifacts">Xem phòng trưng bày →</Link>
        </div>
        <div className="cards-grid">
          {artifacts.slice(0, 3).map((a) => (
            <Link key={a._id} to={`/artifacts/${a.slug}`} className="heritage-card">
              <div className="card-thumb">
                <img src={a.thumbnail} alt={a.name} />
                <span className="card-badge">{a.craftName}</span>
              </div>
              <div className="card-body">
                <span className="card-meta">Nghệ nhân: {a.artisanName}</span>
                <h3>{a.name}</h3>
                <p>{a.culturalMeaning}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
