
import { useEffect, useState } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    X,
    RotateCcw
} from "lucide-react";

import { craftService } from "../../services/craftService";
import Loading from "../../components/Loading";

// Dữ liệu mặc định của biểu mẫu
const emptyCraft = {
    name: "",
    slug: "",
    directoryId: "",
    villageIds: [],
    description: "",
    history: "",
    materials: [],
    tools: [],
    processSteps: [],
    images: [],
    sourceReferences: [],
    isPublished: false
};

export default function ManageCrafts() {
    const [crafts, setCrafts] = useState([]);
    const [directories, setDirectories] = useState([]);
    const [villages, setVillages] = useState([]);

    const [form, setForm] = useState(emptyCraft);
    const [editingId, setEditingId] = useState(null);

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");

    // Tải danh sách nghề thủ công
    const loadCrafts = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await craftService.getAll();
            setCrafts(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Không tải được danh sách nghề thủ công."
            );
            setCrafts([]);
        } finally {
            setLoading(false);
        }
    };

    // Tải danh mục và làng nghề
    const loadRelatedData = async () => {
        try {
            const [directoryData, villageData] = await Promise.all([
                craftService.getDirectories(),
                craftService.getVillages()
            ]);

            setDirectories(Array.isArray(directoryData) ? directoryData : []);
            setVillages(Array.isArray(villageData) ? villageData : []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Không tải được danh mục hoặc làng nghề."
            );
        }
    };

    useEffect(() => {
        loadCrafts();
        loadRelatedData();
    }, []);

    // Đóng và làm mới biểu mẫu
    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyCraft);
        setError("");
    };

    // Tạo slug đơn giản từ tên nghề
    const createSlug = (value) => {
        return value
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "d")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    };

    // Thêm hoặc cập nhật nghề
    const handleSave = async (event) => {
        event.preventDefault();
        setError("");

        if (!form.name.trim()) {
            setError("Vui lòng nhập tên nghề thủ công.");
            return;
        }

        if (!form.directoryId) {
            setError("Vui lòng chọn danh mục nghề.");
            return;
        }

        const data = {
            ...form,
            name: form.name.trim(),
            slug: form.slug.trim() || createSlug(form.name),
        };

        try {
            if (editingId) {
                await craftService.update(editingId, data);
            } else {
                await craftService.create(data);
            }

            closeForm();
            await loadCrafts();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Không thể lưu nghề thủ công."
            );
        }
    };

    // Đưa dữ liệu nghề lên biểu mẫu chỉnh sửa
    const handleEdit = (craft) => {
        setEditingId(craft._id);

        setForm({
            name: craft.name || "",
            slug: craft.slug || "",
            directoryId: craft.directoryId?._id || craft.directoryId || "",
            villageIds: (craft.villageIds || []).map(
                (village) => village._id || village
            ),
            description: craft.description || "",
            history: craft.history || "",
            materials: craft.materials || [],
            tools: craft.tools || [],
            processSteps: craft.processSteps || [],
            images: craft.images || [],
            sourceReferences: craft.sourceReferences || [],
            isPublished: craft.isPublished || false
        });

        setShowForm(true);
        setError("");
    };

    // Xóa mềm nghề thủ công
    const handleDelete = async (craft) => {
        const confirmed = window.confirm(
            `Bạn có chắc muốn xóa nghề "${craft.name}" không?`
        );

        if (!confirmed) return;

        try {
            await craftService.remove(craft._id);
            await loadCrafts();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Không thể xóa nghề thủ công."
            );
        }
    };

    // Thay đổi trạng thái công khai
    const handleTogglePublished = async (craft) => {
        try {
            await craftService.update(craft._id, {
                isPublished: !craft.isPublished
            });

            await loadCrafts();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Không thể thay đổi trạng thái nghề."
            );
        }
    };

    // Tìm kiếm theo tên nghề
    const filteredCrafts = crafts.filter((craft) =>
        craft.name?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading && crafts.length === 0) {
        return <Loading />;
    }

    return (
        <div className="container page-wrap">

            {/* TIÊU ĐỀ */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: 22
                }}
            >
                <div>
                    <h1 style={{ margin: 0 }}>
                        Quản lý nghề thủ công
                    </h1>

                    <p style={{ margin: "7px 0 0", color: "var(--text-muted)" }}>
                        Quản lý thông tin, danh mục và làng nghề liên quan.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                        setEditingId(null);
                        setForm(emptyCraft);
                        setShowForm(!showForm);
                        setError("");
                    }}
                >
                    <Plus size={17} />
                    {showForm ? "Đóng biểu mẫu" : "Thêm nghề"}
                </button>
            </div>

            {/* TÌM KIẾM */}
            <div className="filter-bar" style={{ marginBottom: 18 }}>
                <label
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flex: 1
                    }}
                >
                    <Search size={17} color="var(--text-muted)" />

                    <input
                        placeholder="Tìm theo tên nghề thủ công..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        style={{
                            width: "100%",
                            padding: 10,
                            border: 0,
                            outline: 0
                        }}
                    />
                </label>
            </div>

            {/* THÔNG BÁO LỖI */}
            {error && (
                <div
                    role="alert"
                    className="alert-error"
                    style={{ marginBottom: 16 }}
                >
                    {error}
                </div>
            )}

            {/* BIỂU MẪU THÊM / SỬA */}
            {showForm && (
                <form
                    onSubmit={handleSave}
                    className="form-card"
                    style={{ marginBottom: 24 }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                    >
                        <h3 style={{ margin: 0 }}>
                            {editingId ? "Cập nhật nghề thủ công" : "Thêm nghề thủ công"}
                        </h3>

                        <button
                            type="button"
                            className="btn-icon"
                            onClick={closeForm}
                            aria-label="Đóng biểu mẫu"
                        >
                            <X size={17} />
                        </button>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 14,
                            marginTop: 14
                        }}
                    >
                        <input
                            required
                            maxLength={150}
                            placeholder="Tên nghề thủ công *"
                            value={form.name}
                            onChange={(event) =>
                                setForm({ ...form, name: event.target.value })
                            }
                        />

                        <input
                            placeholder="Slug (tự tạo nếu để trống)"
                            value={form.slug}
                            onChange={(event) =>
                                setForm({ ...form, slug: event.target.value })
                            }
                        />

                        <select
                            required
                            value={form.directoryId}
                            onChange={(event) =>
                                setForm({ ...form, directoryId: event.target.value })
                            }
                        >
                            <option value="">Chọn danh mục nghề *</option>

                            {directories
                                .filter((directory) => directory.isActive)
                                .map((directory) => (
                                    <option key={directory._id} value={directory._id}>
                                        {directory.name}
                                    </option>
                                ))}
                        </select>

                        <select
                            multiple
                            value={form.villageIds}
                            onChange={(event) => {
                                const selectedIds = Array.from(
                                    event.target.selectedOptions,
                                    (option) => option.value
                                );

                                setForm({ ...form, villageIds: selectedIds });
                            }}
                            style={{ minHeight: 90 }}
                        >
                            {villages.map((village) => (
                                <option key={village._id} value={village._id}>
                                    {village.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                        Giữ Ctrl để chọn nhiều làng nghề trên máy tính.
                    </p>

                    <textarea
                        rows="3"
                        placeholder="Mô tả nghề thủ công"
                        value={form.description}
                        onChange={(event) =>
                            setForm({ ...form, description: event.target.value })
                        }
                    />

                    <textarea
                        rows="3"
                        placeholder="Lịch sử hình thành và phát triển"
                        value={form.history}
                        onChange={(event) =>
                            setForm({ ...form, history: event.target.value })
                        }
                    />

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginTop: 12
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={form.isPublished}
                            onChange={(event) =>
                                setForm({ ...form, isPublished: event.target.checked })
                            }
                        />

                        <label>Cho phép công khai nghề thủ công</label>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 8,
                            marginTop: 16
                        }}
                    >
                        <button
                            type="button"
                            className="btn-outline"
                            onClick={closeForm}
                        >
                            Hủy
                        </button>

                        <button type="submit" className="btn-primary">
                            {editingId ? "Lưu cập nhật" : "Tạo nghề"}
                        </button>
                    </div>
                </form>
            )}

            {/* SỐ LƯỢNG VÀ XÓA BỘ LỌC */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                    color: "var(--text-muted)",
                    fontSize: ".9rem"
                }}
            >
        <span>
          {loading
              ? "Đang cập nhật..."
              : `Tìm thấy ${filteredCrafts.length} nghề thủ công`}
        </span>

                <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setSearch("")}
                >
                    <RotateCcw size={14} />
                    Xóa tìm kiếm
                </button>
            </div>

            {/* BẢNG DANH SÁCH */}
            <div
                className="form-card"
                style={{ padding: 0, overflowX: "auto" }}
            >
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        textAlign: "left"
                    }}
                >
                    <thead>
                    <tr
                        style={{
                            background: "#f5efe9",
                            borderBottom: "1px solid var(--border)"
                        }}
                    >
                        <th style={{ padding: "12px 16px" }}>Tên nghề</th>
                        <th style={{ padding: "12px 16px" }}>Danh mục</th>
                        <th style={{ padding: "12px 16px" }}>Số làng nghề</th>
                        <th style={{ padding: "12px 16px" }}>Trạng thái</th>
                        <th style={{ padding: "12px 16px" }}>Thao tác</th>
                    </tr>
                    </thead>

                    <tbody>
                    {filteredCrafts.map((craft) => (
                        <tr
                            key={craft._id}
                            style={{ borderBottom: "1px solid var(--border)" }}
                        >
                            <td style={{ padding: "12px 16px", fontWeight: 600 }}>
                                {craft.name}
                            </td>

                            <td style={{ padding: "12px 16px" }}>
                                {craft.directoryId?.name || "—"}
                            </td>

                            <td style={{ padding: "12px 16px" }}>
                                {craft.villageIds?.length || 0}
                            </td>

                            <td style={{ padding: "12px 16px" }}>
                                {craft.isPublished ? "Đang công khai" : "Đang ẩn"}
                            </td>

                            <td style={{ padding: "12px 16px" }}>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                        type="button"
                                        className="btn-outline"
                                        onClick={() => handleEdit(craft)}
                                    >
                                        <Pencil size={14} />
                                        Sửa
                                    </button>

                                    <button
                                        type="button"
                                        className="btn-outline"
                                        onClick={() => handleTogglePublished(craft)}
                                    >
                                        {craft.isPublished ? "Ẩn" : "Công khai"}
                                    </button>

                                    <button
                                        type="button"
                                        className="btn-outline"
                                        style={{
                                            color: "#c62828",
                                            borderColor: "#f5c2c7"
                                        }}
                                        onClick={() => handleDelete(craft)}
                                    >
                                        <Trash2 size={14} />
                                        Xóa
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {!loading && filteredCrafts.length === 0 && (
                    <p
                        style={{
                            padding: 24,
                            textAlign: "center",
                            color: "var(--text-muted)"
                        }}
                    >
                        Không tìm thấy nghề thủ công.
                    </p>
                )}
            </div>
        </div>
    );
}
