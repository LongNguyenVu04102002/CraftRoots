import { useEffect, useState } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    X,
    RotateCcw,
    FolderTree
} from "lucide-react";

import { craftService } from "../../services/craftService";
import Loading from "../../components/Loading";
import CraftDirectoryModal from "./ManageCraftDirectories";
import { craftDirectoryService } from "../../services/craftDirectoryService";

// API có thể trả về ID hoặc đối tượng đã populate.
const getDirectoryId = (value) => String(value?._id ?? value ?? "");

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
    // ==============================
    // 1. KHAI BÁO STATE
    // ==============================

    const [crafts, setCrafts] = useState([]);
    const [directories, setDirectories] = useState([]);
    const [villages, setVillages] = useState([]);

    const [form, setForm] = useState(emptyCraft);
    const [editingId, setEditingId] = useState(null);

    const [search, setSearch] = useState("");
    const [villageSearch, setVillageSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");
    const [craftToDelete, setCraftToDelete] = useState(null);
    const [showDirectoryModal, setShowDirectoryModal] = useState(false);
    const [directoriesLoading, setDirectoriesLoading] = useState(true);
    const [directoryError, setDirectoryError] = useState("");

    // ==============================
    // 2. TẢI DỮ LIỆU
    // ==============================

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

    // Tải lại danh mục riêng, không đặt lại biểu mẫu nghề đang nhập.
    const loadDirectories = async () => {
        setDirectoriesLoading(true);
        setDirectoryError("");
        try {
            const data = await craftDirectoryService.getAll();
            if (!Array.isArray(data)) throw new Error("Dữ liệu không hợp lệ");
            setDirectories(data);
        } catch (err) {
            setDirectoryError(err.response?.data?.message ||
                "Không tải được nhóm nghề. Vui lòng thử tải lại.");
        } finally {
            setDirectoriesLoading(false);
        }
    };

    // Tải danh mục và làng nghề độc lập để tránh mất dữ liệu nếu một API lỗi.
    const loadRelatedData = async () => {
        await Promise.all([
            loadDirectories(),
            (async () => {
                try {
                    const data = await craftService.getVillages();
                    setVillages(Array.isArray(data) ? data : []);
                } catch (err) {
                    setError(err.response?.data?.message ||
                        "Không tải được danh sách làng nghề.");
                }
            })()
        ]);
    };

    // Đóng Modal và đồng bộ danh mục. Không gọi closeForm hoặc loadCrafts.
    const closeDirectoryModal = () => {
        setShowDirectoryModal(false);
        void loadDirectories();
    };

    // Chạy khi trang được mở
    useEffect(() => {
        loadCrafts();
        loadRelatedData();
    }, []);

    // ==============================
    // 3. XỬ LÝ BIỂU MẪU
    // ==============================

    // Đóng và làm mới biểu mẫu
    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyCraft);
        setVillageSearch("");
        setError("");
    };

    // Mở biểu mẫu thêm mới
    const handleOpenCreate = () => {
        if (showForm && !editingId) {
            closeForm();
            return;
        }

        setEditingId(null);
        setForm({ ...emptyCraft });
        setVillageSearch("");
        setShowForm(true);
        setError("");
    };

    // Tạo slug từ tên nghề
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

    // ==============================
    // 4. XỬ LÝ CHỌN LÀNG NGHỀ
    // ==============================

    // Chọn hoặc bỏ chọn một làng nghề
    const toggleVillage = (villageId) => {
        setForm((prev) => {
            const isSelected = prev.villageIds.includes(villageId);

            return {
                ...prev,
                villageIds: isSelected
                    ? prev.villageIds.filter((id) => id !== villageId)
                    : [...prev.villageIds, villageId]
            };
        });
    };

    // Tìm kiếm làng nghề
    const filteredVillages = villages.filter((village) =>
        village.name
            ?.toLowerCase()
            .includes(villageSearch.trim().toLowerCase())
    );

    // Lấy thông tin các làng nghề đã chọn
    const selectedVillages = villages.filter((village) =>
        form.villageIds.includes(village._id)
    );

    // ==============================
    // 5. THÊM VÀ CẬP NHẬT NGHỀ
    // ==============================

    // Nhóm nghề chính / nhóm nhỏ. Chỉ cho chọn nhóm đang hoạt động.
    const directoryById = new Map(directories.map(item => [getDirectoryId(item._id), item]));
    const getDirectoryLabel = (item) => {
        const parent = directoryById.get(getDirectoryId(item.parentId));
        return parent ? `${parent.name} › ${item.name}` : item.name;
    };
    const directoryOptions = directories.filter(item => {
        const parentId = getDirectoryId(item.parentId);
        const parent = directoryById.get(parentId);
        return item.isActive && (!parentId || (parent?.isActive && !parent.parentId));
    }).sort((a, b) => {
        const aRoot = directoryById.get(getDirectoryId(a.parentId)) || a;
        const bRoot = directoryById.get(getDirectoryId(b.parentId)) || b;
        return (aRoot.sortOrder ?? 0) - (bRoot.sortOrder ?? 0) ||
            aRoot.name.localeCompare(bRoot.name, "vi") ||
            Number(Boolean(a.parentId)) - Number(Boolean(b.parentId)) ||
            (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name, "vi");
    });
    const selectedDirectoryId = getDirectoryId(form.directoryId);
    const selectedDirectory = directoryById.get(selectedDirectoryId);
    const unavailableDirectory = Boolean(selectedDirectoryId) &&
        !directoryOptions.some(item => getDirectoryId(item._id) === selectedDirectoryId);

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

        if (directoriesLoading || directoryError) {
            setError("Vui lòng tải lại danh sách nhóm nghề trước khi lưu.");
            return;
        }

        if (unavailableDirectory) {
            setError("Nhóm nghề đã chọn không còn khả dụng. Vui lòng chọn nhóm nghề khác.");
            return;
        }

        const data = {
            ...form,
            name: form.name.trim(),
            slug: form.slug.trim() || createSlug(form.name)
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

    // ==============================
    // 6. ĐƯA DỮ LIỆU LÊN FORM SỬA
    // ==============================

    const handleEdit = (craft) => {
        setEditingId(craft._id);

        setForm({
            name: craft.name || "",
            slug: craft.slug || "",
            directoryId:
                craft.directoryId?._id ||
                craft.directoryId ||
                "",

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

        setVillageSearch("");
        setShowForm(true);
        setError("");
    };

    // ==============================
    // 7. XÓA NGHỀ THỦ CÔNG
    // ==============================

    // Mở hộp thoại xác nhận xóa
    const handleDelete = (craft) => {
        setCraftToDelete(craft);
    };

    // Thực hiện xóa sau khi người dùng xác nhận
    const confirmDelete = async () => {
        if (!craftToDelete) return;

        try {
            await craftService.remove(craftToDelete._id);

            // Đóng hộp thoại xác nhận
            setCraftToDelete(null);

            // Tải lại danh sách sau khi xóa
            await loadCrafts();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Không thể xóa nghề thủ công."
            );
            setCraftToDelete(null);
        }
    };

    // ==============================
    // 8. ẨN / CÔNG KHAI NGHỀ
    // ==============================

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

    // ==============================
    // 9. TÌM KIẾM NGHỀ THỦ CÔNG
    // ==============================

    const filteredCrafts = crafts.filter((craft) =>
        craft.name
            ?.toLowerCase()
            .includes(search.trim().toLowerCase())
    );

    // Hiển thị loading
    if (loading && crafts.length === 0) {
        return <Loading />;
    }

    // ==============================
    // 10. GIAO DIỆN
    // ==============================

    return (
        <div className="container page-wrap">

            {/* TIÊU ĐỀ */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                    flexWrap: "wrap",
                    marginBottom: 22
                }}
            >
                <div>
                    <h1 style={{ margin: 0 }}>
                        Quản lý nghề thủ công
                    </h1>

                    <p
                        style={{
                            margin: "7px 0 0",
                            color: "var(--text-muted)"
                        }}
                    >
                        Quản lý thông tin, danh mục và làng nghề liên quan.
                    </p>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                        type="button"
                        className="btn-outline"
                        onClick={() => setShowDirectoryModal(true)}
                    >
                        <FolderTree size={17} />
                        Quản lý danh mục
                    </button>
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={handleOpenCreate}
                    >
                        <Plus size={17} />
                        {showForm && !editingId
                            ? "Đóng biểu mẫu"
                            : "Thêm nghề"}
                    </button>
                </div>
            </div>

            {/* TÌM KIẾM NGHỀ */}
            <div
                className="filter-bar"
                style={{ marginBottom: 18 }}
            >
                <label
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flex: 1
                    }}
                >
                    <Search
                        size={17}
                        color="var(--text-muted)"
                    />

                    <input
                        placeholder="Tìm theo tên nghề thủ công..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        style={{
                            width: "100%",
                            padding: 10,
                            border: 0,
                            outline: 0
                        }}
                    />
                </label>
            </div>

            {directoryError && (
                <div role="alert" className="alert-error" style={{ marginBottom: 16 }}>
                    {directoryError}{" "}
                    <button type="button" className="btn-outline" onClick={loadDirectories}
                            disabled={directoriesLoading}>
                        <RotateCcw size={15} /> Tải lại nhóm nghề
                    </button>
                </div>
            )}

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

            {/* ==========================
                FORM THÊM / SỬA
            ========================== */}

            {showForm && (
                <form
                    onSubmit={handleSave}
                    className="form-card"
                    style={{ marginBottom: 24 }}
                >
                    {/* TIÊU ĐỀ FORM */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                    >
                        <h3 style={{ margin: 0 }}>
                            {editingId
                                ? "Cập nhật nghề thủ công"
                                : "Thêm nghề thủ công"}
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

                    {/* THÔNG TIN CƠ BẢN */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: 14,
                            marginTop: 14
                        }}
                    >
                        {/* TÊN NGHỀ */}
                        <input
                            required
                            maxLength={150}
                            placeholder="Tên nghề thủ công *"
                            value={form.name}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    name: event.target.value
                                })
                            }
                        />

                        {/* SLUG */}
                        <input
                            placeholder="Slug (tự tạo nếu để trống)"
                            value={form.slug}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    slug: event.target.value
                                })
                            }
                        />

                        {/* NHÓM NGHỀ - có thể mở quản lý ngay từ biểu mẫu */}
                        <div style={{ display: "grid", gap: 6, minWidth: 0 }}>
                            <label htmlFor="craft-directory-select" style={{ fontWeight: 600 }}>
                                Nhóm nghề *
                            </label>
                            <select
                                id="craft-directory-select"
                                required
                                disabled={directoriesLoading || Boolean(directoryError)}
                                value={selectedDirectoryId}
                                onChange={(event) => {
                                    setForm(prev => ({ ...prev, directoryId: event.target.value }));
                                    setError("");
                                }}
                            >
                                <option value="">{directoriesLoading ? "Đang tải nhóm nghề..." : "Chọn nhóm nghề"}</option>
                                {unavailableDirectory && (
                                    <option value={selectedDirectoryId} disabled>
                                        {selectedDirectory ? getDirectoryLabel(selectedDirectory) : "Nhóm đã chọn"} (không còn khả dụng)
                                    </option>
                                )}
                                {directoryOptions.map(item => (
                                    <option key={item._id} value={item._id}>
                                        {getDirectoryLabel(item)}
                                    </option>
                                ))}
                            </select>
                            {unavailableDirectory && !directoriesLoading && !directoryError && (
                                <small role="status" style={{ color: "#b45309" }}>
                                    Nhóm đã chọn không còn khả dụng. Hãy chọn nhóm khác hoặc khôi phục nhóm cũ trước khi lưu.
                                </small>
                            )}
                            <button type="button" className="btn-outline"
                                    onClick={() => setShowDirectoryModal(true)}
                                    style={{ justifySelf: "start", fontSize: 13 }}>
                                <FolderTree size={15} /> Quản lý nhóm nghề
                            </button>
                        </div>
                    </div>

                    {/* ==========================
                        CHỌN NHIỀU LÀNG NGHỀ
                    ========================== */}

                    <div
                        style={{
                            marginTop: 18,
                            border: "1px solid var(--border)",
                            borderRadius: 10,
                            padding: 14
                        }}
                    >
                        <label
                            style={{
                                fontWeight: 600,
                                display: "block",
                                marginBottom: 10
                            }}
                        >
                            Làng nghề liên quan
                        </label>

                        {/* Ô TÌM KIẾM LÀNG NGHỀ */}
                        <div
                            style={{
                                position: "relative",
                                marginBottom: 12
                            }}
                        >
                            <Search
                                size={17}
                                color="var(--text-muted)"
                                style={{
                                    position: "absolute",
                                    left: 10,
                                    top: 11
                                }}
                            />

                            <input
                                type="text"
                                placeholder="Tìm kiếm làng nghề..."
                                value={villageSearch}
                                onChange={(event) =>
                                    setVillageSearch(event.target.value)
                                }
                                style={{
                                    width: "100%",
                                    padding: "10px 10px 10px 36px",
                                    boxSizing: "border-box"
                                }}
                            />
                        </div>

                        {/* SỐ LƯỢNG ĐÃ CHỌN */}
                        <p
                            style={{
                                fontSize: 13,
                                color: "var(--text-muted)",
                                margin: "0 0 8px"
                            }}
                        >
                            Đã chọn {form.villageIds.length} làng nghề
                        </p>

                        {/* DANH SÁCH LÀNG NGHỀ */}
                        <div
                            style={{
                                maxHeight: 180,
                                overflowY: "auto",
                                border: "1px solid var(--border)",
                                borderRadius: 8,
                                padding: 8
                            }}
                        >
                            {filteredVillages.length > 0 ? (
                                filteredVillages.map((village) => {
                                    const checked =
                                        form.villageIds.includes(village._id);

                                    return (
                                        <label
                                            key={village._id}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 10,
                                                padding: "9px 6px",
                                                cursor: "pointer",
                                                borderBottom:
                                                    "1px solid var(--border)"
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() =>
                                                    toggleVillage(village._id)
                                                }
                                            />

                                            <span>{village.name}</span>
                                        </label>
                                    );
                                })
                            ) : (
                                <p
                                    style={{
                                        textAlign: "center",
                                        color: "var(--text-muted)",
                                        fontSize: 13,
                                        padding: 10
                                    }}
                                >
                                    Không tìm thấy làng nghề.
                                </p>
                            )}
                        </div>

                        {/* CÁC LÀNG NGHỀ ĐÃ CHỌN */}
                        <div style={{ marginTop: 14 }}>
                            <p
                                style={{
                                    fontWeight: 600,
                                    fontSize: 13,
                                    marginBottom: 8
                                }}
                            >
                                Làng nghề đã chọn:
                            </p>

                            <div
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 8
                                }}
                            >
                                {selectedVillages.length > 0 ? (
                                    selectedVillages.map((village) => (
                                        <span
                                            key={village._id}
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 6,
                                                padding: "6px 10px",
                                                borderRadius: 20,
                                                background:
                                                    "var(--bg-secondary, #f1f1f1)",
                                                fontSize: 13
                                            }}
                                        >
                                            {village.name}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleVillage(village._id)
                                                }
                                                title="Bỏ chọn làng nghề"
                                                style={{
                                                    border: 0,
                                                    background: "transparent",
                                                    cursor: "pointer",
                                                    padding: 0,
                                                    display: "flex",
                                                    alignItems: "center"
                                                }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))
                                ) : (
                                    <span
                                        style={{
                                            color: "var(--text-muted)",
                                            fontSize: 13
                                        }}
                                    >
                                        Chưa chọn làng nghề nào.
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* MÔ TẢ NGHỀ */}
                    <textarea
                        rows="3"
                        placeholder="Mô tả nghề thủ công"
                        value={form.description}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                description: event.target.value
                            })
                        }
                        style={{
                            width: "100%",
                            marginTop: 16,
                            boxSizing: "border-box"
                        }}
                    />

                    {/* LỊCH SỬ NGHỀ */}
                    <textarea
                        rows="3"
                        placeholder="Lịch sử hình thành và phát triển"
                        value={form.history}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                history: event.target.value
                            })
                        }
                        style={{
                            width: "100%",
                            marginTop: 12,
                            boxSizing: "border-box"
                        }}
                    />

                    {/* TRẠNG THÁI CÔNG KHAI */}
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
                                setForm({
                                    ...form,
                                    isPublished: event.target.checked
                                })
                            }
                        />

                        <label>
                            Cho phép công khai nghề thủ công
                        </label>
                    </div>

                    {/* NÚT LƯU / HỦY */}
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

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={directoriesLoading || Boolean(directoryError) || unavailableDirectory}
                        >
                            {editingId
                                ? "Lưu cập nhật"
                                : "Tạo nghề"}
                        </button>
                    </div>
                </form>
            )}

            {/* ==========================
                SỐ LƯỢNG VÀ XÓA BỘ LỌC
            ========================== */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
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

            {/* ==========================
                BẢNG DANH SÁCH NGHỀ
            ========================== */}

            <div
                className="form-card"
                style={{
                    padding: 0,
                    overflowX: "auto"
                }}
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
                        <th style={{ padding: "12px 16px" }}>
                            Tên nghề
                        </th>

                        <th style={{ padding: "12px 16px" }}>
                            Danh mục
                        </th>

                        <th style={{ padding: "12px 16px" }}>
                            Số làng nghề
                        </th>

                        <th style={{ padding: "12px 16px" }}>
                            Trạng thái
                        </th>

                        <th style={{ padding: "12px 16px" }}>
                            Thao tác
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                    {filteredCrafts.map((craft) => (
                        <tr
                            key={craft._id}
                            style={{
                                borderBottom: "1px solid var(--border)"
                            }}
                        >
                            <td
                                style={{
                                    padding: "12px 16px",
                                    fontWeight: 600
                                }}
                            >
                                {craft.name}
                            </td>

                            <td style={{ padding: "12px 16px" }}>
                                {(() => {
                                    const directory = directoryById.get(getDirectoryId(craft.directoryId));
                                    return directory ? getDirectoryLabel(directory) : craft.directoryId?.name || "—";
                                })()}
                            </td>

                            <td style={{ padding: "12px 16px" }}>
                                {craft.villageIds?.length || 0}
                            </td>

                            <td style={{ padding: "12px 16px" }}>
                                {craft.isPublished
                                    ? "Đang công khai"
                                    : "Đang ẩn"}
                            </td>

                            <td style={{ padding: "12px 16px" }}>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 8
                                    }}
                                >
                                    {/* SỬA */}
                                    <button
                                        type="button"
                                        className="btn-outline"
                                        onClick={() => handleEdit(craft)}
                                    >
                                        <Pencil size={14} />
                                        Sửa
                                    </button>

                                    {/* ẨN / CÔNG KHAI */}
                                    <button
                                        type="button"
                                        className="btn-outline"
                                        onClick={() =>
                                            handleTogglePublished(craft)
                                        }
                                    >
                                        {craft.isPublished
                                            ? "Ẩn"
                                            : "Công khai"}
                                    </button>

                                    {/* XÓA */}
                                    <button
                                        type="button"
                                        className="btn-outline"
                                        style={{
                                            color: "#c62828",
                                            borderColor: "#f5c2c7"
                                        }}
                                        onClick={() =>
                                            handleDelete(craft)
                                        }
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

                {/* KHÔNG CÓ DỮ LIỆU */}
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

            {/* Quản lý danh mục trong cùng trang, không làm mất dữ liệu form. */}
            {showDirectoryModal && (
                <CraftDirectoryModal onClose={closeDirectoryModal} />
            )}

            {/* ==========================
                HỘP THOẠI XÁC NHẬN XÓA
            ========================== */}
            {craftToDelete && (
                <div
                    onClick={() => setCraftToDelete(null)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 20,
                        background: "rgba(15, 23, 42, 0.55)",
                        backdropFilter: "blur(3px)"
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-dialog-title"
                        onClick={(event) => event.stopPropagation()}
                        style={{
                            width: "100%",
                            maxWidth: 430,
                            padding: 28,
                            borderRadius: 16,
                            background: "var(--card-bg, #ffffff)",
                            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.22)",
                            textAlign: "center",
                            animation: "deleteModalIn 0.18s ease-out"
                        }}
                    >
                        <div
                            style={{
                                width: 64,
                                height: 64,
                                margin: "0 auto 18px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "50%",
                                color: "#dc2626",
                                background: "#fee2e2"
                            }}
                        >
                            <Trash2 size={29} />
                        </div>

                        <h2
                            id="delete-dialog-title"
                            style={{
                                margin: "0 0 10px",
                                fontSize: 21,
                                color: "var(--text, #1f2937)"
                            }}
                        >
                            Xác nhận xóa nghề thủ công?
                        </h2>

                        <p
                            style={{
                                margin: "0 0 8px",
                                color: "var(--text-muted, #6b7280)",
                                lineHeight: 1.6
                            }}
                        >
                            Bạn có chắc chắn muốn xóa nghề:
                        </p>

                        <p
                            style={{
                                margin: "0 0 12px",
                                color: "var(--text, #1f2937)",
                                fontWeight: 700,
                                overflowWrap: "anywhere"
                            }}
                        >
                            “{craftToDelete.name}”
                        </p>

                        <p
                            style={{
                                margin: "0 0 24px",
                                color: "var(--text-muted, #9ca3af)",
                                fontSize: 13,
                                lineHeight: 1.5
                            }}
                        >
                            Hãy kiểm tra kỹ trước khi xác nhận thao tác này.
                        </p>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                gap: 10
                            }}
                        >
                            <button
                                type="button"
                                className="btn-outline"
                                onClick={() => setCraftToDelete(null)}
                                style={{
                                    flex: 1,
                                    justifyContent: "center",
                                    padding: "11px 14px"
                                }}
                            >
                                Hủy
                            </button>

                            <button
                                type="button"
                                onClick={confirmDelete}
                                style={{
                                    flex: 1,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 7,
                                    padding: "11px 14px",
                                    border: "1px solid #dc2626",
                                    borderRadius: 8,
                                    background: "#dc2626",
                                    color: "#ffffff",
                                    fontWeight: 600,
                                    cursor: "pointer"
                                }}
                            >
                                <Trash2 size={15} />
                                Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
