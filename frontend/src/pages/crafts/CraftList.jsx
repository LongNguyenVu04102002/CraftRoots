// TRANG DANH SÁCH NGHỀ THỦ CÔNG
// Hiển thị, tìm kiếm và lọc các nghề thủ công.
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { craftService } from '../../services/craftService';
import Loading from '../../components/Loading';

export default function CraftList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [crafts, setCrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';

  useEffect(() => {
    setLoading(true);
    craftService
      .getAll({ q, category })
      .then(setCrafts)
      .finally(() => setLoading(false));
  }, [q, category]);

  return (
    <div className="container page-wrap">
      <div className="page-header">
        <h1>Kho di sản Nghề thủ công truyền thống</h1>
        <p>Tra cứu kỹ nghệ, nguyên liệu và quy trình chế tác thủ công đặc sắc của Việt Nam.</p>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm kiếm tên nghề, chất liệu..."
          value={q}
          onChange={(e) => setSearchParams({ q: e.target.value, category })}
        />
        <select
          value={category}
          onChange={(e) => setSearchParams({ q, category: e.target.value })}
        >
          <option value="">Tất cả danh mục</option>
          <option value="Gốm sứ">Gốm sứ</option>
          <option value="Dệt may & Lụa">Dệt may & Lụa</option>
          <option value="Mây tre & Đèn">Mây tre & Đèn</option>
          <option value="Tranh dân gian">Tranh dân gian</option>
        </select>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="cards-grid">
          {crafts.map((item) => (
            <Link key={item._id} to={`/crafts/${item.slug}`} className="heritage-card">
              <div className="card-thumb">
                <img src={item.thumbnail} alt={item.name} />
                <span className="card-badge">{item.category}</span>
              </div>
              <div className="card-body">
                <span className="card-meta">{item.villageName || item.regionName}</span>
                <h3>{item.name}</h3>
                <p>{item.culturalBackground}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}