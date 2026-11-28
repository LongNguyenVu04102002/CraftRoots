import { useEffect, useRef, useState } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    X,
    RotateCcw,
    FolderTree,
    ChevronLeft,
    ChevronRight,
    ImagePlus,
    ImageOff,
    Star
} from "lucide-react";

import { craftService } from "../../services/craftService";
import api from "../../services/api";
import Loading from "../../components/Loading";
import CraftDirectoryModal from "./ManageCraftDirectories";
import { craftDirectoryService } from "../../services/craftDirectoryService";

// API có thể trả về ID hoặc đối tượng đã populate.
const getDirectoryId = (value) => String(value?._id ?? value ?? "");

// Tìm kiếm tên tiếng Việt có hoặc không có dấu.
const normalizeSearch = (value) => String(value ?? "")
    .toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").trim();

// Đồng bộ ô nhập và ô chọn, tính cả padding/border trong chiều rộng cột.
const craftBasicControlStyle = {
    width: "100%",
    minWidth: 0,
    maxWidth: "100%",
    height: 44,
    boxSizing: "border-box",
    padding: "0 14px",
    border: "1px solid var(--border, #e2e8f0)",
    borderRadius: 10,
    backgroundColor: "var(--card-bg, #fff)",
    color: "var(--text, #1f2937)",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 400,
};

