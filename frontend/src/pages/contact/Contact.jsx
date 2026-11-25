// TRANG LIÊN HỆ
// Người dùng gửi câu hỏi hoặc thông tin liên hệ đến Ban quản trị.
import { useState } from 'react';
import { contributionService } from '../../services/contributionService';

export default function Contact() {
  const [form, setForm] = useState({ fullName: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await contributionService.sendContact(form);
    setSent(true);
    setForm({ fullName: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="container page-wrap" style={{ maxWidth: '640px' }}>
      <h1>Liên hệ & Đóng góp tư liệu</h1>
      <p>Gửi câu hỏi, thông tin làng nghề hoặc phản hồi tới Ban quản trị CraftRoots.</p>
      {sent && <div className="alert-success">Cảm ơn bạn! Tin nhắn đã được gửi thành công.</div>}
      <form onSubmit={handleSubmit} className="form-card">
        <label>Họ và tên</label>
        <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <label>Email liên hệ</label>
        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label>Chủ đề</label>
        <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        <label>Nội dung chi tiết</label>
        <textarea rows="5" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        <button type="submit" className="btn-primary">Gửi liên hệ</button>
      </form>
    </div>
  );
}