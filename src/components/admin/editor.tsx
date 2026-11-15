"use client";
import Image from "next/image";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { contentSchema, copyLabels, imageKeys, imageLabels, type SiteContent } from "@/lib/content-schema";
import PhotoField, { uploadImage } from "./photo-field";
import LogoSizeControl from "./logo-size-control";
import FooterLogoField from "./footer-logo-field";
import { campaignPhotos } from "@/lib/image-library";
import { ADMIN_LOGIN_PATH } from "@/lib/admin-routes";
import TypographyEditor, { type AdminAppearance } from "./typography-editor";
import { findFont, fontFaceCSS, fontFamily } from "@/lib/font-library";

const tabs = [ ["prices", "Bảng giá"], ["products", "Sản phẩm & bộ sưu tập"], ["images", "Ảnh website"], ["texts", "Nội dung & thông báo"], ["typography", "Kiểu chữ"], ["settings", "Cửa hàng & SEO"] ] as const;
type Tab = typeof tabs[number][0];
const imagePreviewRatios: Record<typeof imageKeys[number], string> = {
  hero: "16 / 9", introInset: "3 / 4", introPortrait: "4 / 3",
  miniRing: "1 / 1", miniBangle: "1 / 1", craft: "4 / 3",
  spotlightMain: "4 / 5", spotlightDetail: "1 / 1", consultation: "1135 / 1386",
};
type Edit = (recipe: (value: SiteContent) => void) => void;
function Field({ label, value, onChange, multiline = false, type = "text", maxLength = 1600 }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; type?: string; maxLength?: number }) {
  return <label className="ln-admin-field"><span>{label}</span>{multiline ? <textarea rows={3} value={value} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} /> : <input type={type} value={value} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} />}</label>;
}
function Panel({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return <section className="ln-admin-panel"><div className="ln-admin-panel-heading"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>{children}</section>;
}
function move<T>(items: T[], index: number, delta: number) { const to = index + delta; if (to >= 0 && to < items.length) [items[index], items[to]] = [items[to], items[index]]; }

export default function AdminEditor({ initial, initialRevision, username, mode }: { initial: SiteContent; initialRevision: string | null; username: string; mode: "local" | "github" }) {
  const [value, setValue] = useState(initial), [revision, setRevision] = useState(initialRevision), [saved, setSaved] = useState(JSON.stringify(initial));
  const [tab, setTab] = useState<Tab>("prices"), [busy, setBusy] = useState(false), [uploads, setUploads] = useState(0), [notice, setNotice] = useState(""), [error, setError] = useState("");
  const [expired, setExpired] = useState(false), [logoBusy, setLogoBusy] = useState(false);
  const [adminAppearance, setAdminAppearance] = useState<AdminAppearance>({ size: 16 });
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("longnga-admin-typography") ?? "null");
      if (saved && Number.isInteger(saved.size) && saved.size >= 14 && saved.size <= 22) setAdminAppearance({ size: saved.size, font: findFont(saved.font)?.id });
    } catch { /* A blocked or unavailable localStorage uses the standard UI. */ }
  }, []);
  function changeAdminAppearance(next: AdminAppearance) {
    setAdminAppearance(next);
    try { localStorage.setItem("longnga-admin-typography", JSON.stringify(next)); } catch { /* Keep the preference for this visit. */ }
  }
  const dirty = JSON.stringify(value) !== saved;
  const edit: Edit = (recipe) => setValue((current) => { const next = structuredClone(current); recipe(next); return next; });
  const onBusy = (delta: number) => setUploads((count) => count + delta);
  const photoOptions = useMemo(() => Array.from(new Map([
    ...campaignPhotos, ...Object.values(value.images), ...value.products.map((p) => p.photo), ...value.collections.map((p) => p.photo),
  ].map((photo) => [photo.src, { ...photo }])).values()), [value]);

  useEffect(() => {
    const before = (e: BeforeUnloadEvent) => { if (dirty || uploads) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", before); return () => window.removeEventListener("beforeunload", before);
  }, [dirty, uploads]);

  async function save() {
    setError(""); setNotice("");
    const result = contentSchema.safeParse(value);
    if (!result.success) { setError(result.error.issues.slice(0, 5).map((i) => `${i.path.join(".")}: ${i.message}`).join(" · ")); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ value: result.data, revision }) });
      const data = await r.json();
      if (!r.ok) { if (r.status === 401) setExpired(true); throw new Error(data.details?.join(" · ") || data.error || "Không lưu được nội dung."); }
      setValue(data.value); setRevision(data.revision); setSaved(JSON.stringify(data.value)); setExpired(false);
      setNotice("Đã lưu. Website đã nhận nội dung mới; tải lại trang để xem.");
    } catch (e) { setError(e instanceof Error ? e.message : "Không kết nối được máy chủ. Bản đang sửa vẫn còn ở đây."); }
    finally { setBusy(false); }
  }
  async function reload() {
    if (dirty && !window.confirm("Tải bản mới sẽ bỏ những chỉnh sửa chưa lưu ở cửa sổ này. Tiếp tục?")) return;
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/admin/content", { cache: "no-store" }); const data = await r.json();
      if (!r.ok) { if (r.status === 401) setExpired(true); throw new Error(data.error); }
      setValue(data.value); setRevision(data.revision); setSaved(JSON.stringify(data.value)); setExpired(false); setNotice("Đã tải bản mới nhất.");
    } catch (e) { setError(e instanceof Error ? e.message : "Không tải được nội dung."); }
    finally { setBusy(false); }
  }
  async function signOut() {
    if ((dirty || uploads) && !window.confirm("Bạn còn thay đổi chưa lưu. Đăng xuất?")) return;
    setBusy(true); setError("");
    try { const r = await fetch("/api/admin/logout", { method: "POST" }); if (!r.ok) throw new Error("Chưa đăng xuất được. Vui lòng thử lại."); window.location.assign(ADMIN_LOGIN_PATH); }
    catch (e) { setError(e instanceof Error ? e.message : "Không đăng xuất được."); setBusy(false); }
  }
  const count = value.prices.groups.reduce((total, group) => total + group.items.length, 0);
  return <div className={`ln-admin-dashboard${adminAppearance.font ? " ln-admin-custom-font" : ""}`} style={{ "--ln-admin-font-scale": adminAppearance.size / 16, "--ln-admin-custom-font": fontFamily(adminAppearance.font), fontSize: adminAppearance.size } as CSSProperties}>
    <style>{fontFaceCSS([adminAppearance.font])}</style>
    <aside className="ln-admin-sidebar"><a className="ln-admin-logo" href="/" target="_blank" rel="noreferrer">LONG NGA<span>KHÔNG GIAN QUẢN TRỊ</span></a><div className="ln-admin-sidebar-rule" /><nav aria-label="Quản trị">{tabs.map(([key, label]) => <button type="button" key={key} className={tab === key ? "active" : ""} aria-current={tab === key ? "page" : undefined} onClick={() => setTab(key)}>{label}<span aria-hidden="true">↗</span></button>)}</nav><div className="ln-admin-sidebar-bottom"><span className="ln-admin-avatar">{username.slice(0, 1).toUpperCase()}</span><div><strong>{username}</strong><small>Quản trị viên</small></div><button type="button" onClick={signOut} disabled={busy || uploads > 0}>Đăng xuất</button></div></aside>
    <main className="ln-admin-main"><header className="ln-admin-topbar"><div><p className="ln-admin-eyebrow">VÀNG BẠC LONG NGA / QUẢN LÝ WEBSITE</p><h1>{tabs.find((item) => item[0] === tab)?.[1]}</h1></div><a href="/" target="_blank" rel="noreferrer">Xem website ↗</a></header>
      <div className="ln-admin-savebar"><span className={dirty ? "ln-admin-unsaved" : "ln-admin-saved"}>{dirty ? "● Có thay đổi chưa lưu" : "● Nội dung đã đồng bộ"}</span><span className="ln-admin-save-date">{value.updatedAt ? `Lưu gần nhất: ${new Date(value.updatedAt).toLocaleString("vi-VN")}` : "Chưa có lần cập nhật nào"}</span><button type="button" className="ln-admin-secondary" onClick={reload} disabled={busy || uploads > 0}>Tải bản mới</button><button type="button" className="ln-admin-primary" onClick={save} disabled={busy || uploads > 0 || !dirty}>{busy ? "Đang xử lý…" : uploads ? "Đang tải ảnh…" : "Lưu thay đổi"}</button></div>
      {mode === "local" && <div className="ln-admin-local-note">Đang lưu trên máy này. Khi đưa lên Vercel, cần cấu hình kho nội dung bền vững theo hướng dẫn triển khai.</div>}
      <div aria-live="polite">{notice && <p className="ln-admin-success">{notice}</p>}{error && <p className="ln-admin-error" role="alert">{error}</p>}{expired && <p className="ln-admin-notice">Mở <a href={ADMIN_LOGIN_PATH} target="_blank" rel="noreferrer">trang đăng nhập ở tab mới</a>, sau đó quay lại đây để lưu tiếp. Bản đang sửa vẫn được giữ.</p>}</div>
      <fieldset className="ln-admin-editor-fieldset" disabled={busy || uploads > 0}>
      {tab === "prices" && <>
        <div className="ln-admin-stats"><div><strong>{value.prices.groups.length}</strong><span>Nhóm giá</span></div><div><strong>{count}</strong><span>Dòng giá</span></div><div><strong>{value.prices.unit}</strong><span>Đơn vị hiển thị</span></div></div>
        <Panel title="Bảng giá của cửa hàng" description="Để trống giá để hiển thị “Liên hệ”. Nhập số nguyên, ví dụ 8500000." action={<button type="button" className="ln-admin-secondary" disabled={value.prices.groups.length >= 30} onClick={() => edit((c) => { c.prices.groups.push({ id: crypto.randomUUID(), name: "Nhóm giá mới", description: "", items: [] }); })}>+ Thêm nhóm giá</button>}>
          <Field label="Đơn vị tính chung" value={value.prices.unit} maxLength={80} onChange={(unit) => edit((c) => { c.prices.unit = unit; })} />
          {value.prices.groups.length === 0 && <p className="ln-admin-empty">Chưa có nhóm giá. Thêm nhóm để bắt đầu.</p>}
          {value.prices.groups.map((group, gi) => <details className="ln-admin-group" key={group.id} open><summary><span className="ln-admin-group-number">{String(gi + 1).padStart(2, "0")}</span><strong>{group.name || "Nhóm chưa đặt tên"}</strong><small>{group.items.length} dòng giá</small><span aria-hidden="true">⌄</span></summary><div className="ln-admin-group-body"><div className="ln-admin-form-grid"><Field label="Tên nhóm giá" value={group.name} maxLength={160} onChange={(name) => edit((c) => { c.prices.groups[gi].name = name; })} /><Field label="Mô tả nhóm" value={group.description} onChange={(description) => edit((c) => { c.prices.groups[gi].description = description; })} /></div>
            <div className="ln-admin-table-scroll"><table className="ln-admin-price-table"><thead><tr><th>Sản phẩm / loại vàng</th><th>Mua vào</th><th>Bán ra</th><th>Màu ký hiệu</th><th>Thứ tự</th></tr></thead><tbody>{group.items.map((item, ii) => <tr key={item.id}>
              <td><label><span className="sr-only">Tên sản phẩm</span><input aria-label="Tên sản phẩm" value={item.name} maxLength={160} onChange={(e) => edit((c) => { c.prices.groups[gi].items[ii].name = e.target.value; })} /></label><input aria-label="Chi tiết loại vàng" className="ln-admin-small-input" placeholder="Chi tiết, ví dụ Vàng 24K" value={item.detail} maxLength={160} onChange={(e) => edit((c) => { c.prices.groups[gi].items[ii].detail = e.target.value; })} /></td>
              {(["buy", "sell"] as const).map((side) => <td key={side}><input aria-label={`${side === "buy" ? "Mua vào" : "Bán ra"} ${item.name}`} type="number" inputMode="numeric" min="0" max="1000000000000" step="1" placeholder="Liên hệ" value={item[side] ?? ""} onChange={(e) => edit((c) => { c.prices.groups[gi].items[ii][side] = e.target.value === "" ? null : Number(e.target.value); })} /><small>{item[side] === null ? "Liên hệ" : `${new Intl.NumberFormat("vi-VN").format(item[side])} ${value.prices.unit}`}</small></td>)}
              <td><select aria-label="Màu ký hiệu" value={item.tone} onChange={(e) => edit((c) => { c.prices.groups[gi].items[ii].tone = e.target.value as typeof item.tone; })}><option value="gold">Vàng</option><option value="warm">Vàng đậm</option><option value="soft">Vàng nhạt</option><option value="silver">Bạc</option></select></td>
              <td><div className="ln-admin-row-actions"><button type="button" aria-label="Đưa dòng giá lên" disabled={ii === 0} onClick={() => edit((c) => move(c.prices.groups[gi].items, ii, -1))}>↑</button><button type="button" aria-label="Đưa dòng giá xuống" disabled={ii === group.items.length - 1} onClick={() => edit((c) => move(c.prices.groups[gi].items, ii, 1))}>↓</button><button type="button" className="ln-admin-danger" aria-label="Xóa dòng giá" onClick={() => { if (window.confirm(`Xóa dòng “${item.name}”?`)) edit((c) => { c.prices.groups[gi].items.splice(ii, 1); }); }}>×</button></div></td>
            </tr>)}</tbody></table></div>
            <div className="ln-admin-panel-actions"><button type="button" className="ln-admin-secondary" disabled={group.items.length >= 100 || count >= 500} onClick={() => edit((c) => { c.prices.groups[gi].items.push({ id: crypto.randomUUID(), name: "Loại sản phẩm mới", detail: "", buy: null, sell: null, tone: "gold" }); })}>+ Thêm dòng giá</button><div className="ln-admin-row-actions"><button type="button" disabled={gi === 0} onClick={() => edit((c) => move(c.prices.groups, gi, -1))}>↑ Nhóm</button><button type="button" disabled={gi === value.prices.groups.length - 1} onClick={() => edit((c) => move(c.prices.groups, gi, 1))}>↓ Nhóm</button><button type="button" className="ln-admin-danger" onClick={() => { if (window.confirm(`Xóa nhóm “${group.name}” và ${group.items.length} dòng giá?`)) edit((c) => { c.prices.groups.splice(gi, 1); }); }}>Xóa nhóm</button></div></div>
          </div></details>)}
        </Panel>
      </>}
      {tab === "products" && <>
        <Panel title="Sản phẩm nổi bật" description="Hai sản phẩm trong phần “Điểm nhấn của riêng bạn”.">{value.products.map((product, pi) => <details className="ln-admin-group" key={product.id} open={pi === 0}><summary><strong>0{pi + 1} / {product.name}</strong><span aria-hidden="true">⌄</span></summary><div className="ln-admin-group-body"><div className="ln-admin-form-grid"><Field label="Loại sản phẩm" value={product.category} maxLength={160} onChange={(category) => edit((c) => { c.products[pi].category = category; })} /><Field label="Tên sản phẩm" value={product.name} maxLength={160} onChange={(name) => edit((c) => { c.products[pi].name = name; })} /></div><Field label="Mô tả sản phẩm" multiline value={product.description} onChange={(description) => edit((c) => { c.products[pi].description = description; })} /><PhotoField value={product.photo} options={photoOptions} onBusy={onBusy} onChange={(photo) => edit((c) => { c.products[pi].photo = photo; })} /></div></details>)}</Panel>
        <Panel title="Bộ sưu tập" description="Sửa ảnh, tên, lời giới thiệu; thêm, ẩn và sắp xếp các bộ sản phẩm." action={<button type="button" className="ln-admin-secondary" disabled={value.collections.length >= 16} onClick={() => edit((c) => { c.collections.push({ id: crypto.randomUUID(), name: "Bộ sưu tập mới", description: "", visible: true, photo: { ...c.products[0].photo } }); })}>+ Thêm bộ sản phẩm</button>}>
          {value.collections.map((item, ci) => <details className="ln-admin-group" key={item.id}><summary><strong>{String(ci + 1).padStart(2, "0")} / {item.name}</strong><small>{item.visible ? "Đang hiện" : "Đã ẩn"}</small><span aria-hidden="true">⌄</span></summary><div className="ln-admin-group-body"><Field label="Tên bộ sản phẩm" value={item.name} maxLength={160} onChange={(name) => edit((c) => { c.collections[ci].name = name; })} /><Field label="Thông tin bộ sản phẩm" value={item.description} multiline onChange={(description) => edit((c) => { c.collections[ci].description = description; })} /><label className="ln-admin-checkbox"><input type="checkbox" checked={item.visible} onChange={(e) => edit((c) => { c.collections[ci].visible = e.target.checked; })} />Hiển thị trên website</label><PhotoField value={item.photo} options={photoOptions} onBusy={onBusy} onChange={(photo) => edit((c) => { c.collections[ci].photo = photo; })} /><div className="ln-admin-panel-actions"><div className="ln-admin-row-actions"><button type="button" disabled={ci === 0} onClick={() => edit((c) => move(c.collections, ci, -1))}>↑ Đưa lên</button><button type="button" disabled={ci === value.collections.length - 1} onClick={() => edit((c) => move(c.collections, ci, 1))}>↓ Đưa xuống</button></div><button type="button" className="ln-admin-danger" onClick={() => { if (window.confirm(`Xóa bộ “${item.name}”?`)) edit((c) => { c.collections.splice(ci, 1); }); }}>Xóa bộ sản phẩm</button></div></div></details>)}
        </Panel>
      </>}
      {tab === "images" && <Panel title="Hình ảnh trên website" description="Mỗi khu vực có ảnh riêng. Dùng thanh căn chỉnh để chọn phần ảnh muốn giữ trong khung.">
        <details className="ln-admin-group" open><summary><strong>Thư viện ảnh trang sức</strong><span aria-hidden="true">⌄</span></summary><div className="ln-admin-group-body"><p className="ln-admin-caption">Bấm ảnh để xem đầy đủ. Muốn sử dụng, chọn ảnh trong mục “Hoặc chọn từ thư viện ảnh” của sản phẩm hoặc khu vực cần sửa, rồi Lưu thay đổi.</p><div className="ln-admin-library-grid">{campaignPhotos.map((photo) => <a key={photo.src} href={photo.src} target="_blank" rel="noopener noreferrer"><Image src={photo.src} alt={photo.alt} width={256} height={384} unoptimized /><span>{photo.alt}</span></a>)}</div></div></details>
        {imageKeys.map((key) => <details className="ln-admin-group" key={key} open={key === "hero"}><summary><strong>{imageLabels[key]}</strong><span aria-hidden="true">⌄</span></summary><div className="ln-admin-group-body"><PhotoField previewRatio={imagePreviewRatios[key]} fit={key === "miniRing" || key === "miniBangle" ? "contain" : "cover"} value={value.images[key]} options={photoOptions} onBusy={onBusy} onChange={(photo) => edit((c) => { c.images[key] = photo; })} /></div></details>)}
      </Panel>}
      {tab === "texts" && <>
        <Panel title="Thông báo của cửa hàng" description="Thông báo xuất hiện phía trên header khi được bật."><label className="ln-admin-checkbox"><input type="checkbox" checked={value.announcement.enabled} onChange={(e) => edit((c) => { c.announcement.enabled = e.target.checked; })} />Hiển thị thông báo</label><Field label="Nội dung thông báo" multiline value={value.announcement.text} onChange={(text) => edit((c) => { c.announcement.text = text; })} /></Panel>
        <Panel title="Nội dung từng khu vực" description="Xuống dòng trong ô để chia dòng tiêu đề và mô tả.">{Array.from(new Set(Object.values(copyLabels).map((label) => label.split("·")[0].trim()))).map((group) => <details className="ln-admin-group" key={group}><summary><strong>{group}</strong><span aria-hidden="true">⌄</span></summary><div className="ln-admin-group-body ln-admin-form-grid">{(Object.keys(copyLabels) as (keyof typeof copyLabels)[]).filter((key) => copyLabels[key].split("·")[0].trim() === group).map((key) => <Field key={key} label={copyLabels[key]} value={value.copy[key]} multiline onChange={(text) => edit((c) => { c.copy[key] = text; })} />)}</div></details>)}</Panel>
        <Panel title="Câu hỏi tư vấn" action={<button type="button" className="ln-admin-secondary" disabled={value.questions.length >= 15} onClick={() => edit((c) => { c.questions.push({ id: crypto.randomUUID(), title: "Câu hỏi mới", text: "" }); })}>+ Thêm câu hỏi</button>}>{value.questions.map((item, qi) => <div className="ln-admin-question" key={item.id}><Field label={`Câu hỏi ${qi + 1}`} value={item.title} maxLength={160} onChange={(title) => edit((c) => { c.questions[qi].title = title; })} /><Field label="Trả lời" value={item.text} multiline onChange={(text) => edit((c) => { c.questions[qi].text = text; })} /><button type="button" className="ln-admin-danger" onClick={() => { if (window.confirm("Xóa câu hỏi này?")) edit((c) => { c.questions.splice(qi, 1); }); }}>Xóa câu hỏi</button></div>)}</Panel>
        <Panel title="Cam kết của cửa hàng">{value.promises.map((item, pi) => <div className="ln-admin-form-grid ln-admin-question" key={item.kind}><Field label={`Cam kết ${pi + 1}`} value={item.title} maxLength={160} onChange={(title) => edit((c) => { c.promises[pi].title = title; })} /><Field label="Mô tả" value={item.description} onChange={(description) => edit((c) => { c.promises[pi].description = description; })} /></div>)}</Panel>
      </>}
      {tab === "typography" && <TypographyEditor content={value} adminAppearance={adminAppearance} onAdminChange={changeAdminAppearance} onChange={(next) => edit((c) => { if (next) c.typography = next; else delete c.typography; })} />}
      {tab === "settings" && <>
        <Panel title="Thông tin cửa hàng"><div className="ln-admin-form-grid">{([
          ["name", "Tên đầy đủ"], ["shortName", "Tên ngắn / chữ logo"], ["tagline", "Dòng dưới logo"], ["address", "Địa chỉ"], ["phone", "Số điện thoại"], ["email", "Email"], ["facebook", "Liên kết Facebook"], ["zalo", "Liên kết Zalo"], ["maps", "Liên kết Google Maps"],
        ] as const).map(([key, label]) => <Field key={key} label={label} value={value.site[key]} maxLength={key === "maps" ? 2500 : 200} type={key === "email" ? "email" : "text"} onChange={(text) => edit((c) => { c.site[key] = text; })} />)}<label className="ln-admin-field"><span>Vĩ độ vị trí cửa hàng</span><input type="number" min="-90" max="90" step="any" value={value.site.latitude} onChange={(e) => edit((c) => { c.site.latitude = Number(e.target.value); })} /></label><label className="ln-admin-field"><span>Kinh độ vị trí cửa hàng</span><input type="number" min="-180" max="180" step="any" value={value.site.longitude} onChange={(e) => edit((c) => { c.site.longitude = Number(e.target.value); })} /></label></div></Panel>
        <Panel title="Logo thương hiệu" description="Logo dùng cho header; footer dùng chung khi chưa có logo dọc riêng. Khi chưa có ảnh, website dùng tên chữ.">
          {value.site.logo && <LogoSizeControl src={value.site.logo} scale={value.site.logoScale} onChange={(logoScale) => edit((c) => { c.site.logoScale = logoScale; })} />}
          <div className="ln-admin-panel-actions"><label className="ln-admin-upload">{logoBusy ? "Đang tải…" : "↑ Tải logo"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={logoBusy} onChange={async (e) => { const input = e.target, file = input.files?.[0]; if (!file) return; setLogoBusy(true); onBusy(1); setError(""); try { const src = await uploadImage(file); edit((c) => { c.site.logo = src; }); } catch (error) { setError(error instanceof Error ? error.message : "Tải logo thất bại."); } finally { setLogoBusy(false); onBusy(-1); input.value = ""; } }} /></label>{value.site.logo && <button type="button" className="ln-admin-danger" onClick={() => edit((c) => { c.site.logo = ""; })}>Dùng logo chữ</button>}</div>
        </Panel>
        <Panel title="Logo dọc cho footer" description="Tải logo riêng cho phần chân trang và chỉnh kích thước độc lập với logo header.">
          <FooterLogoField src={value.site.footerLogo} scale={value.site.footerLogoScale} fallbackSrc={value.site.logo} fallbackScale={value.site.logoScale} position={value.site} onPositionChange={(next) => edit((c) => { c.site.footerLogoAlign = next.footerLogoAlign; c.site.footerLogoMarginTop = next.footerLogoMarginTop; })} onBusy={onBusy} onChange={(next) => edit((c) => { c.site.footerLogo = next.src; if (next.scale === undefined) delete c.site.footerLogoScale; else c.site.footerLogoScale = next.scale; })} />
        </Panel>
        <Panel title="Hiển thị trên Google (SEO)"><Field label="Tiêu đề website" value={value.site.seoTitle} maxLength={160} onChange={(seoTitle) => edit((c) => { c.site.seoTitle = seoTitle; })} /><Field label="Mô tả website" value={value.site.seoDescription} multiline maxLength={320} onChange={(seoDescription) => edit((c) => { c.site.seoDescription = seoDescription; })} /></Panel>
        <Panel title="Đăng nhập & phiên làm việc"><p>Mật khẩu được băm bằng bcrypt. Phiên hết hạn sau 30 phút không có thao tác với máy chủ, tối đa 8 giờ. Sau 5 lần thử đăng nhập trong 15 phút, tài khoản tạm bị giới hạn.</p><p className="ln-admin-caption">Đổi mật khẩu bằng lệnh thiết lập trên máy chủ. Thay mật khẩu sẽ vô hiệu hóa mọi phiên cũ.</p></Panel>
      </>}
      </fieldset>
      <footer className="ln-admin-footer">LONG NGA / QUẢN TRỊ NỘI DUNG<span>Thay đổi chỉ xuất hiện trên website sau khi bấm Lưu.</span></footer>
    </main>
  </div>;
}
