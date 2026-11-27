// THÀNH PHẦN LOADING
// Hiển thị trạng thái đang tải dữ liệu.
export default function Loading({ text = 'Đang tải dữ liệu di sản...' }) {
  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', color: '#7c5c46' }}>
      <div className="spinner" />
      <p style={{ marginTop: '12px', fontWeight: 500 }}>{text}</p>
    </div>
  );
}
