// TRANG DANH SÁCH NGHỀ THỦ CÔNG CÔNG KHAI
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, RotateCcw, MapPin, ArrowRight, ChevronLeft, ChevronRight, ImageOff, ChevronDown, X, SlidersHorizontal, Layers3, Compass, LayoutGrid } from "lucide-react";
import { craftService } from "../../services/craftService";
import { villageService } from "../../services/villageService";
import Loading from "../../components/Loading";

const PAGE_SIZE = 9;
const API_ORIGIN = "http://localhost:5000"; // Cùng địa chỉ backend trong services/api.js
const idOf = (value) => String(value?._id ?? value ?? "");
const listOf = (value) => Array.isArray(value) ? value : [];
const normalize = (value) => String(value ?? "").normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLowerCase().trim();
const byName = (a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""), "vi");
const sortDirectory = (a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0) || byName(a, b);

function imageUrl(value) {
    if (typeof value !== "string" || !value.trim()) return "";
    const url = value.trim();
    if (/^https?:\/\//i.test(url)) return url;
    if (/^\/uploads\//i.test(url) || /^uploads\//i.test(url)) {
        return `${API_ORIGIN}/${url.replace(/^\/+/, "")}`;
    }
    return url.startsWith("/") && !url.startsWith("//") ? url : "";
}


/* CSS riêng cho trang khám phá nghề, không ảnh hưởng CSS chung của dự án. */
const craftDiscoveryStyles = `
.cr-discovery { --cr-accent: var(--primary, #a84b2b); --cr-ink: var(--text-dark, #261810); --cr-muted: var(--text-muted, #6e5747); --cr-border: var(--border, #e7dcd1); }
.cr-discovery .cr-intro { min-width: 0; margin: 0; padding: 0; }
.cr-discovery .cr-intro h1 { margin: 0 0 8px; color: var(--cr-ink); font-family: inherit; font-weight: 700; font-size: clamp(1.65rem, 3vw, 2.25rem); line-height: 1.3; letter-spacing: normal; }
.cr-discovery .cr-intro p { margin: 0; color: var(--cr-muted); line-height: 1.6; font-size: .97rem; }
.cr-discovery .cr-search { display: flex; align-items: center; gap: 12px; width: 100%; max-width: 680px; min-width: 0; min-height: 54px; margin: 22px 0 0; padding: 5px 9px 5px 18px; border-radius: 999px; background: #fff; color: var(--cr-muted); box-shadow: 0 2px 8px #24100808; border: 1px solid var(--cr-border); box-sizing: border-box; }
.cr-discovery .cr-search:focus-within { border-color: #d8a373; }
.cr-discovery .cr-search > svg { flex-shrink: 0; color: var(--cr-accent); }
.cr-discovery .cr-search input { flex: 1 1 0; width: 0; min-width: 0; height: 42px; margin: 0; padding: 0; outline: none; border: 0; background: transparent; font: inherit; color: var(--cr-ink); }
.cr-discovery .cr-search input::placeholder { color: #927e70; }
.cr-discovery .cr-search input::-webkit-search-cancel-button { display: none; }
.cr-discovery .cr-clear { display: inline-grid; place-items: center; flex-shrink: 0; width: 38px; height: 38px; padding: 0; border: 0; border-radius: 50%; background: #f4ede5; color: var(--cr-muted); cursor: pointer; }
.cr-discovery .cr-clear:hover { background: #e9ddcf; }
.cr-discovery .cr-filter-area { margin: 24px 0 28px; min-width: 0; }
.cr-discovery .cr-category-heading { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.cr-discovery .cr-category-heading h2 { font-size: 1rem; margin: 0; color: var(--cr-ink); font-weight: 700; }
.cr-discovery .cr-category-heading span { color: var(--cr-muted); font-size: .78rem; }
.cr-discovery .cr-categories { display: flex; flex-wrap: wrap; align-items: center; gap: 9px; padding: 2px 2px 15px; }
.cr-discovery .cr-category { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 42px; max-width: 100%; padding: 10px 17px; border-radius: 999px; border: 1px solid var(--cr-border); background: #fff; font: inherit; font-size: .87rem; line-height: 1.35; color: var(--cr-muted); font-weight: 550; cursor: pointer; text-align: left; overflow-wrap: anywhere; transition: background .18s, color .18s, border-color .18s; }
.cr-discovery .cr-category svg { flex-shrink: 0; }
.cr-discovery .cr-category:hover:not(:disabled) { border-color: var(--cr-accent); color: var(--cr-accent); }
.cr-discovery .cr-category[aria-pressed='true'] { color: #fff; background: var(--cr-accent); border-color: var(--cr-accent); }
.cr-discovery .cr-category[aria-pressed='true']:hover:not(:disabled) { color: #fff; background: var(--primary-dark, #86381d); }
.cr-discovery .cr-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 13px 15px; border: 1px solid var(--cr-border); border-radius: 15px; background: #fff; min-width: 0; }
.cr-discovery .cr-filter-label { display: inline-flex; align-items: center; gap: 8px; font-size: .85rem; font-weight: 650; color: var(--cr-ink); padding-right: 13px; border-right: 1px solid var(--cr-border); }
.cr-discovery .cr-select { position: relative; flex: 1 1 190px; max-width: 100%; min-width: 0; display: flex; align-items: center; }
.cr-discovery .cr-select > svg { position: absolute; pointer-events: none; color: var(--cr-muted); }
.cr-discovery .cr-select .cr-select-icon { left: 12px; }
.cr-discovery .cr-select .cr-chevron { right: 11px; }
.cr-discovery .cr-select select { display: block; appearance: none; -webkit-appearance: none; width: 100%; max-width: 100%; min-width: 0; height: 43px; padding: 0 32px 0 37px; margin: 0; border: 1px solid var(--cr-border); border-radius: 9px; background: #faf7f3; font: inherit; font-size: .86rem; color: var(--cr-ink); text-overflow: ellipsis; cursor: pointer; box-sizing: border-box; }
.cr-discovery .cr-select select:hover:not(:disabled) { border-color: #bc997d; }
.cr-discovery .cr-select select:disabled, .cr-discovery .cr-category:disabled { opacity: .6; cursor: not-allowed; }
.cr-discovery .cr-reset { display: inline-flex; flex-shrink: 0; align-items: center; gap: 6px; min-height: 40px; border: 0; background: transparent; color: var(--cr-accent); font: inherit; font-size: .83rem; font-weight: 600; cursor: pointer; padding: 6px 8px; border-radius: 8px; }
.cr-discovery .cr-reset:hover { background: #f9f0e8; }
.cr-discovery button:focus-visible, .cr-discovery select:focus-visible { outline: 2px solid var(--cr-accent); outline-offset: 3px; }
.cr-discovery .cr-search button:focus-visible { outline-offset: 2px; }
.cr-discovery .cr-active-filters { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; margin-top: 12px; }
.cr-discovery .cr-active-filters > span { font-size: .78rem; color: var(--cr-muted); }
.cr-discovery .cr-filter-chip { display: inline-flex; align-items: center; gap: 7px; max-width: 100%; padding: 6px 10px; border-radius: 999px; border: 1px solid #ead7c4; background: #f6ede3; color: #78452b; font: inherit; font-size: .79rem; cursor: pointer; overflow-wrap: anywhere; text-align: left; }
.cr-discovery .cr-filter-chip svg { flex-shrink: 0; }
@media (max-width: 700px) {
  .cr-discovery .cr-search { margin-top: 17px; padding-left: 13px; gap: 8px; min-height: 54px; }
  .cr-discovery .cr-search input { font-size: .88rem; }
  .cr-discovery .cr-categories { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: thin; }
  .cr-discovery .cr-category { flex-shrink: 0; max-width: min(75vw, 300px); padding: 9px 14px; }
  .cr-discovery .cr-toolbar { gap: 9px; padding: 12px; }
  .cr-discovery .cr-filter-label { flex: 1 1 100%; border: 0; padding: 0 0 3px; }
  .cr-discovery .cr-select { flex-basis: 150px; }
}
@media (max-width: 420px) { .cr-discovery .cr-select { flex-basis: 100%; } }
@media (prefers-reduced-motion: reduce) { .cr-discovery .cr-category { transition: none; } }
`;

function FilterSelect({ icon: Icon, label, value, onChange, disabled, children }) {
    return (
        <div className="cr-select">
            <Icon className="cr-select-icon" size={16} aria-hidden="true" />
            <select aria-label={label} value={value} onChange={onChange} disabled={disabled}>{children}</select>
            <ChevronDown className="cr-chevron" size={15} aria-hidden="true" />
        </div>
    );
}

function CraftCard({ craft, directoryName, villages, craftPath }) {
    const source = listOf(craft.images).map(imageUrl).find(Boolean) || "";
    const [brokenImage, setBrokenImage] = useState(false);
    useEffect(() => setBrokenImage(false), [source]);
    const locations = [...new Set(villages.map((v) => v.province).filter(Boolean))];

    return (
        <Link to={`${craftPath}/${encodeURIComponent(idOf(craft))}`} className="heritage-card" style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <div className="card-thumb" style={{ background: "#f0e7db" }}>
                {source && !brokenImage ? (
                    <img src={source} alt={craft.name} loading="lazy" onError={() => setBrokenImage(true)} />
                ) : (
                    <div style={{ height: "100%", display: "grid", placeContent: "center", justifyItems: "center", gap: 8, color: "#92765e" }}>
                        <ImageOff size={30} aria-hidden="true" />
                        <span>Chưa có hình ảnh</span>
                    </div>
                )}
                <span className="card-badge" style={{ maxWidth: "calc(100% - 24px)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{directoryName}</span>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", flex: 1, overflowWrap: "anywhere" }}>
                {locations.length > 0 && <span className="card-meta" style={{ display: "flex", alignItems: "center", gap: 5 }}><MapPin size={14} /> {locations.join(" · ")}</span>}
                <h3>{craft.name}</h3>
                <p>{craft.description || craft.history || "Khám phá thông tin về nghề thủ công truyền thống."}</p>
                <div style={{ marginTop: "auto", paddingTop: 16 }}>
                    {villages.length > 0 && <div style={{ fontSize: ".8rem", color: "var(--text-muted)", marginBottom: 12 }}>{villages.slice(0, 2).map((v) => v.name).join(" · ")}{villages.length > 2 ? ` và ${villages.length - 2} làng khác` : ""}</div>}
                    <span style={{ color: "var(--primary)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 7 }}>Tìm hiểu thêm <ArrowRight size={16} /></span>
                </div>
            </div>
        </Link>
    );
}

export default function CraftList({ craftPath = "/crafts" }) {
    const [params, setParams] = useSearchParams();
    const [crafts, setCrafts] = useState([]);
    const [directories, setDirectories] = useState([]);
    const [villages, setVillages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [villageError, setVillageError] = useState(false);
    const [reload, setReload] = useState(0);

    const q = params.get("q") || "";
    const category = params.get("category") || "";
    const regionId = params.get("regionId") || "";
    const villageId = params.get("villageId") || "";
    const rawPage = Number(params.get("page"));
    const requestedPage = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;

    // URL giữ lại bộ lọc khi quay lại từ trang chi tiết.
    const changeFilters = (changes) => {
        const next = new URLSearchParams(params);
        Object.entries(changes).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
        next.delete("page");
        setParams(next, { replace: true });
    };
    const changePage = (page) => {
        const next = new URLSearchParams(params);
        if (page > 1) next.set("page", String(page)); else next.delete("page");
        setParams(next);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        setVillageError(false);
        async function load() {
            try {
                // Danh mục là dữ liệu bắt buộc để lọc các nghề thuộc nhóm đã ẩn.
                const [craftData, directoryData, villageResult] = await Promise.all([
                    craftService.getPublic(),
                    craftService.getPublicDirectories(),
                    villageService.getAll().then((data) => ({ data })).catch(() => ({ failed: true }))
                ]);
                if (cancelled) return;
                setCrafts(listOf(craftData));
                setDirectories(listOf(directoryData));
                setVillages(listOf(villageResult.data));
                setVillageError(Boolean(villageResult.failed));
            } catch (err) {
                if (!cancelled) setError(err?.response?.data?.message || err?.message || "Không thể tải danh sách nghề.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [reload]);

    const activeDirectories = useMemo(() => {
        const active = directories.filter((d) => d.isActive !== false && idOf(d));
        const rootIds = new Set(active.filter((d) => !idOf(d.parentId)).map(idOf));
        return active.filter((d) => !idOf(d.parentId) || rootIds.has(idOf(d.parentId)));
    }, [directories]);
    const directoryMap = useMemo(() => new Map(activeDirectories.map((d) => [idOf(d), d])), [activeDirectories]);
    const villageMap = useMemo(() => new Map(villages.map((v) => [idOf(v), v])), [villages]);
    const directoryOptions = useMemo(() => activeDirectories.filter((d) => !idOf(d.parentId)).sort(sortDirectory).flatMap((root) => [root, ...activeDirectories.filter((d) => idOf(d.parentId) === idOf(root)).sort(sortDirectory)]), [activeDirectories]);
    const directoryName = (id) => {
        const d = directoryMap.get(id);
        const parent = directoryMap.get(idOf(d?.parentId));
        return d ? [parent?.name, d.name].filter(Boolean).join(" › ") : "";
    };
    // Hỗ trợ cả ID và query category theo tên/slug từ trang Home cũ.
    const selectedDirectory = directoryMap.get(category) || activeDirectories.find((d) => normalize(d.name) === normalize(category) || d.slug === category);
    const selectedDirectoryId = idOf(selectedDirectory);

    const publicCrafts = useMemo(() => crafts.filter((c) => c.isPublished === true && c.isDeleted !== true && directoryMap.has(idOf(c.directoryId)) && idOf(c)), [crafts, directoryMap]);
    const craftVillages = (craft) => listOf(craft.villageIds).map((v) => villageMap.get(idOf(v))).filter(Boolean);
    const relatedVillageIds = useMemo(() => new Set(publicCrafts.flatMap((c) => listOf(c.villageIds).map(idOf))), [publicCrafts]);
    const relatedVillages = useMemo(() => villages.filter((v) => relatedVillageIds.has(idOf(v))).sort(byName), [villages, relatedVillageIds]);
    const regionOptions = useMemo(() => {
        const map = new Map();
        relatedVillages.forEach((v) => { if (idOf(v.regionId) && (v.regionId?.name || v.regionName)) map.set(idOf(v.regionId), { _id: idOf(v.regionId), name: v.regionId?.name || v.regionName }); });
        return [...map.values()].sort(byName);
    }, [relatedVillages]);
    const villageOptions = relatedVillages.filter((v) => !regionId || idOf(v.regionId) === regionId);
    const needle = normalize(q);
    const filtered = publicCrafts.filter((craft) => {
        const directoryId = idOf(craft.directoryId);
        const linked = craftVillages(craft);
        if (category && (!selectedDirectoryId || (directoryId !== selectedDirectoryId && idOf(directoryMap.get(directoryId)?.parentId) !== selectedDirectoryId))) return false;
        if (regionId || villageId) {
            if (!linked.some((v) => (!regionId || idOf(v.regionId) === regionId) && (!villageId || idOf(v) === villageId))) return false;
        }
        return !needle || normalize([craft.name, craft.description, directoryName(directoryId), ...linked.flatMap((v) => [v.name, v.province, v.commune])].filter(Boolean).join(" ")).includes(needle);
    });
    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const page = Math.min(requestedPage, pageCount);
    const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const hasFilters = Boolean(q || category || regionId || villageId);
    const roots = directoryOptions.filter((d) => !idOf(d.parentId));
    const selectedRootId = idOf(selectedDirectory?.parentId) || selectedDirectoryId;
    const childOptions = selectedRootId ? directoryOptions.filter((d) => idOf(d.parentId) === selectedRootId) : [];
    const filterChips = [
        q && { key: "q", label: `Từ khóa: ${q}`, changes: { q: "" } },
        category && { key: "category", label: selectedDirectory ? directoryName(selectedDirectoryId) : "Nhóm nghề không khả dụng", changes: { category: "" } },
        regionId && { key: "regionId", label: regionOptions.find((r) => idOf(r) === regionId)?.name || "Vùng miền không khả dụng", changes: { regionId: "", villageId: "" } },
        villageId && { key: "villageId", label: villageMap.get(villageId)?.name || "Làng nghề không khả dụng", changes: { villageId: "" } }
    ].filter(Boolean);

    return (
        <div className="container page-wrap cr-discovery">
            <style>{craftDiscoveryStyles}</style>
            <section className="cr-intro" aria-labelledby="craft-discovery-heading">
                <h1 id="craft-discovery-heading">Khám phá nghề thủ công truyền thống</h1>
                <p>Tìm hiểu lịch sử, kỹ thuật chế tác và tinh hoa của các nghề thủ công truyền thống Việt Nam.</p>
                <div className="cr-search" role="search" aria-label="Tìm nghề thủ công">
                    <Search size={23} aria-hidden="true" />
                    <input type="search" aria-label="Tìm kiếm nghề thủ công" placeholder="Bạn muốn khám phá nghề gì?" value={q} onChange={(e) => changeFilters({ q: e.target.value })} />
                    {q && <button type="button" className="cr-clear" aria-label="Xóa từ khóa" onClick={() => changeFilters({ q: "" })}><X size={19} /></button>}
                </div>
            </section>

            <section className="cr-filter-area" aria-label="Bộ lọc nghề thủ công">
                <div className="cr-category-heading">
                    <h2>Khám phá theo nhóm nghề</h2>
                    <span>{!loading && !error ? `${roots.length} nhóm nghề` : ""}</span>
                </div>
                <div className="cr-categories" role="group" aria-label="Nhóm nghề chính">
                    <button type="button" className="cr-category" aria-pressed={!category} disabled={loading || !!error} onClick={() => changeFilters({ category: "" })}><LayoutGrid size={16} aria-hidden="true" /> Tất cả</button>
                    {roots.map((root) => (
                        <button key={idOf(root)} type="button" className="cr-category" aria-pressed={selectedRootId === idOf(root)} disabled={loading || !!error} onClick={() => changeFilters({ category: idOf(root) })}>{root.name}</button>
                    ))}
                </div>
                <div className="cr-toolbar">
                    <span className="cr-filter-label"><SlidersHorizontal size={18} aria-hidden="true" /> Bộ lọc</span>
                    {childOptions.length > 0 && (
                        <FilterSelect icon={Layers3} label="Lọc nhóm nghề trực thuộc" value={idOf(selectedDirectory?.parentId) ? selectedDirectoryId : ""} onChange={(e) => changeFilters({ category: e.target.value || selectedRootId })} disabled={loading || !!error}>
                            <option value="">Tất cả nhóm trực thuộc</option>
                            {childOptions.map((d) => <option key={idOf(d)} value={idOf(d)}>{d.name}</option>)}
                        </FilterSelect>
                    )}
                    <FilterSelect icon={MapPin} label="Lọc theo vùng miền" value={regionId} onChange={(e) => changeFilters({ regionId: e.target.value, villageId: "" })} disabled={loading || villageError || !!error}>
                        <option value="">Tất cả vùng miền</option>
                        {regionId && !regionOptions.some((r) => idOf(r) === regionId) && <option value={regionId}>Vùng miền không khả dụng</option>}
                        {regionOptions.map((r) => <option key={idOf(r)} value={idOf(r)}>{r.name}</option>)}
                    </FilterSelect>
                    <FilterSelect icon={Compass} label="Lọc theo làng nghề" value={villageId} onChange={(e) => changeFilters({ villageId: e.target.value })} disabled={loading || villageError || !!error}>
                        <option value="">Tất cả làng nghề</option>
                        {villageId && !villageOptions.some((v) => idOf(v) === villageId) && <option value={villageId}>Làng nghề không khả dụng</option>}
                        {villageOptions.map((v) => <option key={idOf(v)} value={idOf(v)}>{v.name}</option>)}
                    </FilterSelect>
                    {hasFilters && <button type="button" className="cr-reset" onClick={() => setParams({})}><RotateCcw size={15} aria-hidden="true" /> Xóa bộ lọc</button>}
                </div>
                {filterChips.length > 0 && <div className="cr-active-filters" aria-label="Bộ lọc đang áp dụng">
                    <span>Đang lọc:</span>
                    {filterChips.map((item) => <button type="button" key={item.key} className="cr-filter-chip" aria-label={`Bỏ lọc ${item.label}`} onClick={() => changeFilters(item.changes)}>{item.label}<X size={13} aria-hidden="true" /></button>)}
                </div>}
            </section>
            {villageError && !loading && !error && <p role="status" style={{ color: "var(--text-muted)", marginBottom: 18 }}>Chưa tải được dữ liệu làng nghề và vùng miền. <button type="button" className="btn-outline" onClick={() => setReload((n) => n + 1)}>Thử lại</button></p>}
            {loading ? <Loading text="Đang tải nghề thủ công..." /> : error ? (
                <div className="form-card" role="alert" style={{ textAlign: "center", alignItems: "center" }}><h3>Không thể tải dữ liệu</h3><p>{error}</p><button type="button" className="btn-outline" onClick={() => setReload((n) => n + 1)}><RotateCcw size={16} /> Thử lại</button></div>
            ) : (
                <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                        <h2 style={{ margin: 0, fontSize: "1.3rem" }}>Danh sách nghề thủ công</h2>
                        <span role="status" style={{ color: "var(--text-muted)" }}>Tìm thấy {filtered.length} nghề</span>
                    </div>
                    {visible.length ? <div className="cards-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))" }}>
                        {visible.map((craft) => <CraftCard key={idOf(craft)} craft={craft} craftPath={craftPath} directoryName={directoryName(idOf(craft.directoryId))} villages={craftVillages(craft)} />)}
                    </div> : <div className="form-card" style={{ textAlign: "center", padding: "44px 20px", alignItems: "center" }}><Search size={30} aria-hidden="true" /><h3>{hasFilters ? "Không tìm thấy nghề phù hợp" : "Chưa có nghề thủ công được công khai"}</h3><p style={{ color: "var(--text-muted)" }}>{hasFilters ? "Hãy thử từ khóa hoặc bộ lọc khác." : "Vui lòng quay lại sau."}</p>{hasFilters && <button type="button" className="btn-outline" onClick={() => setParams({})}>Xóa bộ lọc</button>}</div>}
                    {filtered.length > 0 && <nav aria-label="Phân trang nghề thủ công" style={{ marginTop: 28, display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 12 }}>
                        <button type="button" className="btn-outline" disabled={page === 1} onClick={() => changePage(page - 1)}><ChevronLeft size={16} /> Trang trước</button>
                        <span style={{ color: "var(--text-muted)" }}>Trang {page}/{pageCount}</span>
                        <button type="button" className="btn-outline" disabled={page >= pageCount} onClick={() => changePage(page + 1)}>Trang sau <ChevronRight size={16} /></button>
                    </nav>}
                </>
            )}
        </div>
    );
}
