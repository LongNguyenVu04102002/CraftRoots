// TRANG CHI TIẾT NGHỀ THỦ CÔNG CÔNG KHAI
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, ImageOff, MapPin, FolderTree, BookOpen, Hammer, Layers3, ExternalLink, RotateCcw } from "lucide-react";
import { craftService } from "../../services/craftService";
import { villageService } from "../../services/villageService";
import api from "../../services/api";
import Loading from "../../components/Loading";

const list = (value) => Array.isArray(value) ? value : [];
const idOf = (value) => String(value?._id ?? value ?? "");
const clean = (value) => typeof value === "string" ? value.trim() : "";
const texts = (value) => list(value).map(clean).filter(Boolean);

// Dùng cùng địa chỉ Backend với Axios, không ghi cứng thêm một port khác.
function imageUrl(value) {
    const url = clean(value);
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    if (/^\/?uploads\//i.test(url)) {
        try {
            const base = new URL(api.defaults.baseURL || "/api", window.location.origin);
            return new URL("/" + url.replace(/^\/+/, ""), base.origin).href;
        } catch { return ""; }
    }
    return url.startsWith("/") && !url.startsWith("//") ? url : "";
}

function referenceUrl(value) {
    try {
        const url = new URL(value);
        return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch { return ""; }
}

const styles = `
.cr-detail { --cd-ink: var(--text-dark, #291b13); --cd-muted: var(--text-muted, #786557); --cd-accent: var(--primary, #a64b2a); --cd-line: var(--border, #e5d5c5); color: var(--cd-ink); }
.cr-detail *, .cr-detail *::before, .cr-detail *::after { box-sizing: border-box; }
.cr-detail .cd-back { display: inline-flex; align-items: center; gap: 7px; color: var(--cd-accent); font-size: .9rem; font-weight: 600; text-decoration: none; margin-bottom: 18px; }
.cr-detail .cd-back:hover, .cr-detail .cd-link:hover { text-decoration: underline; }
.cr-detail .cd-breadcrumb { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; color: var(--cd-muted); font-size: .82rem; margin-bottom: 15px; overflow-wrap: anywhere; }
.cr-detail .cd-breadcrumb a { color: var(--cd-muted); text-decoration: none; }
.cr-detail .cd-heading { margin: 0 0 20px; }
.cr-detail .cd-heading h1 { margin: 10px 0 12px; font-family: inherit; font-size: clamp(1.75rem, 3.5vw, 2.6rem); line-height: 1.25; letter-spacing: normal; color: var(--cd-ink); overflow-wrap: anywhere; }
.cr-detail .cd-category { display: inline-flex; align-items: center; gap: 7px; max-width: 100%; border: 1px solid var(--cd-line); border-radius: 99px; padding: 7px 12px; background: #fff; color: var(--cd-accent); font-size: .82rem; font-weight: 600; text-decoration: none; overflow-wrap: anywhere; }
.cr-detail .cd-meta { display: flex; align-items: flex-start; gap: 6px; color: var(--cd-muted); font-size: .9rem; line-height: 1.6; }
.cr-detail svg { flex-shrink: 0; }
.cr-detail .cd-layout { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 24px; align-items: start; }
.cr-detail .cd-main, .cr-detail .cd-aside { display: grid; gap: 20px; min-width: 0; }
.cr-detail .cd-panel { background: #fff; border: 1px solid var(--cd-line); border-radius: 16px; padding: 24px; min-width: 0; overflow-wrap: anywhere; }
.cr-detail .cd-panel h2 { display: flex; align-items: center; gap: 9px; font-family: inherit; font-size: 1.2rem; line-height: 1.4; margin: 0 0 14px; }
.cr-detail .cd-panel h2 svg { color: var(--cd-accent); }
.cr-detail .cd-prose { white-space: pre-wrap; line-height: 1.85; color: var(--cd-ink); margin: 0; font-size: .97rem; }
.cr-detail .cd-empty { margin: 0; color: var(--cd-muted); line-height: 1.6; font-size: .88rem; }
.cr-detail .cd-gallery { min-width: 0; }
.cr-detail .cd-cover { position: relative; overflow: hidden; border-radius: 16px; background: #efe6da; aspect-ratio: 16 / 10; border: 1px solid var(--cd-line); }
.cr-detail .cd-photo { display: block; width: 100%; height: 100%; object-fit: cover; }
.cr-detail .cd-cover .cd-photo { object-fit: contain; }
.cr-detail .cd-placeholder { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; background: #efe6da; color: #8e7460; font-size: .85rem; text-align: center; padding: 12px; }
.cr-detail .cd-arrow { position: absolute; top: 50%; transform: translateY(-50%); display: grid; place-items: center; width: 40px; height: 40px; padding: 0; background: #fff; color: var(--cd-ink); border: 1px solid var(--cd-line); border-radius: 50%; cursor: pointer; box-shadow: 0 2px 10px #0002; }
.cr-detail .cd-prev { left: 12px; } .cr-detail .cd-next { right: 12px; }
.cr-detail .cd-count { position: absolute; right: 12px; bottom: 12px; background: #292018cc; color: white; border-radius: 99px; padding: 6px 12px; font-size: .8rem; }
.cr-detail .cd-thumbs { display: flex; gap: 9px; overflow-x: auto; padding: 8px 3px 5px; }
.cr-detail .cd-thumb { flex: 0 0 88px; height: 66px; border: 2px solid transparent; border-radius: 9px; padding: 2px; background: transparent; cursor: pointer; overflow: hidden; }
.cr-detail .cd-thumb[aria-pressed='true'] { border-color: var(--cd-accent); }
.cr-detail .cd-thumb .cd-photo, .cr-detail .cd-thumb .cd-placeholder { border-radius: 5px; }
.cr-detail .cd-thumb .cd-placeholder { padding: 0; } .cr-detail .cd-thumb .cd-placeholder span { display: none; }
.cr-detail button:focus-visible, .cr-detail a:focus-visible { outline: 2px solid var(--cd-accent); outline-offset: 3px; }
.cr-detail .cd-tags { display: flex; flex-wrap: wrap; gap: 8px; margin: 0; padding: 0; list-style: none; }
.cr-detail .cd-tags li { background: #f7f1ea; border: 1px solid var(--cd-line); border-radius: 9px; padding: 8px 12px; font-size: .88rem; max-width: 100%; overflow-wrap: anywhere; }
.cr-detail .cd-steps { list-style: none; padding: 0; margin: 0; }
.cr-detail .cd-step { display: grid; grid-template-columns: 36px minmax(0,1fr); gap: 14px; position: relative; padding-bottom: 24px; }
.cr-detail .cd-step:last-child { padding-bottom: 0; }
.cr-detail .cd-step:not(:last-child)::before { content: ''; position: absolute; width: 1px; background: var(--cd-line); left: 17px; top: 36px; bottom: 0; }
.cr-detail .cd-step-no { width: 36px; height: 36px; display: grid; place-items: center; background: #f3e5d7; border-radius: 50%; color: var(--cd-accent); font-weight: 700; }
.cr-detail .cd-step h3 { font-family: inherit; font-size: 1rem; margin: 5px 0 8px; }
.cr-detail .cd-step-image { max-width: 480px; aspect-ratio: 16 / 10; overflow: hidden; border-radius: 10px; margin-top: 12px; border: 1px solid var(--cd-line); }
.cr-detail .cd-villages { display: grid; gap: 12px; }
.cr-detail .cd-village { display: flex; align-items: center; gap: 12px; padding: 10px; border: 1px solid var(--cd-line); border-radius: 11px; color: var(--cd-ink); text-decoration: none; min-width: 0; }
.cr-detail a.cd-village:hover { border-color: var(--cd-accent); }
.cr-detail .cd-village-photo { flex: 0 0 74px; height: 65px; border-radius: 8px; overflow: hidden; }
.cr-detail .cd-village-photo .cd-placeholder span { display: none; }
.cr-detail .cd-village-content { flex: 1; min-width: 0; }
.cr-detail .cd-village-content strong { display: block; font-size: .92rem; margin-bottom: 5px; }
.cr-detail .cd-village-content span { display: block; font-size: .8rem; color: var(--cd-muted); }
.cr-detail .cd-link { color: var(--cd-accent); text-decoration: none; overflow-wrap: anywhere; }
.cr-detail .cd-references { padding-left: 20px; margin: 0; display: grid; gap: 9px; font-size: .9rem; line-height: 1.6; }
.cr-detail .cd-status { padding: 42px 24px; text-align: center; }
.cr-detail .cd-status h1 { font-family: inherit; font-size: 1.5rem; margin: 0 0 12px; }
.cr-detail .cd-status-actions { display: flex; justify-content: center; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
@media (max-width: 850px) { .cr-detail .cd-layout { grid-template-columns: 1fr; gap: 20px; } }
@media (max-width: 520px) { .cr-detail .cd-panel { padding: 17px; } .cr-detail .cd-cover { aspect-ratio: 4 / 3; } .cr-detail .cd-arrow { width: 34px; height: 34px; } .cr-detail .cd-thumb { flex-basis: 72px; height: 56px; } }
`;

function Photo({ url, alt, lazy = true }) {
    const [failed, setFailed] = useState(false);
    useEffect(() => setFailed(false), [url]);
    if (!url || failed) return <div className="cd-placeholder"><ImageOff size={28} aria-hidden="true" /><span>Chưa có hình ảnh</span></div>;
    return <img className="cd-photo" src={url} alt={alt} loading={lazy ? "lazy" : "eager"} onError={() => setFailed(true)} />;
}

function Gallery({ images, name }) {
    const [index, setIndex] = useState(0);
    const current = Math.min(index, Math.max(images.length - 1, 0));
    const move = (delta) => setIndex((current + delta + images.length) % images.length);
    return <section className="cd-gallery" aria-label="Thư viện hình ảnh nghề thủ công">
        <div className="cd-cover">
            <Photo key={images[current] || "empty"} url={images[current]} alt={`${name} – ảnh ${current + 1}`} lazy={false} />
            {images.length > 1 && <>
                <button type="button" className="cd-arrow cd-prev" aria-label="Ảnh trước" onClick={() => move(-1)}><ChevronLeft size={22} /></button>
                <button type="button" className="cd-arrow cd-next" aria-label="Ảnh tiếp theo" onClick={() => move(1)}><ChevronRight size={22} /></button>
                <span className="cd-count" aria-live="polite">{current + 1} / {images.length}</span>
            </>}
        </div>
        {images.length > 1 && <div className="cd-thumbs" aria-label="Chọn ảnh">
            {images.map((url, i) => <button type="button" key={url} className="cd-thumb" aria-label={`Xem ảnh ${i + 1}`} aria-pressed={i === current} onClick={() => setIndex(i)}><Photo url={url} alt="" /></button>)}
        </div>}
    </section>;
}

function TextSection({ title, icon: Icon, value }) {
    return <section className="cd-panel"><h2>{Icon && <Icon size={21} aria-hidden="true" />}{title}</h2>
        {clean(value) ? <p className="cd-prose">{value}</p> : <p className="cd-empty">Thông tin đang được cập nhật.</p>}
    </section>;
}

function TagSection({ title, icon: Icon, values }) {
    const items = texts(values);
    return <section className="cd-panel"><h2><Icon size={20} aria-hidden="true" />{title}</h2>
        {items.length ? <ul className="cd-tags">{items.map((value, i) => <li key={`${i}-${value}`}>{value}</li>)}</ul> : <p className="cd-empty">Thông tin đang được cập nhật.</p>}
    </section>;
}

// craftPath và villagePath được truyền từ AppRoutes để dùng chung cho các vai trò.
export default function CraftDetail({ craftPath = "/crafts", villagePath = "/user/villages" }) {
    const { id } = useParams();
    const [reload, setReload] = useState(0);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true); setResult(null); setError(null);
        window.scrollTo({ top: 0, behavior: "instant" });
        async function load() {
            try {
                const [craft, directories, villageResult] = await Promise.all([
                    craftService.getDetail(id),
                    craftService.getPublicDirectories(),
                    villageService.getAll().then(data => ({ data })).catch(() => ({ failed: true }))
                ]);
                if (cancelled) return;
                const active = list(directories).filter(d => d && d.isActive !== false && idOf(d));
                const roots = new Set(active.filter(d => !idOf(d.parentId)).map(idOf));
                const map = new Map(active.filter(d => !idOf(d.parentId) || roots.has(idOf(d.parentId))).map(d => [idOf(d), d]));
                const directory = map.get(idOf(craft?.directoryId));
                if (!craft || craft.isPublished !== true || craft.isDeleted === true || !directory) {
                    setError({ notFound: true }); return;
                }
                const villageMap = new Map(list(villageResult.data).filter(Boolean).map(v => [idOf(v), v]));
                // Chỉ hiển thị làng nghề xuất hiện trong API công khai.
                const villages = [...new Set(list(craft.villageIds).map(idOf))].map(v => villageMap.get(v)).filter(Boolean);
                const parent = map.get(idOf(directory.parentId));
                setResult({ id, craft, directory, parent, villages, villageError: !!villageResult.failed });
            } catch (err) {
                if (!cancelled) setError({ notFound: [400,404].includes(err?.response?.status ?? err?.status), message: "Không thể tải thông tin nghề thủ công. Vui lòng thử lại." });
            } finally { if (!cancelled) setLoading(false); }
        }
        load();
        return () => { cancelled = true; };
    }, [id, reload]);

    const craft = result?.id === id ? result.craft : null;
    const directoryName = [result?.parent?.name, result?.directory?.name].filter(Boolean).join(" › ");
    const images = [...new Set(list(craft?.images).map(imageUrl).filter(Boolean))];
    const steps = list(craft?.processSteps).filter(s => s && clean(s.title)).map((s, i) => ({ ...s, index: i })).sort((a,b) => (Number(a.order) || 0) - (Number(b.order) || 0) || a.index - b.index);
    const references = texts(craft?.sourceReferences);
    const villages = result?.villages || [];
    const locations = [...new Set(villages.map(v => v.province).filter(Boolean))];

    return <div className="container page-wrap cr-detail">
        <style>{styles}</style>
        <Link className="cd-back" to={craftPath}><ArrowLeft size={18} /> Quay lại danh sách nghề</Link>
        {loading || (result && result.id !== id) ? <Loading text="Đang tải chi tiết nghề thủ công..." /> : error || !craft ? (
            <section className="cd-panel cd-status" role="status">
                <h1>{error?.notFound ? "Không tìm thấy nghề thủ công" : "Không thể tải thông tin"}</h1>
                <p className="cd-empty">{error?.notFound ? "Nghề này không tồn tại hoặc hiện không được công khai." : error?.message || "Vui lòng thử lại."}</p>
                <div className="cd-status-actions"><Link className="btn-outline" to={craftPath}>Về danh sách nghề</Link>{!error?.notFound && <button className="btn-outline" type="button" onClick={() => setReload(n => n + 1)}><RotateCcw size={16} /> Thử lại</button>}</div>
            </section>
        ) : <>
            <nav className="cd-breadcrumb" aria-label="Đường dẫn trang"><Link to={craftPath}>Nghề thủ công</Link><ChevronRight size={14} /><span aria-current="page">{craft.name}</span></nav>
            <header className="cd-heading">
                <Link className="cd-category" to={`${craftPath}?category=${encodeURIComponent(idOf(result.directory))}`}><FolderTree size={16} />{directoryName}</Link>
                <h1>{craft.name}</h1>
                {locations.length > 0 && <div className="cd-meta"><MapPin size={17} />{locations.join(" · ")}</div>}
            </header>
            <div className="cd-layout">
                <div className="cd-main">
                    <Gallery key={id} images={images} name={craft.name} />
                    <TextSection title="Giới thiệu nghề" value={craft.description} />
                    <TextSection title="Lịch sử hình thành và phát triển" icon={BookOpen} value={craft.history} />
                    <section className="cd-panel"><h2><Layers3 size={21} /> Quy trình chế tác</h2>
                        {steps.length ? <ol className="cd-steps">{steps.map((step, i) => <li className="cd-step" key={step._id || step.index}>
                            <span className="cd-step-no">{i + 1}</span><div><h3>{step.title}</h3>{clean(step.description) && <p className="cd-prose">{step.description}</p>}{imageUrl(step.imageUrl) && <div className="cd-step-image"><Photo url={imageUrl(step.imageUrl)} alt={step.title} /></div>}</div>
                        </li>)}</ol> : <p className="cd-empty">Quy trình chế tác đang được cập nhật.</p>}
                    </section>
                    <section className="cd-panel"><h2><BookOpen size={21} /> Nguồn tư liệu tham khảo</h2>
                        {references.length ? <ul className="cd-references">{references.map((ref, i) => <li key={i}>{referenceUrl(ref) ? <a className="cd-link" href={referenceUrl(ref)} target="_blank" rel="noopener noreferrer">{ref} <ExternalLink size={13} aria-hidden="true" /></a> : ref}</li>)}</ul> : <p className="cd-empty">Nguồn tư liệu đang được cập nhật.</p>}
                    </section>
                </div>
                <aside className="cd-aside" aria-label="Thông tin nghề và làng nghề liên quan">
                    <TagSection title="Nguyên liệu" icon={Layers3} values={craft.materials} />
                    <TagSection title="Công cụ sử dụng" icon={Hammer} values={craft.tools} />
                    <section className="cd-panel"><h2><MapPin size={21} /> Làng nghề liên quan</h2>
                        {result.villageError ? <><p className="cd-empty">Chưa tải được danh sách làng nghề.</p><button type="button" className="btn-outline" style={{ marginTop: 12 }} onClick={() => setReload(n => n + 1)}>Thử lại</button></> : villages.length ? <div className="cd-villages">{villages.map(v => {
                            const content = <><div className="cd-village-photo"><Photo url={imageUrl(v.mainImage || v.thumbnail)} alt={v.name} /></div><div className="cd-village-content"><strong>{v.name}</strong><span>{[v.commune, v.province].filter(Boolean).join(", ")}</span></div>{v.slug && <ArrowRight size={17} />}</>;
                            return v.slug ? <Link key={idOf(v)} className="cd-village" to={`${villagePath}/${encodeURIComponent(v.slug)}`}>{content}</Link> : <div key={idOf(v)} className="cd-village">{content}</div>;
                        })}</div> : <p className="cd-empty">Chưa có làng nghề công khai được liên kết.</p>}
                    </section>
                </aside>
            </div>
        </>}
    </div>;
}
