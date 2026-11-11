# CraftRoots – Sườn dự án ban đầu

Dự án gồm:
- `backend`: Node.js + Express + MongoDB (Mongoose), tổ chức theo MVC cơ bản.
- `frontend`: React + Vite.

## Quy ước
- Các file `.js` / `.jsx` hiện chỉ chứa comment mô tả nhiệm vụ, chưa có code chức năng.
- Mỗi thành viên chỉ phát triển phân hệ được phân công.
- Thống nhất schema, tên trường và API trước khi triển khai.
- Không đưa `.env`, `node_modules`, hoặc dữ liệu nhạy cảm lên Git.

## Phân công gợi ý
- Thành viên 1: users, xác thực và phân quyền.
- Thành viên 2: regions, villages.
- Thành viên 3: craftDirectories, crafts.
- Thành viên 4: artifacts, artisans.
- Thành viên 5: contributions, contacts và tích hợp kiểm duyệt.
