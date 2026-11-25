// PHÂN TRANG
// Hiển thị điều hướng giữa các trang dữ liệu khi danh sách có nhiều bản ghi.
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ← Trước
      </button>
      <span>
        Trang <strong>{currentPage}</strong> / {totalPages}
      </span>
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Sau →
      </button>
    </div>
  );
}