// Giữ URL ảnh đã lưu và File mới trong bản nháp; chỉ upload khi lưu nghề.
const MAX_CRAFT_IMAGES = 8;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function craftImageUrl(value) {
    if (typeof value !== "string") return "";
    const url = value.trim();
    if (/^https?:\/\//i.test(url)) return url;
    if (/^\/?uploads\//i.test(url)) {
        const origin = new URL(api.defaults.baseURL, window.location.origin).origin;
        return `${origin}/${url.replace(/^\/+/, "")}`;
    }
    return url.startsWith("/") && !url.startsWith("//") ? url : "";
}

async function uploadCraftImage(file) {
    const body = new FormData();
    body.append("file", file);
    // Dùng API upload ADMIN hiện có; Axios tự tạo multipart boundary.
    const { data } = await api.post("/upload", body, { requiresAuth: true });
    if (typeof data?.url !== "string" || !data.url.trim()) {
        throw new Error("Máy chủ không trả về đường dẫn ảnh.");
    }
    const url = new URL(data.url, new URL(api.defaults.baseURL, window.location.origin));
    if (!url.pathname.startsWith("/uploads/")) {
        throw new Error("Đường dẫn ảnh trả về không hợp lệ.");
    }
    // Lưu đường dẫn tương đối để không gắn cứng localhost vào dữ liệu MongoDB.
    return url.pathname;
}

function CraftImagePreview({ image, index }) {
    const [preview, setPreview] = useState("");
    const [broken, setBroken] = useState(false);
    useEffect(() => {
        setBroken(false);
        if (typeof image === "string") {
            setPreview(craftImageUrl(image));
            return;
        }
        const url = URL.createObjectURL(image);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [image]);
    return (
        <div style={{ aspectRatio: "4 / 3", background: "#f0e7db", position: "relative", display: "grid", placeItems: "center", overflow: "hidden" }}>
            {preview && !broken ? (
                <img src={preview} alt={`Ảnh nghề ${index + 1}`} onError={() => setBroken(true)}
                     style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", position: "absolute", inset: 0 }} />
            ) : <ImageOff size={28} color="#92765e" aria-label="Không có ảnh xem trước" />}
        </div>
    );
}

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
    const [directoryFilter, setDirectoryFilter] = useState("");
    const [villageFilter, setVillageFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [villageSearch, setVillageSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");
    const [craftToDelete, setCraftToDelete] = useState(null);
    const [showDirectoryModal, setShowDirectoryModal] = useState(false);
    const [directoriesLoading, setDirectoriesLoading] = useState(true);
    const [directoryError, setDirectoryError] = useState("");
    const [imageError, setImageError] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveProgress, setSaveProgress] = useState("");
    const savingRef = useRef(false);
    const imageInputRef = useRef(null);

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
    const closeForm = (force = false) => {
        if (savingRef.current && force !== true) return;
        setImageError("");
        setShowForm(false);
        setEditingId(null);
        setForm(emptyCraft);
        setVillageSearch("");
        setError("");
    };

    // Mở biểu mẫu thêm mới
    const handleOpenCreate = () => {
        if (savingRef.current) return;
        setImageError("");
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

    const handleChooseImages = (event) => {
        const files = Array.from(event.target.files || []);
        event.target.value = "";
        if (savingRef.current || !files.length) return;
        const messages = [];
        const valid = [];
        let remaining = Math.max(0, MAX_CRAFT_IMAGES - form.images.length);
        for (const file of files) {
            if (!IMAGE_TYPES.has(file.type)) {
                messages.push(`${file.name}: chỉ chấp nhận JPG, PNG, WEBP hoặc GIF.`);
                continue;
            }
            if (file.size > MAX_IMAGE_BYTES || file.size === 0) {
                messages.push(`${file.name}: dung lượng phải lớn hơn 0 và không quá 5 MB.`);
                continue;
            }
            if (remaining === 0) {
                messages.push(`Chỉ được chọn tối đa ${MAX_CRAFT_IMAGES} ảnh.`);
                break;
            }
            valid.push(file);
            remaining--;
        }
        setImageError(messages.join(" "));
        if (valid.length) setForm(prev => ({ ...prev, images: [...prev.images, ...valid] }));
    };

    const removeImage = (index) => {
        if (savingRef.current) return;
        setImageError("");
        setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const makeCover = (index) => {
        if (savingRef.current || index === 0) return;
        setForm(prev => ({ ...prev, images: [prev.images[index], ...prev.images.filter((_, i) => i !== index)] }));
    };

    const handleSave = async (event) => {
        event.preventDefault();
        if (savingRef.current) return;
        setError("");
        setImageError("");

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

        savingRef.current = true;
        setSaving(true);
        let uploading = false;
        try {
            const images = [...form.images];
            const pending = images.filter(image => typeof image !== "string").length;
            let uploaded = 0;
            for (let index = 0; index < images.length; index++) {
                if (typeof images[index] === "string") continue;
                uploading = true;
                setSaveProgress(`Đang tải ảnh ${uploaded + 1}/${pending}...`);
                const url = await uploadCraftImage(images[index]);
                images[index] = url;
                uploaded++;
                // Khi upload một phần thành công, giữ URL để lần thử lại không upload trùng.
                const snapshot = [...images];
                setForm(prev => ({ ...prev, images: snapshot }));
            }
            uploading = false;
            setSaveProgress("Đang lưu nghề thủ công...");
            data.images = images;
            if (editingId) {
                await craftService.update(editingId, data);
            } else {
                await craftService.create(data);
            }

            closeForm(true);
            await loadCrafts();
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Không thể lưu nghề thủ công.";
            if (uploading) setImageError(`Không thể tải ảnh: ${message}`);
            setError(message);
        } finally {
            savingRef.current = false;
            setSaving(false);
            setSaveProgress("");
        }
    };

    // ==============================
    // 6. ĐƯA DỮ LIỆU LÊN FORM SỬA
    // ==============================

    const handleEdit = (craft) => {
        if (savingRef.current) return;
        setImageError("");
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
            images: Array.isArray(craft.images) ? craft.images.filter(image => typeof image === "string" && image.trim()) : [],
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
        if (savingRef.current) return;
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
        if (savingRef.current) return;
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
    // 9. THỐNG KÊ, BỘ LỌC VÀ PHÂN TRANG
    // ==============================

    const totalCrafts = crafts.length;
    const publishedCount = crafts.filter(craft => Boolean(craft.isPublished)).length;
    const hiddenCount = totalCrafts - publishedCount;

    // Bộ lọc quản trị gồm cả nhóm đã ẩn; khác với danh sách nhóm dùng khi thêm nghề.
    const filterDirectories = [...directories].sort((a, b) =>
        getDirectoryLabel(a).localeCompare(getDirectoryLabel(b), "vi"));
    const filterVillages = [...villages].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "", "vi"));

    // Nếu chọn nhóm chính, lấy cả nghề thuộc các nhóm nhỏ trực thuộc.
    const matchingDirectoryIds = new Set(directoryFilter ? [directoryFilter] : []);
    if (directoryFilter) {
        directories.forEach(item => {
            if (getDirectoryId(item.parentId) === directoryFilter) {
                matchingDirectoryIds.add(getDirectoryId(item._id));
            }
        });
    }

    const keyword = normalizeSearch(search);
    const filteredCrafts = crafts.filter(craft => {
        const matchesSearch = normalizeSearch(craft.name).includes(keyword);
        const matchesDirectory = !directoryFilter || matchingDirectoryIds.has(getDirectoryId(craft.directoryId));
        const matchesVillage = !villageFilter || (craft.villageIds || []).some(village =>
            getDirectoryId(village) === villageFilter);
        const matchesStatus = !statusFilter || (statusFilter === "published"
            ? Boolean(craft.isPublished) : !craft.isPublished);
        return matchesSearch && matchesDirectory && matchesVillage && matchesStatus;
    });

    const totalPages = Math.max(1, Math.ceil(filteredCrafts.length / pageSize));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedCrafts = filteredCrafts.slice(startIndex, startIndex + pageSize);
    const hasFilters = Boolean(search.trim() || directoryFilter || villageFilter || statusFilter);
    const visiblePageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, index) =>
        Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + index);

    // Khi xóa nghề cuối trang, tự trở về trang hợp lệ.
    useEffect(() => {
        if (!loading && page > totalPages) setPage(totalPages);
    }, [page, totalPages, loading]);

    // Nhóm đang lọc đã bị xóa khỏi danh sách sau khi đóng Modal.
    useEffect(() => {
        if (!directoriesLoading && !directoryError && directoryFilter &&
            !directories.some(item => getDirectoryId(item._id) === directoryFilter)) {
            setDirectoryFilter("");
            setPage(1);
        }
    }, [directories, directoriesLoading, directoryError, directoryFilter]);

    const changeFilter = (setter) => (event) => {
        setter(event.target.value);
        setPage(1);
    };

    const resetFilters = () => {
        setSearch("");
        setDirectoryFilter("");
        setVillageFilter("");
        setStatusFilter("");
        setPage(1);
    };

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
                        onClick={() => { if (!savingRef.current) setShowDirectoryModal(true); }}
                        disabled={saving}
                    >
                        <FolderTree size={17} />
                        Quản lý danh mục
                    </button>
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={handleOpenCreate}
                        disabled={saving}
                    >
                        <Plus size={17} />
                        {showForm && !editingId
                            ? "Đóng biểu mẫu"
                            : "Thêm nghề"}
                    </button>
                </div>
            </div>

            {/* THỐNG KÊ TOÀN BỘ NGHỀ THỦ CÔNG */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: 12, marginBottom: 18 }}>
                {[
                    { label: "Tổng số nghề", value: totalCrafts, color: "var(--text, #292018)" },
                    { label: "Đang công khai", value: publishedCount, color: "#166534" },
                    { label: "Chưa công khai", value: hiddenCount, color: "#64748b" },
                ].map(stat => (
                    <div key={stat.label} className="form-card" style={{ margin: 0, padding: "14px 18px", minWidth: 0, boxSizing: "border-box" }}>
                        <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{stat.label}</div>
                        <div style={{ marginTop: 5, fontSize: 26, fontWeight: 700, color: stat.color }}>
                            {loading ? "…" : stat.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* TÌM KIẾM VÀ BỘ LỌC */}
            <div className="form-card" style={{ padding: 14, marginBottom: 18, minWidth: 0 }}>
                <label htmlFor="craft-search" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, minWidth: 0 }}>
                    <Search size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                    <input id="craft-search" aria-label="Tìm theo tên nghề thủ công" placeholder="Tìm theo tên nghề thủ công..."
                           value={search} onChange={changeFilter(setSearch)} style={craftBasicControlStyle} />
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))", gap: 10, alignItems: "end" }}>
                    <div style={{ minWidth: 0 }}>
                        <label htmlFor="craft-filter-directory" style={{ display: "block", fontSize: 13, marginBottom: 5 }}>Nhóm nghề</label>
                        <select id="craft-filter-directory" value={directoryFilter} onChange={changeFilter(setDirectoryFilter)}
                                style={craftBasicControlStyle} disabled={directoriesLoading || Boolean(directoryError)}>
                            <option value="">Tất cả nhóm nghề</option>
                            {filterDirectories.map(item => (
                                <option key={item._id} value={getDirectoryId(item._id)}>
                                    {getDirectoryLabel(item)}{item.isActive ? "" : " (Đã ẩn)"}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <label htmlFor="craft-filter-village" style={{ display: "block", fontSize: 13, marginBottom: 5 }}>Làng nghề</label>
                        <select id="craft-filter-village" value={villageFilter} onChange={changeFilter(setVillageFilter)} style={craftBasicControlStyle}>
                            <option value="">Tất cả làng nghề</option>
                            {filterVillages.map(item => <option key={item._id} value={getDirectoryId(item._id)}>{item.name}</option>)}
                        </select>
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <label htmlFor="craft-filter-status" style={{ display: "block", fontSize: 13, marginBottom: 5 }}>Trạng thái</label>
                        <select id="craft-filter-status" value={statusFilter} onChange={changeFilter(setStatusFilter)} style={craftBasicControlStyle}>
                            <option value="">Tất cả trạng thái</option>
                            <option value="published">Đang công khai</option>
                            <option value="hidden">Chưa công khai</option>
                        </select>
                    </div>
                    <button type="button" className="btn-outline" onClick={resetFilters} disabled={!hasFilters}
                            style={{ height: 44, minWidth: 0, maxWidth: "100%", boxSizing: "border-box", justifyContent: "center" }}>
                        <RotateCcw size={15} /> Đặt lại bộ lọc
                    </button>
                </div>
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
                    <fieldset disabled={saving} style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
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
                                    "repeat(auto-fit, minmax(min(240px, 100%), 1fr))",
                                alignItems: "start",
                                minWidth: 0,
                                gap: 14,
                                marginTop: 14
                            }}
                        >
                            {/* TÊN NGHỀ */}
                            <label style={{ display: "grid", gap: 6, minWidth: 0, fontWeight: 600 }}>
                                Tên nghề thủ công *
                                <input
                                    style={craftBasicControlStyle}
                                    required
                                    maxLength={150}
                                    placeholder="Nhập tên nghề thủ công..."
                                    value={form.name}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            name: event.target.value
                                        })
                                    }
                                />
                            </label>

                            {/* SLUG */}
                            <label style={{ display: "grid", gap: 6, minWidth: 0, fontWeight: 600 }}>
                                Đường dẫn (tự động nếu để trống)
                                <input
                                    style={craftBasicControlStyle}
                                    placeholder="Tự động tạo từ tên nghề"
                                    value={form.slug}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            slug: event.target.value
                                        })
                                    }
                                />
                            </label>

                            {/* NHÓM NGHỀ - có thể mở quản lý ngay từ biểu mẫu */}
                            <div style={{ display: "grid", gap: 6, minWidth: 0 }}>
                                <label htmlFor="craft-directory-select" style={{ fontWeight: 600 }}>
                                    Nhóm nghề *
                                </label>
                                <select
                                    id="craft-directory-select"
                                    style={{ ...craftBasicControlStyle, paddingRight: 32, cursor: "pointer" }}
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
                                        onClick={() => { if (!savingRef.current) setShowDirectoryModal(true); }}
                                        disabled={saving}
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

                        {/* HÌNH ẢNH NGHỀ THỦ CÔNG */}
                        <section aria-labelledby="craft-image-heading" style={{ marginTop: 16, border: "1px solid var(--border, #e5d5c5)", borderRadius: 12, padding: 16, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                                <h4 id="craft-image-heading" style={{ margin: 0 }}>Hình ảnh nghề thủ công</h4>
                                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{form.images.length}/{MAX_CRAFT_IMAGES} ảnh</span>
                            </div>
                            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "6px 0 14px" }}>Ảnh đại diện sẽ hiển thị trên danh sách nghề. Chọn nhiều ảnh JPG, PNG, WEBP hoặc GIF, tối đa 5 MB/ảnh.</p>
                            <input ref={imageInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif"
                                   aria-label="Chọn hình ảnh nghề thủ công" onChange={handleChooseImages} hidden />
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 168px), 1fr))", gap: 12, alignItems: "stretch" }}>
                                {form.images.map((image, index) => (
                                    <div key={index} style={{ minWidth: 0, border: "1px solid var(--border, #e5d5c5)", borderRadius: 10, overflow: "hidden", background: "var(--card-bg, #fff)" }}>
                                        <CraftImagePreview image={image} index={index} />
                                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, padding: 8, justifyContent: "space-between" }}>
                                            {index === 0 ? (
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#98612b", fontSize: 12, fontWeight: 600 }}><Star size={14} fill="currentColor" /> Ảnh đại diện</span>
                                            ) : (
                                                <button type="button" className="btn-outline" onClick={() => makeCover(index)} style={{ fontSize: 12, padding: "5px 8px" }}><Star size={13} /> Đặt đại diện</button>
                                            )}
                                            <button type="button" className="btn-icon" aria-label={`Bỏ ảnh ${index + 1}`} title="Bỏ ảnh" onClick={() => removeImage(index)} style={{ color: "#b42318" }}><Trash2 size={15} /></button>
                                        </div>
                                    </div>
                                ))}
                                {form.images.length < MAX_CRAFT_IMAGES && (
                                    <button type="button" onClick={() => imageInputRef.current?.click()}
                                            style={{ minHeight: 150, minWidth: 0, padding: 12, display: "grid", placeContent: "center", justifyItems: "center", gap: 8, cursor: "pointer", background: "#faf6f0", border: "1px dashed #cbb29b", borderRadius: 10, color: "#8e472b", font: "inherit" }}>
                                        <ImagePlus size={28} /><strong style={{ fontSize: 14 }}>Thêm hình ảnh</strong><span style={{ fontSize: 12, color: "var(--text-muted)" }}>Chọn ảnh từ máy</span>
                                    </button>
                                )}
                            </div>
                            {imageError && <p role="alert" style={{ color: "#b42318", fontSize: 13, marginBottom: 0 }}>{imageError}</p>}
                            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "12px 0 0" }}>Ảnh mới được tải lên máy chủ khi bạn lưu biểu mẫu. Bỏ ảnh sẽ cập nhật danh sách ảnh khi lưu.</p>
                        </section>

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
                                disabled={saving || directoriesLoading || Boolean(directoryError) || unavailableDirectory}
                            >
                                {saving ? "Đang lưu..." : editingId
                                    ? "Lưu cập nhật"
                                    : "Tạo nghề"}
                            </button>
                        </div>
                    </fieldset>
                    {saving && <p role="status" style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "right", marginBottom: 0 }}>{saveProgress}</p>}
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
                        : `Tìm thấy ${filteredCrafts.length} / ${totalCrafts} nghề thủ công`}
                </span>

                <button
                    type="button"
                    className="btn-outline"
                    onClick={loadCrafts}
                    disabled={loading}
                >
                    <RotateCcw size={14} />
                    Tải lại danh sách
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
                        <th scope="col" style={{ padding: "12px 16px", width: 116 }}>
                            Hình ảnh
                        </th>

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
                    {paginatedCrafts.map((craft) => (
                        <tr
                            key={craft._id}
                            style={{
                                borderBottom: "1px solid var(--border)"
                            }}
                        >
                            <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                                <div style={{ width: 84 }}>
                                    <div style={{ borderRadius: 9, overflow: "hidden", border: "1px solid var(--border, #e5d5c5)" }}>
                                        <CraftImagePreview image={Array.isArray(craft.images) ? (craft.images.find(image => typeof image === "string" && image.trim()) || "") : ""} index={0} />
                                    </div>
                                    <span style={{ display: "block", marginTop: 5, fontSize: 11, textAlign: "center", color: "var(--text-muted, #786557)" }}>
                                        {Array.isArray(craft.images) && craft.images.filter(image => typeof image === "string" && image.trim()).length > 0
                                            ? `${craft.images.filter(image => typeof image === "string" && image.trim()).length} ảnh`
                                            : "Chưa có ảnh"}
                                    </span>
                                </div>
                            </td>

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
                                        disabled={saving}
                                    >
                                        <Pencil size={14} />
                                        Sửa
                                    </button>

                                    {/* ẨN / CÔNG KHAI */}
                                    <button
                                        type="button"
                                        className="btn-outline"
                                        disabled={saving}
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
                                        disabled={saving}
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
                        {hasFilters ? "Không tìm thấy nghề thủ công phù hợp với bộ lọc." : "Chưa có nghề thủ công nào."}
                    </p>
                )}
            </div>

            {/* PHÂN TRANG DANH SÁCH NGHỀ */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginTop: 14, marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", color: "var(--text-muted)", fontSize: 13 }}>
                    <span aria-live="polite">{filteredCrafts.length
                        ? `Hiển thị ${startIndex + 1}–${Math.min(startIndex + pageSize, filteredCrafts.length)} / ${filteredCrafts.length} nghề`
                        : "Hiển thị 0 nghề"}</span>
                    <label htmlFor="craft-page-size">Số nghề/trang</label>
                    <select id="craft-page-size" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }}
                            style={{ ...craftBasicControlStyle, width: 76, height: 36, padding: "0 8px" }}>
                        {[10, 20, 50].map(size => <option key={size} value={size}>{size}</option>)}
                    </select>
                </div>
                {filteredCrafts.length > 0 && (
                    <nav aria-label="Phân trang nghề thủ công" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                        <button type="button" className="btn-outline" aria-label="Trang trước" disabled={currentPage === 1}
                                onClick={() => setPage(currentPage - 1)}><ChevronLeft size={16} /></button>
                        {visiblePageNumbers[0] > 1 && (
                            <>
                                <button type="button" className="btn-outline" onClick={() => setPage(1)}>1</button>
                                {visiblePageNumbers[0] > 2 && <span>…</span>}
                            </>
                        )}
                        {visiblePageNumbers.map(number => (
                            <button key={number} type="button" className={number === currentPage ? "btn-primary" : "btn-outline"}
                                    aria-current={number === currentPage ? "page" : undefined} aria-label={`Trang ${number}`}
                                    onClick={() => setPage(number)}>{number}</button>
                        ))}
                        {visiblePageNumbers[visiblePageNumbers.length - 1] < totalPages && (
                            <>
                                {visiblePageNumbers[visiblePageNumbers.length - 1] < totalPages - 1 && <span>…</span>}
                                <button type="button" className="btn-outline" onClick={() => setPage(totalPages)}>{totalPages}</button>
                            </>
                        )}
                        <button type="button" className="btn-outline" aria-label="Trang tiếp theo" disabled={currentPage === totalPages}
                                onClick={() => setPage(currentPage + 1)}><ChevronRight size={16} /></button>
                    </nav>
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
