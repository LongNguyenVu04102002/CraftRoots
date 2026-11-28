import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
    Plus, Pencil, Trash2, Search, X, RotateCcw, Folder,
    FolderTree, ChevronRight, ChevronDown, EyeOff, AlertTriangle,
    CornerDownRight
} from "lucide-react";
import { craftDirectoryService } from "../../services/craftDirectoryService";
import Loading from "../../components/Loading";

// Các trường vẫn sử dụng đúng cấu trúc dữ liệu Backend hiện tại.
const emptyForm = {
    name: "", slug: "", description: "", imageUrl: "",
    parentId: "", position: "main", sortOrder: 0,
};
const getId = (value) => String(typeof value === "object" ? value?._id || "" : value || "");
const normalize = (value) => String(value ?? "").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
const makeSlug = (value) => normalize(value).trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const getError = (err, fallback) => err.response?.data?.message || fallback;
const row = { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" };
const field = { display: "grid", gap: 6, minWidth: 0 };
// Đồng bộ chiều cao và kích thước các ô chọn trong hộp thoại.
const selectStyle = {
    boxSizing: "border-box",
    width: "100%",
    minWidth: 0,
    maxWidth: "100%",
    height: 40,
    padding: "0 32px 0 12px",
    border: "1px solid var(--border, #e2e8f0)",
    borderRadius: 10,
    backgroundColor: "var(--card-bg, #fff)",
    color: "var(--text, #1f2937)",
    fontFamily: "inherit",
    fontSize: 14,
    cursor: "pointer",
};
const toolbarButtonStyle = {
    boxSizing: "border-box", height: 40, flexShrink: 0,
    whiteSpace: "nowrap", display: "inline-flex", alignItems: "center",
    justifyContent: "center", gap: 6,
};
const muted = { color: "var(--text-muted, #64748b)", fontSize: 13 };
const border = "1px solid var(--border, #e2e8f0)";
const danger = { color: "#b91c1c", borderColor: "#fecaca" };
const actionStyle = { padding: "7px 10px", fontSize: 13, whiteSpace: "nowrap" };
const sorted = (items) => [...items].sort((a, b) =>
    (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name, "vi"));

// Component độc lập. Cha render khi mở và bỏ render khi đóng.
// onClose: đóng Modal; onChanged (tùy chọn): thông báo đã thay đổi dữ liệu.
export default function ManageCraftDirectories({ onClose, onChanged }) {
    const dialogRef = useRef(null);
    const editorRef = useRef(null);
    const confirmRef = useRef(null);
    const busyRef = useRef(false);
    const [directories, setDirectories] = useState([]);
    const [expanded, setExpanded] = useState(new Set());
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [form, setForm] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [pending, setPending] = useState(null);
    const [dialogError, setDialogError] = useState("");

    // Sử dụng dialog gốc của trình duyệt để khóa tương tác với nền.
    useEffect(() => {
        const dialog = dialogRef.current;
        if (dialog && !dialog.open) dialog.showModal();
        return () => { if (dialog?.open) dialog.close(); };
    }, []);

    const loadDirectories = async () => {
        setLoading(true);
        try {
            const data = await craftDirectoryService.getAll();
            if (!Array.isArray(data)) throw new Error("Dữ liệu không hợp lệ");
            setDirectories(data);
        } catch (err) {
            setError(getError(err, "Không tải được danh sách nhóm nghề. Hãy thử tải lại."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadDirectories(); }, []);
    useEffect(() => {
        if (form) editorRef.current?.scrollIntoView({ block: "nearest" });
    }, [editingId, Boolean(form)]);
    useEffect(() => {
        if (pending) {
            confirmRef.current?.scrollIntoView({ block: "nearest" });
            confirmRef.current?.querySelector("button")?.focus();
        }
    }, [pending]);

    const clearMessages = () => { setError(""); setSuccess(""); };
    const begin = () => {
        if (busyRef.current) return false;
        busyRef.current = true;
        setBusy(true);
        return true;
    };
    const finish = () => { busyRef.current = false; setBusy(false); };
    const requestClose = () => { if (!busyRef.current) onClose?.(); };
    const byId = new Map(directories.map(item => [getId(item._id), item]));
    const roots = sorted(directories.filter(item => !getId(item.parentId)));
    const childrenOf = (id) => sorted(directories.filter(item => getId(item.parentId) === getId(id)));
    const activeCount = directories.filter(item => item.isActive).length;
    const searching = Boolean(search.trim()) || status !== "all";
    const matches = (item) => {
        const parentName = byId.get(getId(item.parentId))?.name || "";
        return normalize(`${item.name} ${item.slug} ${parentName}`).includes(normalize(search.trim())) &&
            (status === "all" || (status === "active" ? item.isActive : !item.isActive));
    };
    // Dữ liệu cũ sai phân cấp không bị biến mất khỏi giao diện.
    const rootIds = new Set(roots.map(item => getId(item._id)));
    const misplaced = directories.filter(item => {
        const parent = getId(item.parentId);
        return parent && !rootIds.has(parent);
    });
    const visibleRoots = roots.filter(item => matches(item) || childrenOf(item._id).some(matches));
    const current = byId.get(editingId);
    const hasChildren = Boolean(editingId && childrenOf(editingId).length);
    const parentOptions = roots.filter(item => getId(item._id) !== editingId && item.isActive && !hasChildren);
    // Cho phép sửa thông tin nhóm đã ẩn mà không buộc đổi nhóm cấp trên.
    if (!hasChildren && current && !current.isActive && getId(current.parentId)) {
        const oldParent = byId.get(getId(current.parentId));
        if (oldParent && !getId(oldParent.parentId) && getId(oldParent._id) !== editingId &&
            !parentOptions.some(item => getId(item._id) === getId(oldParent._id))) {
            parentOptions.push(oldParent);
        }
    }

    const toggle = (id) => setExpanded(old => {
        const next = new Set(old);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
    });
    const openCreate = (parentId = "") => {
        clearMessages(); setPending(null); setEditingId(null);
        setForm({ ...emptyForm, parentId, position: parentId ? "sub" : "main" });
    };
    const openEdit = (item) => {
        clearMessages(); setPending(null); setEditingId(getId(item._id));
        setForm({
            name: item.name || "", slug: item.slug || "",
            description: item.description || "", imageUrl: item.imageUrl || "",
            parentId: getId(item.parentId),
            position: getId(item.parentId) ? "sub" : "main",
            sortOrder: item.sortOrder ?? 0,
        });
    };
    const closeEditor = () => { setForm(null); setEditingId(null); };
    const change = (key, value) => setForm(old => ({ ...old, [key]: value }));

    // Vị trí chỉ là lựa chọn trên giao diện; Backend vẫn nhận parentId.
    const changePosition = (position) => {
        setForm(old => ({ ...old, position,
            parentId: position === "main" ? "" : old.parentId }));
    };

    const handleSave = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!form || busyRef.current) return;
        clearMessages();
        const name = form.name.trim();
        // Giữ nguyên đường dẫn cũ khi đổi tên để không làm hỏng liên kết.
        const slug = editingId ? (form.slug || makeSlug(name)) : makeSlug(name);
        const sortOrder = Number(form.sortOrder);
        if (!name || !slug || !Number.isInteger(sortOrder) || sortOrder < 0) {
            setError("Hãy nhập tên hợp lệ và thứ tự hiển thị là số nguyên không âm.");
            return;
        }
        if (form.position === "sub" && (!form.parentId || !parentOptions.some(item => getId(item._id) === form.parentId))) {
            setError("Hãy chọn một nhóm nghề chính hợp lệ, hoặc chuyển thành nhóm nghề chính.");
            return;
        }
        if (!begin()) return;
        try {
            const payload = { name, slug, description: form.description.trim(),
                imageUrl: form.imageUrl.trim(), parentId: form.position === "main" ? null : form.parentId, sortOrder };
            if (editingId) await craftDirectoryService.update(editingId, payload);
            else await craftDirectoryService.create(payload);
            if (payload.parentId) setExpanded(old => new Set([...old, payload.parentId]));
            setSuccess(editingId ? "Đã lưu thay đổi nhóm nghề." : "Đã thêm nhóm nghề mới.");
            closeEditor();
            await loadDirectories();
            // Callback báo cho component cha biết dữ liệu đã thay đổi.
            onChanged?.();
        } catch (err) {
            setError(getError(err, "Không thể lưu nhóm nghề."));
        } finally { finish(); }
    };

    const openConfirm = (item, action) => {
        clearMessages(); setDialogError(""); setPending({ item, action });
    };
    const confirmAction = async () => {
        if (!pending || busyRef.current) return;
        setDialogError("");
        const { item, action } = pending;
        const id = getId(item._id);
        if (!begin()) return;
        try {
            if (action === "delete") await craftDirectoryService.permanentDelete(id);
            else if (action === "hide") await craftDirectoryService.remove(id);
            else await craftDirectoryService.toggleActive(id, true);
            const messages = { delete: "Đã xóa vĩnh viễn nhóm nghề.", hide: "Đã ẩn nhóm nghề.", restore: "Đã khôi phục nhóm nghề." };
            setSuccess(messages[action]);
            setPending(null);
            if (editingId === id) closeEditor();
            await loadDirectories();
            onChanged?.();
        } catch (err) {
            // Backend là nơi kiểm tra liên kết thực tế, kể cả nghề đã ẩn.
            setDialogError(getError(err, "Không thể thực hiện thao tác này."));
        } finally { finish(); }
    };

    const renderItem = (item, isRoot = false) => {
        const id = getId(item._id);
        const children = isRoot ? childrenOf(id) : [];
        const open = searching || expanded.has(id);
        return (
            <div key={id} style={{ ...row, justifyContent: "space-between", padding: "12px 14px",
                background: isRoot ? "#f5f7f3" : "transparent", borderBottom: border }}>
                <div style={{ ...row, flex: "1 1 240px", minWidth: 0 }}>
                    {isRoot ? (
                        <button type="button" className="btn-icon" onClick={() => toggle(id)}
                                disabled={searching || !children.length} aria-expanded={open} aria-label={`${open ? "Thu gọn" : "Mở rộng"} ${item.name}`}>
                            {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                    ) : <CornerDownRight size={17} color="#94a3b8" />}
                    <Folder size={isRoot ? 21 : 18} color="#b7791f" />
                    <div style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>
                        <strong>{item.name}</strong>
                        <div style={muted}>{isRoot ? `${children.length} nhóm trực thuộc` : "Nhóm trực thuộc"} · Thứ tự: {item.sortOrder ?? 0}</div>
                        {item.description && <div style={{ ...muted, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.description}</div>}
                    </div>
                    <span style={{ fontSize: 12, padding: "4px 9px", borderRadius: 20,
                        background: item.isActive ? "#dcfce7" : "#f1f5f9", color: item.isActive ? "#166534" : "#475569" }}>
                        {item.isActive ? "Đang hiển thị" : "Đã ẩn"}
                    </span>
                </div>
                <div style={{ ...row, gap: 6 }}>
                    {isRoot && item.isActive && <button type="button" className="btn-outline" style={actionStyle} disabled={busy || loading || !!pending} onClick={() => openCreate(id)}><Plus size={15} /> Thêm nhóm nhỏ</button>}
                    <button type="button" className="btn-outline" style={actionStyle} disabled={busy || loading || !!pending} onClick={() => openEdit(item)}><Pencil size={15} /> Sửa</button>
                    <button type="button" className="btn-outline" style={actionStyle} disabled={busy || loading || !!pending} onClick={() => openConfirm(item, item.isActive ? "hide" : "restore")}>
                        {item.isActive ? <EyeOff size={15} /> : <RotateCcw size={15} />}{item.isActive ? "Ẩn" : "Khôi phục"}
                    </button>
                    <button type="button" className="btn-outline" style={{ ...actionStyle, ...danger }} disabled={busy || loading || !!pending} onClick={() => openConfirm(item, "delete")}><Trash2 size={15} /> Xóa</button>
                </div>
            </div>
        );
    };

    return createPortal(
        <dialog ref={dialogRef} className="craft-directory-dialog" aria-labelledby="craft-directory-title"
                onCancel={event => { event.preventDefault(); if (busyRef.current) return; if (pending) setPending(null); else if (form) closeEditor(); else requestClose(); }}
                style={{ width: "min(1100px, calc(100% - 24px))", maxWidth: "none", maxHeight: "90vh", padding: 0, margin: "auto",
                    border: 0, borderRadius: 16, color: "var(--text, #1f2937)", background: "var(--card-bg, #fff)",
                    boxShadow: "0 20px 60px rgba(15,23,42,.28)", overflow: "auto", boxSizing: "border-box" }}>
            <style>{`
                .craft-directory-dialog::backdrop { background: rgba(15,23,42,.55); backdrop-filter: blur(3px); }
                .craft-directory-dialog select:focus-visible,
                .craft-directory-dialog input:focus-visible { outline: 2px solid #a64b2a; outline-offset: 2px; }
            `}</style>
            <header style={{ ...row, justifyContent: "space-between", padding: "18px 22px", borderBottom: border,
                position: "sticky", top: 0, background: "var(--card-bg, #fff)", zIndex: 2 }}>
                <div style={{ ...row, flex: "1 1 240px" }}>
                    <FolderTree size={26} color="#386344" />
                    <div><h2 id="craft-directory-title" style={{ margin: 0, fontSize: 21 }}>Quản lý danh mục nghề</h2>
                        <p style={{ ...muted, margin: "4px 0 0" }}>Sắp xếp nhóm nghề để dễ dàng tra cứu và quản lý.</p></div>
                </div>
                <button type="button" className="btn-outline" onClick={requestClose} disabled={busy} aria-label="Đóng quản lý danh mục"><X size={18} /> Đóng</button>
            </header>
            <div style={{ padding: "18px 22px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(135px,1fr))", gap: 10, marginBottom: 18 }}>
                    {[["Tổng nhóm nghề", directories.length, "inherit"], ["Đang hiển thị", activeCount, "#166534"], ["Đã ẩn", directories.length - activeCount, "#64748b"]].map(([label, n, color]) => (
                        <div key={label} style={{ border, borderRadius: 10, padding: 14 }}><div style={muted}>{label}</div><strong style={{ fontSize: 25, color }}>{n}</strong></div>
                    ))}
                </div>
                {/* Thanh tìm kiếm và bộ lọc đồng bộ, tự xuống dòng khi hẹp. */}
                <div style={{ ...row, marginBottom: 16, alignItems: "center" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8,
                        flex: "1 1 240px", minWidth: 0, maxWidth: "100%", height: 40,
                        border, borderRadius: 10, padding: "0 12px", boxSizing: "border-box",
                        background: "var(--card-bg, #fff)" }}>
                        <Search size={17} color="#64748b" style={{ flexShrink: 0 }} />
                        <input aria-label="Tìm nhóm nghề" placeholder="Tìm kiếm nhóm nghề..."
                               value={search} onChange={e => setSearch(e.target.value)}
                               style={{ border: 0, width: "100%", minWidth: 0, height: "100%",
                                   boxSizing: "border-box", padding: 0, background: "transparent",
                                   fontFamily: "inherit", fontSize: 14 }} />
                    </label>
                    <div style={{ flex: "0 1 180px", minWidth: 0, maxWidth: "100%" }}>
                        <select aria-label="Lọc trạng thái" value={status}
                                onChange={e => setStatus(e.target.value)} style={selectStyle}>
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Đang hiển thị</option>
                            <option value="inactive">Đã ẩn</option>
                        </select>
                    </div>
                    <button type="button" className="btn-outline" style={toolbarButtonStyle}
                            disabled={busy || loading} onClick={() => { clearMessages(); loadDirectories(); }}>
                        <RotateCcw size={15} /> Tải lại
                    </button>
                    <button type="button" className="btn-primary" style={toolbarButtonStyle}
                            disabled={busy || loading || !!pending} onClick={() => openCreate()}>
                        <Plus size={17} /> Thêm nhóm nghề
                    </button>
                </div>
                {error && <div className="alert-error" role="alert" style={{ marginBottom: 14 }}>{error}</div>}
                {success && <div role="status" style={{ marginBottom: 14, padding: 12, background: "#dcfce7", color: "#166534", borderRadius: 8 }}>{success}</div>}
                {form && <form ref={editorRef} onSubmit={handleSave} style={{ border, padding: 16, borderRadius: 12, marginBottom: 18 }}>
                    <div style={{ ...row, justifyContent: "space-between", marginBottom: 12 }}>
                        <h3 style={{ margin: 0 }}>{editingId ? "Chỉnh sửa nhóm nghề" : "Thêm nhóm nghề mới"}</h3>
                        <button type="button" className="btn-icon" onClick={closeEditor} disabled={busy} aria-label="Đóng biểu mẫu"><X size={18}/></button>
                    </div>
                    <fieldset disabled={busy || !!pending} style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(220px,100%),1fr))", gap: 14 }}>
                            <label style={field}>Tên nhóm nghề *<input required value={form.name} onChange={e => change("name", e.target.value)} placeholder="Ví dụ: Gốm mỹ nghệ" /></label>
                            <label style={field}>Thứ tự hiển thị<input required type="number" min="0" step="1" value={form.sortOrder} onChange={e => change("sortOrder", e.target.value)} /></label>
                            <label style={field}>Đường dẫn ảnh đại diện<input value={form.imageUrl} onChange={e => change("imageUrl", e.target.value)} placeholder="https://..." /></label>
                        </div>
                        {/* Chọn cách phân loại bằng ngôn ngữ thân thiện. */}
                        <fieldset style={{ border: 0, margin: "18px 0 0", padding: 0, minWidth: 0 }}>
                            <legend style={{ fontWeight: 600, marginBottom: 10 }}>Bạn muốn sắp xếp nhóm nghề như thế nào?</legend>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(260px,100%),1fr))", gap: 12 }}>
                                {[
                                    { value: "main", title: "Tạo nhóm nghề chính", editTitle: "Đặt làm nhóm nghề chính", description: "Một nhóm độc lập, ví dụ Gốm sứ hoặc Dệt may.", Icon: Folder },
                                    { value: "sub", title: "Thêm vào nhóm nghề có sẵn", editTitle: "Đặt trong một nhóm nghề có sẵn", description: "Một nhóm nhỏ, ví dụ Gốm mỹ nghệ thuộc Gốm sứ.", Icon: FolderTree }
                                ].map(({ value, title, editTitle, description, Icon }) => {
                                    const checked = form.position === value;
                                    const disabled = value === "sub" && (hasChildren || (!parentOptions.length && !checked));
                                    return <label key={value} style={{ display: "flex", alignItems: "flex-start", gap: 10,
                                        border: checked ? "2px solid #386344" : border,
                                        borderRadius: 10, padding: 14, background: checked ? "#f0f7f1" : "transparent",
                                        color: "var(--text, #1f2937)", cursor: disabled ? "not-allowed" : "pointer",
                                        opacity: disabled ? 0.55 : 1, boxSizing: "border-box" }}>
                                        <input type="radio" name="directory-position" value={value} checked={checked}
                                               disabled={disabled} onChange={() => changePosition(value)}
                                               style={{ width: 17, height: 17, flexShrink: 0, margin: "3px 0 0", accentColor: "#386344" }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <strong>{editingId ? editTitle : title}</strong>
                                            <div style={{ ...muted, marginTop: 4, lineHeight: 1.5 }}>{description}</div>
                                        </div>
                                        <Icon size={21} color="#b7791f" style={{ flexShrink: 0 }} />
                                    </label>;
                                })}
                            </div>
                            {hasChildren && <p style={{ ...muted, margin: "8px 0 0" }}>Nhóm này đang chứa nhóm nhỏ nên không thể chuyển vào một nhóm khác.</p>}
                            {!hasChildren && !parentOptions.length && <p style={{ ...muted, margin: "8px 0 0" }}>Chưa có nhóm chính phù hợp. Hãy tạo hoặc khôi phục một nhóm chính trước.</p>}
                            {form.position === "sub" && <div style={{ marginTop: 12 }}>
                                <label style={field}>Thuộc nhóm nghề *
                                    <select required value={form.parentId} onChange={e => change("parentId", e.target.value)} style={selectStyle}>
                                        <option value="">-- Chọn nhóm nghề --</option>
                                        {form.parentId && !parentOptions.some(item => getId(item._id) === form.parentId) && <option value={form.parentId} disabled>{byId.get(form.parentId)?.name || "Nhóm cũ"} — cần chọn lại</option>}
                                        {parentOptions.map(item => <option key={getId(item._id)} value={getId(item._id)}>{item.name}{item.isActive ? "" : " (đã ẩn, giữ liên kết cũ)"}</option>)}
                                    </select>
                                    <small style={muted}>Danh sách được cập nhật từ các nhóm nghề chính trong hệ thống.</small>
                                </label>
                            </div>}
                            <div style={{ border, borderRadius: 10, padding: 14, marginTop: 12, background: "var(--card-bg, #fff)" }}>
                                <div style={{ ...muted, marginBottom: 9 }}>Xem trước cách sắp xếp</div>
                                {form.position === "main" ? (
                                    <div style={{ ...row, overflowWrap: "anywhere" }}><Folder size={20} color="#b7791f" /><strong>{form.name.trim() || "Nhóm nghề mới"}</strong></div>
                                ) : <>
                                    <div style={{ ...row, overflowWrap: "anywhere" }}><Folder size={20} color="#b7791f" /><strong>{byId.get(form.parentId)?.name || "Chưa chọn nhóm nghề"}</strong></div>
                                    <div style={{ ...row, margin: "8px 0 0 22px", overflowWrap: "anywhere" }}><CornerDownRight size={17} color="#94a3b8" /><Folder size={18} color="#b7791f" />{form.name.trim() || "Nhóm nghề mới"}</div>
                                </>}
                            </div>
                        </fieldset>
                        <label style={{ ...field, marginTop: 14 }}>Mô tả<textarea rows={3} value={form.description} onChange={e => change("description", e.target.value)} placeholder="Giới thiệu nhóm nghề..." /></label>
                        <small style={{ ...muted, display: "block", marginTop: 10 }}>Hệ thống tự xử lý đường dẫn nhóm nghề, bạn không cần nhập.</small>
                    </fieldset>
                    <div style={{ ...row, justifyContent: "flex-end", marginTop: 14 }}>
                        <button type="button" className="btn-outline" disabled={busy} onClick={closeEditor}>Hủy</button>
                        <button type="submit" className="btn-primary" disabled={busy || loading || !!pending || (form.position === "sub" && (!form.parentId || !parentOptions.some(item => getId(item._id) === form.parentId)))}>{busy ? "Đang lưu..." : "Lưu nhóm nghề"}</button>
                    </div>
                </form>}
                {pending && <section ref={confirmRef} aria-labelledby="confirm-directory-action" style={{ border: "1px solid #e2e8f0", borderRadius: 12, background: "#f8fafc", padding: 18, marginBottom: 18 }}>
                    <div style={row}><AlertTriangle size={23} color={pending.action === "restore" ? "#166534" : "#b45309"} /><h3 id="confirm-directory-action" style={{ margin: 0 }}>{pending.action === "delete" ? "Xóa vĩnh viễn nhóm nghề?" : pending.action === "hide" ? "Ẩn nhóm nghề?" : "Khôi phục nhóm nghề?"}</h3></div>
                    <p>Nhóm nghề: <strong style={{ overflowWrap: "anywhere" }}>{pending.item.name}</strong></p>
                    <p style={muted}>{pending.action === "delete" ? "Dữ liệu sẽ bị xóa khỏi hệ thống và không thể khôi phục. Chỉ xóa được nhóm không còn nghề hoặc nhóm trực thuộc liên quan." : pending.action === "hide" ? "Nhóm nghề sẽ không còn xuất hiện trong danh sách nhóm công khai. Dữ liệu vẫn được giữ lại." : "Nhóm nghề sẽ xuất hiện lại trong danh sách nhóm công khai."}</p>
                    {dialogError && <div className="alert-error" role="alert" style={{ marginBottom: 10 }}>{dialogError}</div>}
                    <div style={{ ...row, justifyContent: "flex-end" }}>
                        <button type="button" className="btn-outline" disabled={busy} onClick={() => setPending(null)}>Hủy</button>
                        <button type="button" className="btn-primary" disabled={busy} style={pending.action === "delete" ? { background: "#dc2626", color: "#fff" } : {}} onClick={confirmAction}>{busy ? "Đang xử lý..." : pending.action === "delete" ? "Xác nhận xóa" : pending.action === "hide" ? "Xác nhận ẩn" : "Khôi phục"}</button>
                    </div>
                </section>}
                <div style={{ ...muted, marginBottom: 10 }}>Nhấn mũi tên để mở hoặc thu gọn nhóm nghề. Mỗi nhóm chính có thể chứa các nhóm nhỏ.</div>
                {loading ? <Loading /> : <div style={{ display: "grid", gap: 10 }}>
                    {visibleRoots.map(root => {
                        const id = getId(root._id);
                        const children = childrenOf(id);
                        const shownChildren = searching ? children.filter(matches) : children;
                        return <div key={id} style={{ border, borderRadius: 10, overflow: "hidden" }}>
                            {renderItem(root, true)}
                            {(searching || expanded.has(id)) && shownChildren.map(child => <div key={child._id} style={{ paddingLeft: 22 }}>{renderItem(child)}</div>)}
                        </div>;
                    })}
                    {misplaced.filter(matches).length > 0 && <div style={{ border, borderRadius: 10, overflow: "hidden" }}>
                        <p style={{ padding: 12, margin: 0, background: "#fff7ed", color: "#9a3412" }}>Nhóm cần sắp xếp lại (dữ liệu phân cấp cũ).</p>
                        {misplaced.filter(matches).map(item => renderItem(item))}
                    </div>}
                    {!visibleRoots.length && !misplaced.filter(matches).length && <p style={{ ...muted, textAlign: "center", padding: 18 }}>Không tìm thấy nhóm nghề phù hợp.</p>}
                </div>}
            </div>
            <footer style={{ ...row, justifyContent: "flex-end", padding: "12px 22px", borderTop: border }}>
                <button type="button" className="btn-outline" disabled={busy} onClick={requestClose}>Quay lại quản lý nghề</button>
            </footer>
        </dialog>, document.body
    );
}
