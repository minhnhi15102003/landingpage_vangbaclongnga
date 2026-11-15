"use client";
import { useId, useMemo, useState } from "react";
import type { SiteContent } from "@/lib/content-schema";
import { findFont, fontFaceCSS, fontFamily, fontOptions, installedFontCount } from "@/lib/font-library";
import { textTargetKeys, textTargets, type TextTarget } from "@/lib/typography-targets";
import type { TextStyle, Typography } from "@/lib/typography-schema";

export type AdminAppearance = { font?: string; size: number };
function searchKey(value: string) { return value.normalize("NFD").toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d"); }
function FontPicker({ label, value, onChange }: { label: string; value?: string; onChange: (id?: string) => void }) {
  const id = useId();
  const [query, setQuery] = useState("");
  const matches = useMemo(() => fontOptions.filter((font) => searchKey(font.label).includes(searchKey(query))), [query]);
  const selected = findFont(value);
  return <div className="ln-admin-font-picker">
    <div className="ln-admin-field"><label className="ln-admin-field-label" htmlFor={id}>{label}</label>
      <input type="search" aria-label={`Tìm ${label.toLowerCase()}`} placeholder="Tìm font: SVN, UTM, iCiel…" value={query} onChange={(event) => setQuery(event.target.value)} />
      <select id={id} value={value ?? ""} onChange={(event) => onChange(event.target.value || undefined)}>
        <option value="">Mặc định theo thiết kế</option>
        {selected && !matches.some((font) => font.id === selected.id) && <option value={selected.id}>{selected.label}</option>}
        {matches.map((font) => <option key={font.id} value={font.id}>{font.label}{font.localOnly ? " · trên máy này" : ""}</option>)}
      </select>
    </div>
    <p className="ln-admin-caption">{matches.length} font phù hợp.{selected?.localOnly ? " Font này dùng bản cài trên máy; máy khác sẽ dùng font dự phòng nếu chưa cài." : ""}</p>
  </div>;
}

function sampleText(content: SiteContent, key: TextTarget) {
  if (key in content.copy) return content.copy[key as keyof SiteContent["copy"]];
  const samples: Partial<Record<TextTarget, string>> = {
    headerBrand: content.site.shortName, headerMenu: "MENU · Bảng giá · Sản phẩm",
    productCategory: content.products[0].category, productName: content.products[0].name, productDescription: content.products[0].description,
    collectionName: content.collections[0]?.name, collectionDescription: content.collections[0]?.description,
    priceGroup: content.prices.groups[0]?.name, priceColumns: "LOẠI SẢN PHẨM · MUA VÀO · BÁN RA",
    priceProduct: content.prices.groups[0]?.items[0]?.name, priceDetail: content.prices.groups[0]?.items[0]?.detail,
    priceValue: "8.500.000", questionTitle: content.questions[0]?.title, questionText: content.questions[0]?.text,
    promiseName: content.promises[0]?.title, promiseDescription: content.promises[0]?.description,
    footerBrand: content.site.shortName, footerHeading: "KHÁM PHÁ", footerLinks: "Bảng giá · Bộ sưu tập",
    footerWordmark: content.site.shortName, announcement: content.announcement.text,
  };
  return samples[key] || "Vàng Bạc Long Nga · Vẻ đẹp bền lâu";
}

export default function TypographyEditor({ content, onChange, adminAppearance, onAdminChange }: {
  content: SiteContent; onChange: (next?: Typography) => void;
  adminAppearance: AdminAppearance; onAdminChange: (next: AdminAppearance) => void;
}) {
  const [key, setKey] = useState<TextTarget>("priceGroup");
  const value = content.typography;
  const current = value?.styles?.[key] ?? {};
  const target = textTargets[key];
  const inherited = target.role === "heading" ? value?.headingFont ?? "oswald" : value?.bodyFont ?? "be-vietnam-pro";
  const family = fontFamily(current.font ?? inherited);
  const groups = [...new Set(textTargetKeys.map((key) => textTargets[key].label.split(" · ")[0]))];
  function update(patch: Partial<TextStyle>) {
    const next = { ...current, ...patch };
    for (const property of Object.keys(next) as (keyof TextStyle)[]) if (next[property] === undefined) delete next[property];
    const styles = { ...value?.styles };
    if (Object.keys(next).length) styles[key] = next;
    else delete styles[key];
    onChange({ ...value, styles });
  }
  return <>
    <style>{fontFaceCSS([value?.headingFont, value?.bodyFont, current.font])}</style>
    <section className="ln-admin-panel">
      <div className="ln-admin-panel-heading"><div><h2>Font chữ của website</h2><p>Đã thêm {installedFontCount} họ font hỗ trợ tiếng Việt từ máy. Font chỉ tải khi được sử dụng.</p></div></div>
      <div className="ln-admin-form-grid">
        <FontPicker label="Font tiêu đề mặc định" value={value?.headingFont} onChange={(headingFont) => onChange({ ...value, headingFont })} />
        <FontPicker label="Font nội dung mặc định" value={value?.bodyFont} onChange={(bodyFont) => onChange({ ...value, bodyFont })} />
      </div>
      <p className="ln-admin-caption">Áp dụng cho toàn website. Các phần đã chọn font riêng sẽ ưu tiên font riêng.</p>
    </section>
    <section className="ln-admin-panel">
      <div className="ln-admin-panel-heading"><div><h2>Chỉnh từng phần chữ</h2><p>Chọn khu vực, chỉnh font và cỡ chữ rồi xem trước. Bấm “Lưu thay đổi” để áp dụng lên website.</p></div></div>
      <label className="ln-admin-field"><span>Phần chữ cần chỉnh</span><select value={key} onChange={(event) => setKey(event.target.value as TextTarget)}>
        {groups.map((group) => <optgroup key={group} label={group}>{textTargetKeys.filter((key) => textTargets[key].label.startsWith(`${group} · `)).map((key) => <option key={key} value={key}>{textTargets[key].label}</option>)}</optgroup>)}
      </select></label>
      <div className="ln-admin-type-grid">
        <div>
          <FontPicker key={key} label="Font riêng cho phần chữ này" value={current.font} onChange={(font) => update({ font })} />
          <div className="ln-admin-form-grid">
            <label className="ln-admin-field"><span>Cỡ chữ máy tính (px)</span><input type="number" min="8" max="800" step="1" placeholder="Theo thiết kế" value={current.size ?? ""} onChange={(event) => update({ size: event.target.value === "" ? undefined : Number(event.target.value) })} /></label>
            <label className="ln-admin-field"><span>Cỡ chữ điện thoại (px)</span><input type="number" min="8" max="800" step="1" placeholder="Theo thiết kế" value={current.mobileSize ?? ""} onChange={(event) => update({ mobileSize: event.target.value === "" ? undefined : Number(event.target.value) })} /></label>
          </div>
          <label className="ln-admin-field"><span>Độ đậm</span><select value={current.weight ?? ""} onChange={(event) => update({ weight: event.target.value ? Number(event.target.value) : undefined })}><option value="">Theo thiết kế</option>{[100,200,300,400,500,600,700,800,900].map((weight) => <option key={weight} value={weight}>{weight}{weight === 400 ? " · Thường" : weight === 700 ? " · Đậm" : ""}</option>)}</select></label>
          <p className="ln-admin-caption">Cỡ chữ từ 8–800 px. Để trống để giữ cỡ chữ tự thích ứng của thiết kế. Xem trước dùng cỡ chữ tham khảo khi chưa có giá trị riêng.</p>
          <button type="button" className="ln-admin-secondary ln-admin-type-reset" onClick={() => update({ font: undefined, size: undefined, mobileSize: undefined, weight: undefined })}>Đặt lại phần chữ này</button>
        </div>
        <div className="ln-admin-type-previews">
          {(["Máy tính", "Điện thoại"] as const).map((label, index) => <div className="ln-admin-type-preview" key={label}><p className="ln-admin-caption">{label} · {(index ? current.mobileSize : current.size) ?? (index ? target.mobile : target.desktop)} px</p><div className="ln-admin-type-sample" style={{ fontFamily: family, fontSize: `${(index ? current.mobileSize : current.size) ?? (index ? target.mobile : target.desktop)}px`, fontWeight: current.weight ?? 400 }}>{sampleText(content, key)}</div></div>)}
          <div className="ln-admin-type-diacritics" style={{ fontFamily: family }}>Tiếng Việt: Ă Â Đ Ê Ô Ơ Ư · Ắ ằ ẫ ễ ộ ớ ừ ỹ · Vàng Bạc Long Nga</div>
        </div>
      </div>
      <div className="ln-admin-panel-actions"><span className="ln-admin-caption">Chưa chọn font/cỡ chữ mới thì website giữ thiết kế hiện tại.</span><button type="button" className="ln-admin-secondary" onClick={() => onChange(undefined)}>Khôi phục toàn bộ kiểu chữ website</button></div>
    </section>
    <section className="ln-admin-panel">
      <div className="ln-admin-panel-heading"><div><h2>Chữ trong trang quản lý</h2><p>Áp dụng ngay và ghi nhớ trên trình duyệt này.</p></div></div>
      <div className="ln-admin-form-grid">
        <FontPicker label="Font giao diện quản lý" value={adminAppearance.font} onChange={(font) => onAdminChange({ ...adminAppearance, font })} />
        <div><label className="ln-admin-range"><span>Cỡ chữ cơ bản · {adminAppearance.size}px</span><input type="range" min="14" max="22" step="1" value={adminAppearance.size} onChange={(event) => onAdminChange({ ...adminAppearance, size: Number(event.target.value) })} /></label><button type="button" className="ln-admin-secondary" onClick={() => onAdminChange({ size: 16 })}>Đặt lại giao diện quản lý</button></div>
      </div>
    </section>
  </>;
}
